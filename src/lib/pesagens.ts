import { differenceInCalendarDays } from "date-fns";

import type { CategoriaAnimal, FaseProdutiva, SexoAnimal } from "@/lib/animais";
import { formatarDecimal, formatarMoeda } from "@/lib/formatacao";
import type { ObjetivoLote } from "@/lib/lotes";
import type { Enums } from "@/types/database";

/** 1 arroba de carcaça = 15 kg. */
export const KG_POR_ARROBA_CARCACA = 15;

/**
 * Rendimento de carcaça padrão (50%).
 * No futuro pode virar configurável por fazenda ou por lote — o rendimento real
 * varia de ~48% a ~54% conforme raça, acabamento e sistema (pasto x confinamento).
 * Arrobas estimadas a partir do peso vivo = peso_vivo * RENDIMENTO / 15
 * (equivale a peso_vivo / 30 com o padrão de 50%).
 */
export const RENDIMENTO_CARCACA_PADRAO = 0.5;

/** @deprecated Use kgParaArrobaEstimada — peso vivo não é peso de carcaça. */
export const KG_POR_ARROBA = KG_POR_ARROBA_CARCACA / RENDIMENTO_CARCACA_PADRAO; // 30

export const GMD_ALTO_KG = 2.2;
export const DIAS_ATRASO_PESAGEM = 30;
export const UNIFORMIDADE_CV_ALERTA = 18;
export const DIAS_GMD_BAIXA = 7;

/** Limite (dias) para confiabilidade "alta" por fase produtiva. */
export const DIAS_GMD_ALTA_POR_FASE: Record<FaseProdutiva, number> = {
  cria: 21,
  recria: 18,
  engorda: 14,
};

export const DIAS_GMD_ALTA_PADRAO = 14;

export type StatusPesagem = Enums<"status_pesagem">;
export type CondicaoPesagem = Enums<"condicao_pesagem">;
export type ConfiabilidadeGmd = Enums<"confiabilidade_gmd">;
export type OrigemPesoAnterior = "pesagem" | "entrada" | "cadastro";
export type AlertaGmd = "perda" | "gmd_alto" | "sem_anterior";
export type FiltroStatusPesagem = StatusPesagem | "todos";
export type FiltroListaSessao = "todos" | "pendentes" | "pesados" | "atencao";

export type PesagemResumo = {
  id: string;
  lote_id: string;
  lote_nome: string;
  lote_objetivo: ObjetivoLote | null;
  data: string;
  status: StatusPesagem;
  qtd_pesados: number;
  qtd_animais_lote: number | null;
  cobertura_percentual: number | null;
  peso_medio: number | null;
  uniformidade_cv: number | null;
  gmd_medio: number | null;
  ganho_total_kg: number | null;
  custo_alimentacao: number | null;
  custo_por_arroba: number | null;
  condicao_pesagem: CondicaoPesagem | null;
  observacoes: string | null;
};

export type PesagemCabecalho = PesagemResumo & {
  /** Animais ativos no lote neste momento (sem extras fora do lote). */
  qtd_lote: number;
};

export type AnimalPesagem = {
  id: string;
  brinco: string;
  nome: string | null;
  sexo: SexoAnimal;
  categoria: CategoriaAnimal | null;
  fase_produtiva: FaseProdutiva | null;
  foto_url: string | null;
  peso_entrada: number | null;
  data_entrada: string | null;
  peso_anterior_kg: number | null;
  data_peso_anterior: string | null;
  origem_anterior: OrigemPesoAnterior | null;
  condicao_anterior: CondicaoPesagem | null;
  peso_salvo_kg: number | null;
  confiabilidade_salva: ConfiabilidadeGmd | null;
  /** Já tem peso nesta sessão, mas não está mais ativo neste lote. */
  fora_do_lote: boolean;
};

export type PesagemSessao = {
  cabecalho: PesagemCabecalho;
  animais: AnimalPesagem[];
};

export type PontoHistoricoPeso = {
  data: string;
  peso_kg: number;
  origem: "entrada" | "pesagem";
  pesagem_id: string | null;
  lote_nome: string | null;
  gmd: number | null;
  dias: number | null;
  ganho_kg: number | null;
};

export type DesempenhoAnimal = {
  peso_atual: number | null;
  gmd_intervalo: number | null;
  gmd_acumulado: number | null;
  ganho_total_kg: number | null;
  dias_fazenda: number | null;
  custo_por_arroba: number | null;
  pontos: PontoHistoricoPeso[];
};

export type ResumoLotePesagem = {
  ultima_data: string | null;
  gmd_medio: number | null;
  dias_desde: number | null;
  atrasada: boolean;
};

export type DesempenhoLinha = {
  peso_kg: number | null;
  peso_anterior_kg: number | null;
  dias: number | null;
  ganho_kg: number | null;
  gmd: number | null;
  arroba: number | null;
  alerta: AlertaGmd | null;
  confiabilidade: ConfiabilidadeGmd | null;
};

export type ResumoSessaoLive = {
  /** Pesados que ainda estão no lote (numerador da cobertura / agregados). */
  pesados: number;
  /** Pesados com fora_do_lote = true — não entram na média do lote. */
  pesados_fora_do_lote: number;
  total: number;
  qtd_animais_lote: number;
  cobertura_percentual: number | null;
  peso_medio: number | null;
  uniformidade_cv: number | null;
  gmd_medio: number | null;
  ganho_total_kg: number | null;
  ganho_total_arroba: number | null;
  custo_por_arroba: number | null;
  perdas: number;
  atencao: number;
};

export const LABELS_STATUS_PESAGEM: Record<StatusPesagem, string> = {
  rascunho: "Em andamento",
  concluida: "Concluída",
};

export const LABELS_CONDICAO_PESAGEM: Record<CondicaoPesagem, string> = {
  sem_jejum: "Sem jejum",
  jejum_ate_12h: "Jejum até 12h",
  jejum_mais_12h: "Jejum > 12h",
};

export const LABELS_CONFIABILIDADE: Record<ConfiabilidadeGmd, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  sem_referencia: "Sem referência",
};

export const TEXTO_DICA_JEJUM =
  "Jejum e transporte alteram o peso vivo em cerca de 3% a 10%. Informe a condição para comparar pesagens com mais segurança.";

export const TEXTO_TOOLTIP_ARROBA =
  "Estimativa a partir do peso vivo com rendimento de carcaça de 50% (peso vivo ÷ 30). Diferente da arroba de carcaça que o frigorífico paga no abate.";

export const OPCOES_FILTRO_STATUS_PESAGEM = [
  { valor: "todos", rotulo: "Todas" },
  { valor: "rascunho", rotulo: "Em andamento" },
  { valor: "concluida", rotulo: "Concluídas" },
] as const;

export const OPCOES_CONDICAO_PESAGEM: {
  valor: CondicaoPesagem | "";
  rotulo: string;
}[] = [
  { valor: "", rotulo: "Não informado" },
  { valor: "sem_jejum", rotulo: LABELS_CONDICAO_PESAGEM.sem_jejum },
  { valor: "jejum_ate_12h", rotulo: LABELS_CONDICAO_PESAGEM.jejum_ate_12h },
  { valor: "jejum_mais_12h", rotulo: LABELS_CONDICAO_PESAGEM.jejum_mais_12h },
];

/**
 * Arrobas estimadas a partir do peso vivo.
 * = peso_vivo * RENDIMENTO_CARCACA_PADRAO / 15
 */
export function kgParaArroba(kg: number): number {
  return (kg * RENDIMENTO_CARCACA_PADRAO) / KG_POR_ARROBA_CARCACA;
}

export const kgParaArrobaEstimada = kgParaArroba;

export function formatArroba(kg: number | null | undefined): string {
  if (kg == null || !Number.isFinite(kg)) {
    return "—";
  }

  return `${formatarDecimal(kgParaArroba(kg), 1)} @ est.`;
}

export function formatGmd(gmd: number | null | undefined): string {
  if (gmd == null || !Number.isFinite(gmd)) {
    return "—";
  }

  const sinal = gmd > 0 ? "+" : "";
  return `${sinal}${formatarDecimal(gmd, 3)} kg/dia`;
}

export function formatGanho(kg: number | null | undefined): string {
  if (kg == null || !Number.isFinite(kg)) {
    return "—";
  }

  const sinal = kg > 0 ? "+" : "";
  return `${sinal}${formatarDecimal(kg, 1)} kg`;
}

export function formatCustoArroba(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) {
    return "—";
  }

  return `${formatarMoeda(valor)}/@ est.`;
}

export function formatCobertura(
  qtdPesados: number,
  qtdLote: number | null | undefined,
  cobertura: number | null | undefined,
): string {
  if (qtdLote == null || qtdLote <= 0) {
    return `${qtdPesados} pesados`;
  }

  const pct =
    cobertura != null && Number.isFinite(cobertura)
      ? Math.round(cobertura)
      : Math.round((qtdPesados / qtdLote) * 100);

  return `${qtdPesados}/${qtdLote} · ${pct}%`;
}

export function formatUniformidade(cv: number | null | undefined): string {
  if (cv == null || !Number.isFinite(cv)) {
    return "—";
  }

  return `${formatarDecimal(cv, 1)}% CV`;
}

export function diasEntre(inicio: string | null | undefined, fim: string): number | null {
  if (!inicio) {
    return null;
  }

  const dias = differenceInCalendarDays(
    new Date(`${fim}T00:00:00`),
    new Date(`${inicio}T00:00:00`),
  );

  return Number.isFinite(dias) ? dias : null;
}

export function calcularGmd(
  pesoAtual: number,
  pesoAnterior: number,
  dias: number | null,
): number | null {
  if (dias == null || dias <= 0) {
    return null;
  }

  return (pesoAtual - pesoAnterior) / dias;
}

export function limiteDiasAlta(fase: FaseProdutiva | null | undefined): number {
  if (!fase) {
    return DIAS_GMD_ALTA_PADRAO;
  }

  return DIAS_GMD_ALTA_POR_FASE[fase] ?? DIAS_GMD_ALTA_PADRAO;
}

function rebaixarConfiabilidade(nivel: ConfiabilidadeGmd): ConfiabilidadeGmd {
  if (nivel === "alta") {
    return "media";
  }

  if (nivel === "media" || nivel === "baixa") {
    return "baixa";
  }

  return nivel;
}

/**
 * Confiabilidade do GMD individual (calculada junto com o desempenho da linha;
 * não há trigger de GMD por item no banco — a lógica vive aqui e é gravada em
 * pesagem_itens.confiabilidade ao salvar).
 */
export function calcularConfiabilidade(params: {
  peso_anterior_kg: number | null;
  dias: number | null;
  fase_produtiva: FaseProdutiva | null;
  condicao_atual: CondicaoPesagem | null;
  condicao_anterior: CondicaoPesagem | null;
}): ConfiabilidadeGmd {
  if (params.peso_anterior_kg == null || params.dias == null || params.dias <= 0) {
    return "sem_referencia";
  }

  const limiteAlta = limiteDiasAlta(params.fase_produtiva);
  let nivel: ConfiabilidadeGmd;

  if (params.dias < DIAS_GMD_BAIXA) {
    nivel = "baixa";
  } else if (params.dias < limiteAlta) {
    nivel = "media";
  } else {
    nivel = "alta";
  }

  if (
    params.condicao_atual &&
    params.condicao_anterior &&
    params.condicao_atual !== params.condicao_anterior
  ) {
    nivel = rebaixarConfiabilidade(nivel);
  }

  return nivel;
}

export function alertaDaLinha(params: {
  peso_kg: number | null;
  peso_anterior_kg: number | null;
  gmd: number | null;
}): AlertaGmd | null {
  if (params.peso_kg == null) {
    return null;
  }

  if (params.peso_anterior_kg == null) {
    return "sem_anterior";
  }

  if (params.gmd != null && params.gmd < 0) {
    return "perda";
  }

  if (params.gmd != null && params.gmd > GMD_ALTO_KG) {
    return "gmd_alto";
  }

  return null;
}

export function desempenhoDaLinha(
  pesoTexto: string,
  animal: Pick<
    AnimalPesagem,
    | "peso_anterior_kg"
    | "data_peso_anterior"
    | "fase_produtiva"
    | "condicao_anterior"
  >,
  dataSessao: string,
  condicaoAtual: CondicaoPesagem | null = null,
): DesempenhoLinha {
  const peso = parsePesoCampo(pesoTexto);

  if (peso == null) {
    return {
      peso_kg: null,
      peso_anterior_kg: animal.peso_anterior_kg,
      dias: diasEntre(animal.data_peso_anterior, dataSessao),
      ganho_kg: null,
      gmd: null,
      arroba: null,
      alerta: null,
      confiabilidade: null,
    };
  }

  const dias = diasEntre(animal.data_peso_anterior, dataSessao);
  const ganho =
    animal.peso_anterior_kg != null ? peso - animal.peso_anterior_kg : null;
  const gmd =
    animal.peso_anterior_kg != null
      ? calcularGmd(peso, animal.peso_anterior_kg, dias)
      : null;
  const confiabilidade = calcularConfiabilidade({
    peso_anterior_kg: animal.peso_anterior_kg,
    dias,
    fase_produtiva: animal.fase_produtiva,
    condicao_atual: condicaoAtual,
    condicao_anterior: animal.condicao_anterior,
  });

  return {
    peso_kg: peso,
    peso_anterior_kg: animal.peso_anterior_kg,
    dias,
    ganho_kg: ganho,
    gmd,
    arroba: kgParaArroba(peso),
    alerta: alertaDaLinha({
      peso_kg: peso,
      peso_anterior_kg: animal.peso_anterior_kg,
      gmd,
    }),
    confiabilidade,
  };
}

/**
 * GMD médio do lote = média PONDERADA pelos dias:
 * soma(ganho) / soma(dias) dos animais com peso anterior conhecido.
 *
 * Limitação conhecida: o custo_alimentacao é um valor único da sessão e o ganho
 * total soma ganhos individuais sem rateio por dias de permanência no lote.
 * Corrigir isso depende de uma tabela de movimentações que ainda não existe.
 */
export function resumoSessaoLive(
  animais: AnimalPesagem[],
  pesos: Record<string, string>,
  dataSessao: string,
  custoAlimentacao: number | null,
  condicaoAtual: CondicaoPesagem | null = null,
  qtdAnimaisLote?: number,
): ResumoSessaoLive {
  const linhas = animais.map((animal) => ({
    animal,
    desempenho: desempenhoDaLinha(
      pesos[animal.id] ?? "",
      animal,
      dataSessao,
      condicaoAtual,
    ),
  }));
  const todosPesados = linhas.filter((item) => item.desempenho.peso_kg != null);
  // Agregados do lote = só animais ainda no lote (mesma população de ativosLote).
  const doLote = todosPesados.filter((item) => !item.animal.fora_do_lote);
  const foraDoLote = todosPesados.filter((item) => item.animal.fora_do_lote);
  const linhasLote = doLote.map((item) => item.desempenho);
  const comGanhoEDias = linhasLote.filter(
    (linha) =>
      linha.ganho_kg != null && linha.dias != null && linha.dias > 0,
  );
  const pesosKg = linhasLote.map((linha) => linha.peso_kg as number);
  const pesoMedio = pesosKg.length > 0 ? media(pesosKg) : null;
  const uniformidadeCv =
    pesoMedio != null && pesoMedio > 0 && pesosKg.length > 0
      ? (desvioPadraoPopulacional(pesosKg)! / pesoMedio) * 100
      : null;

  const ganhoTotal =
    comGanhoEDias.length > 0
      ? comGanhoEDias.reduce((soma, linha) => soma + (linha.ganho_kg ?? 0), 0)
      : null;
  const diasTotal =
    comGanhoEDias.length > 0
      ? comGanhoEDias.reduce((soma, linha) => soma + (linha.dias ?? 0), 0)
      : null;
  const gmdMedio =
    ganhoTotal != null && diasTotal != null && diasTotal > 0
      ? ganhoTotal / diasTotal
      : null;
  const ganhoArroba = ganhoTotal != null ? kgParaArroba(ganhoTotal) : null;
  const custoPorArroba =
    custoAlimentacao != null && ganhoArroba != null && ganhoArroba > 0
      ? custoAlimentacao / ganhoArroba
      : null;

  const ativosLote = qtdAnimaisLote ?? animais.filter((a) => !a.fora_do_lote).length;
  const coberturaBruta =
    ativosLote > 0 ? (doLote.length / ativosLote) * 100 : null;
  const cobertura =
    coberturaBruta != null ? Math.min(100, coberturaBruta) : null;

  const todasLinhasPesadas = todosPesados.map((item) => item.desempenho);

  return {
    pesados: doLote.length,
    pesados_fora_do_lote: foraDoLote.length,
    total: animais.length,
    qtd_animais_lote: ativosLote,
    cobertura_percentual: cobertura,
    peso_medio: pesoMedio,
    uniformidade_cv: uniformidadeCv,
    gmd_medio: gmdMedio,
    ganho_total_kg: ganhoTotal,
    ganho_total_arroba: ganhoArroba,
    custo_por_arroba: custoPorArroba,
    perdas: todasLinhasPesadas.filter((linha) => linha.alerta === "perda").length,
    atencao: todasLinhasPesadas.filter(
      (linha) =>
        linha.alerta != null ||
        linha.confiabilidade === "baixa" ||
        linha.confiabilidade === "media",
    ).length,
  };
}

export function parsePesoCampo(valor: string): number | null {
  const texto = valor.trim();

  if (!texto) {
    return null;
  }

  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);

  if (!Number.isFinite(numero) || numero < 1 || numero > 1500) {
    return null;
  }

  return Math.round(numero * 100) / 100;
}

export function pesoParaCampo(peso: number | null | undefined): string {
  if (peso == null || !Number.isFinite(peso)) {
    return "";
  }

  const inteiro = Math.abs(peso - Math.round(peso)) < 0.005;
  return inteiro ? String(Math.round(peso)) : formatarDecimal(peso, 1);
}

export function filtrarPesagens(
  pesagens: PesagemResumo[],
  busca: string,
  status: FiltroStatusPesagem,
): PesagemResumo[] {
  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  return pesagens.filter((pesagem) => {
    if (status !== "todos" && pesagem.status !== status) {
      return false;
    }

    if (!termo) {
      return true;
    }

    return pesagem.lote_nome.toLocaleLowerCase("pt-BR").includes(termo);
  });
}

export function rotuloAlerta(alerta: AlertaGmd): string {
  if (alerta === "perda") {
    return "Perdeu peso";
  }

  if (alerta === "gmd_alto") {
    return "Ganho atípico";
  }

  return "Sem peso anterior";
}

export function media(valores: number[]): number | null {
  if (valores.length === 0) {
    return null;
  }

  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

/** Desvio padrão populacional (÷ n), usado no CV de uniformidade. */
export function desvioPadraoPopulacional(valores: number[]): number | null {
  if (valores.length === 0) {
    return null;
  }

  const m = media(valores);

  if (m == null) {
    return null;
  }

  const variancia =
    valores.reduce((soma, valor) => soma + (valor - m) ** 2, 0) / valores.length;

  return Math.sqrt(variancia);
}
