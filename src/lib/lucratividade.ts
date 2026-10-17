import { formatarDecimal, formatarMoeda } from "@/lib/formatacao";
import {
  KG_POR_ARROBA,
  RENDIMENTO_CARCACA_PADRAO,
  calcularGmd,
  diasEntre,
  kgParaArroba,
} from "@/lib/pesagens";

export type TipoVenda = "peso_vivo" | "peso_morto";

/** Dados agregados do lote — sem inputs de projeção do usuário. */
export type LoteLucratividadeBase = {
  lote_id: string;
  lote_nome: string;
  qtd_cabecas: number;
  /** Data de entrada mais antiga entre os ativos (conservadora no giro). */
  data_entrada_ref: string | null;
  peso_entrada_medio: number | null;
  peso_atual_medio: number | null;
  custo_aquisicao_total: number;
  /** Lançamentos de alimentação e outros. O custo da pesagem não entra de novo. */
  custo_suplementacao_ate_hoje: number;
  /** Soma dos lançamentos de sanidade do lote. */
  custo_sanidade_ate_hoje: number;
  hoje: string;
};

export type InputsProjecao = {
  dias_giro_planejados: number | null;
  tipo_venda: TipoVenda;
  /**
   * R$/@ — em peso_vivo é @ viva (30 kg PV);
   * em peso_morto é @ de carcaça (15 kg carcaça / rendimento).
   */
  preco_arroba: number | null;
  /** Rendimento de carcaça em % (ex.: 50). Só usado em peso_morto. */
  rendimento_carcaca_pct: number | null;
  outros_custos: number | null;
};

export type MetricasRealizadas = {
  dias_giro: number | null;
  gmd: number | null;
  custo_aquisicao_total: number;
  custo_suplementacao_ate_hoje: number;
  custo_sanidade_ate_hoje: number;
  outros_custos: number;
  custo_total_acumulado: number;
};

/** Inputs de preço/tipo usados no lucro realizado (peso atual, sem ganho futuro). */
export type InputsPrecoReferencia = {
  tipo_venda: TipoVenda;
  preco_arroba: number | null;
  rendimento_carcaca_pct: number | null;
  outros_custos: number | null;
};

export type ResultadoLucroRealizado = {
  peso_atual_total_kg: number | null;
  arrobas_atuais: number | null;
  valor_mercado_hoje: number | null;
  lucro_liquido: number | null;
  lucro_por_cabeca: number | null;
  margem_pct: number | null;
};

export type ResultadoProjecao = {
  dias_restantes: number | null;
  peso_venda_medio_kg: number | null;
  peso_venda_total_kg: number | null;
  arrobas_totais: number | null;
  faturamento_bruto: number | null;
  custo_suplemento_projetado: number | null;
  custo_total_projetado: number | null;
  lucro_liquido_projetado: number | null;
  lucro_por_cabeca: number | null;
  margem_pct: number | null;
  aviso: string | null;
};

export const RENDIMENTO_CARCACA_PCT_PADRAO = RENDIMENTO_CARCACA_PADRAO * 100;

/** 1 @ de peso vivo = 30 kg de peso vivo. */
export const KG_POR_ARROBA_VIVA = KG_POR_ARROBA;

export const DIAS_GIRO_PLANEJADOS_PADRAO = 90;

export const OPCOES_TIPO_VENDA: { valor: TipoVenda; rotulo: string }[] = [
  { valor: "peso_vivo", rotulo: "Peso vivo" },
  { valor: "peso_morto", rotulo: "Peso morto / abate" },
];

export function inputsProjecaoVazios(): InputsProjecao {
  return {
    dias_giro_planejados: DIAS_GIRO_PLANEJADOS_PADRAO,
    tipo_venda: "peso_vivo",
    preco_arroba: null,
    rendimento_carcaca_pct: RENDIMENTO_CARCACA_PCT_PADRAO,
    outros_custos: 0,
  };
}

/** @ vivas a partir do peso vivo (1 @ = 30 kg PV). */
export function kgParaArrobaViva(kg: number): number {
  return kg / KG_POR_ARROBA_VIVA;
}

export function calcularMetricasRealizadas(
  base: LoteLucratividadeBase,
  outrosCustos: number | null = 0,
): MetricasRealizadas {
  const diasBrutos = diasEntre(base.data_entrada_ref, base.hoje);
  const dias_giro =
    diasBrutos != null && Number.isFinite(diasBrutos) && diasBrutos >= 0
      ? diasBrutos
      : null;

  const gmd =
    base.peso_atual_medio != null && base.peso_entrada_medio != null
      ? calcularGmd(base.peso_atual_medio, base.peso_entrada_medio, dias_giro)
      : null;

  const outros =
    outrosCustos != null && Number.isFinite(outrosCustos) && outrosCustos >= 0
      ? outrosCustos
      : 0;

  const custo_total_acumulado =
    base.custo_aquisicao_total +
    base.custo_suplementacao_ate_hoje +
    base.custo_sanidade_ate_hoje +
    outros;

  return {
    dias_giro,
    gmd,
    custo_aquisicao_total: base.custo_aquisicao_total,
    custo_suplementacao_ate_hoje: base.custo_suplementacao_ate_hoje,
    custo_sanidade_ate_hoje: base.custo_sanidade_ate_hoje,
    outros_custos: outros,
    custo_total_acumulado,
  };
}

function rendimentoFracaoDe(pct: number | null | undefined): number {
  const rendimentoPct =
    pct != null && Number.isFinite(pct) && pct > 0
      ? pct
      : RENDIMENTO_CARCACA_PCT_PADRAO;

  return rendimentoPct / 100;
}

function valorMercadoDePeso(params: {
  tipo_venda: TipoVenda;
  peso_total_kg: number | null;
  preco_arroba: number | null;
  rendimento_carcaca_pct: number | null;
}): { arrobas: number | null; valor: number | null } {
  const { tipo_venda, peso_total_kg, preco_arroba } = params;

  if (peso_total_kg == null || !Number.isFinite(peso_total_kg)) {
    return { arrobas: null, valor: null };
  }

  // Peso vivo: @ viva = kg / 30 (cotação de boi em pé).
  // Peso morto: @ carcaça = kg * rendimento / 15 (frigorífico).
  const arrobas =
    tipo_venda === "peso_vivo"
      ? kgParaArrobaViva(peso_total_kg)
      : kgParaArroba(
          peso_total_kg,
          rendimentoFracaoDe(params.rendimento_carcaca_pct),
        );

  if (
    preco_arroba != null &&
    Number.isFinite(preco_arroba) &&
    preco_arroba >= 0
  ) {
    return { arrobas, valor: arrobas * preco_arroba };
  }

  return { arrobas, valor: null };
}

/**
 * Lucro "se vendesse hoje" com o peso atual do lote e um preço de referência.
 * Não projeta ganho futuro — só marca a mercado o estoque vivo atual.
 */
export function calcularLucroRealizado(
  base: LoteLucratividadeBase,
  inputs: InputsPrecoReferencia,
): ResultadoLucroRealizado {
  const metricas = calcularMetricasRealizadas(base, inputs.outros_custos);

  const peso_atual_total_kg =
    base.peso_atual_medio != null &&
    Number.isFinite(base.peso_atual_medio) &&
    base.qtd_cabecas > 0
      ? base.peso_atual_medio * base.qtd_cabecas
      : null;

  const mercado = valorMercadoDePeso({
    tipo_venda: inputs.tipo_venda,
    peso_total_kg: peso_atual_total_kg,
    preco_arroba: inputs.preco_arroba,
    rendimento_carcaca_pct: inputs.rendimento_carcaca_pct,
  });

  const lucro_liquido =
    mercado.valor != null
      ? mercado.valor - metricas.custo_total_acumulado
      : null;

  const lucro_por_cabeca =
    lucro_liquido != null && base.qtd_cabecas > 0
      ? lucro_liquido / base.qtd_cabecas
      : null;

  const margem_pct =
    lucro_liquido != null && mercado.valor != null && mercado.valor > 0
      ? (lucro_liquido / mercado.valor) * 100
      : null;

  return {
    peso_atual_total_kg,
    arrobas_atuais: mercado.arrobas,
    valor_mercado_hoje: mercado.valor,
    lucro_liquido,
    lucro_por_cabeca,
    margem_pct,
  };
}

/**
 * Peso de venda médio =
 * Peso Atual Médio + GMD × max(0, Dias Totais Planejados − Dias de Giro)
 */
export function projetarPesoVendaMedio(
  pesoAtualMedio: number | null,
  gmd: number | null,
  diasRestantes: number | null,
): number | null {
  if (pesoAtualMedio == null || diasRestantes == null) {
    return null;
  }

  if (diasRestantes === 0) {
    return pesoAtualMedio;
  }

  if (gmd == null) {
    return null;
  }

  return pesoAtualMedio + gmd * diasRestantes;
}

export function calcularProjecao(
  base: LoteLucratividadeBase,
  inputs: InputsProjecao,
): ResultadoProjecao {
  const metricas = calcularMetricasRealizadas(base, inputs.outros_custos);
  const vazio: ResultadoProjecao = {
    dias_restantes: null,
    peso_venda_medio_kg: null,
    peso_venda_total_kg: null,
    arrobas_totais: null,
    faturamento_bruto: null,
    custo_suplemento_projetado: null,
    custo_total_projetado: null,
    lucro_liquido_projetado: null,
    lucro_por_cabeca: null,
    margem_pct: null,
    aviso: null,
  };

  const diasPlanejados = inputs.dias_giro_planejados;
  if (
    diasPlanejados == null ||
    !Number.isFinite(diasPlanejados) ||
    diasPlanejados < 0
  ) {
    return { ...vazio, aviso: "Informe os dias totais de giro planejados." };
  }

  let aviso: string | null = null;
  let dias_restantes: number | null = null;

  if (metricas.dias_giro == null) {
    aviso = "Sem data de entrada do lote — não é possível calcular o giro.";
  } else {
    dias_restantes = Math.max(0, diasPlanejados - metricas.dias_giro);
    if (diasPlanejados < metricas.dias_giro) {
      aviso =
        "Dias planejados menores que o giro atual — projeção usa o peso de hoje (sem ganho futuro).";
    }
  }

  const peso_venda_medio_kg = projetarPesoVendaMedio(
    base.peso_atual_medio,
    metricas.gmd,
    dias_restantes,
  );

  if (
    peso_venda_medio_kg == null &&
    dias_restantes != null &&
    dias_restantes > 0 &&
    metricas.gmd == null
  ) {
    aviso =
      aviso ??
      "GMD indisponível (giro zerado ou pesos incompletos) — não dá para projetar ganho.";
  }

  const peso_venda_total_kg =
    peso_venda_medio_kg != null && base.qtd_cabecas > 0
      ? peso_venda_medio_kg * base.qtd_cabecas
      : null;

  const mercado = valorMercadoDePeso({
    tipo_venda: inputs.tipo_venda,
    peso_total_kg: peso_venda_total_kg,
    preco_arroba: inputs.preco_arroba,
    rendimento_carcaca_pct: inputs.rendimento_carcaca_pct,
  });

  const arrobas_totais = mercado.arrobas;
  const faturamento_bruto = mercado.valor;

  // Rateio: (suplemento até hoje / dias de giro) * dias planejados
  let custo_suplemento_projetado: number | null = null;
  if (metricas.dias_giro != null && metricas.dias_giro > 0) {
    custo_suplemento_projetado =
      (metricas.custo_suplementacao_ate_hoje / metricas.dias_giro) *
      diasPlanejados;
  } else if (metricas.dias_giro === 0) {
    // 1º dia: sem histórico para ratear — projeta só o acumulado atual (0 ou o que houver)
    custo_suplemento_projetado = metricas.custo_suplementacao_ate_hoje;
    aviso =
      aviso ??
      "No 1º dia de giro o suplemento projetado usa só o acumulado até hoje (sem rateio diário).";
  }

  const custo_total_projetado =
    custo_suplemento_projetado != null
      ? metricas.custo_aquisicao_total +
        custo_suplemento_projetado +
        metricas.custo_sanidade_ate_hoje +
        metricas.outros_custos
      : null;

  const lucro_liquido_projetado =
    faturamento_bruto != null && custo_total_projetado != null
      ? faturamento_bruto - custo_total_projetado
      : null;

  const lucro_por_cabeca =
    lucro_liquido_projetado != null && base.qtd_cabecas > 0
      ? lucro_liquido_projetado / base.qtd_cabecas
      : null;

  const margem_pct =
    lucro_liquido_projetado != null &&
    faturamento_bruto != null &&
    faturamento_bruto > 0
      ? (lucro_liquido_projetado / faturamento_bruto) * 100
      : null;

  return {
    dias_restantes,
    peso_venda_medio_kg,
    peso_venda_total_kg,
    arrobas_totais,
    faturamento_bruto,
    custo_suplemento_projetado,
    custo_total_projetado,
    lucro_liquido_projetado,
    lucro_por_cabeca,
    margem_pct,
    aviso,
  };
}

export function formatDiasGiro(dias: number | null | undefined): string {
  if (dias == null || !Number.isFinite(dias)) {
    return "—";
  }

  return `${Math.round(dias)} dia${dias === 1 ? "" : "s"}`;
}

export function formatMoedaOuTraco(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) {
    return "—";
  }

  return formatarMoeda(valor);
}

export function formatPesoMedioKg(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) {
    return "—";
  }

  return `${formatarDecimal(valor, 1)} kg`;
}

export function formatArrobasTotais(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) {
    return "—";
  }

  return `${formatarDecimal(valor, 1)} @`;
}

export function formatMargemPct(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) {
    return "—";
  }

  return `${formatarDecimal(valor, 1)}%`;
}
