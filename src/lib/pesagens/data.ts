import { differenceInCalendarDays } from "date-fns";

import { hojeISO } from "@/lib/animais";
import { getFazendaAtiva } from "@/lib/fazenda";
import {
  calcularGmd,
  DIAS_ATRASO_PESAGEM,
  diasEntre,
  kgParaArroba,
  media,
  type AnimalPesagem,
  type CondicaoPesagem,
  type ConfiabilidadeGmd,
  type DesempenhoAnimal,
  type OrigemPesoAnterior,
  type PesagemCabecalho,
  type PesagemResumo,
  type PesagemSessao,
  type PontoHistoricoPeso,
  type ResumoLotePesagem,
} from "@/lib/pesagens";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

function numeroOuNulo(valor: number | string | null | undefined): number | null {
  if (valor == null || valor === "") {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function numeroOuZero(valor: number | string | null | undefined): number {
  return numeroOuNulo(valor) ?? 0;
}

type LinhaResumo = {
  id: string | null;
  lote_id: string | null;
  lote_nome: string | null;
  lote_objetivo: Tables<"vw_pesagens_resumo">["lote_objetivo"];
  data: string | null;
  status: Tables<"vw_pesagens_resumo">["status"];
  qtd_pesados: number | null;
  qtd_animais_lote?: number | null;
  cobertura_percentual?: number | null;
  peso_medio: number | null;
  uniformidade_cv?: number | null;
  gmd_medio: number | null;
  ganho_total_kg: number | null;
  custo_alimentacao: number | null;
  custo_por_arroba?: number | null;
  condicao_pesagem?: CondicaoPesagem | null;
  observacoes: string | null;
};

const SELECT_RESUMO =
  "id, lote_id, lote_nome, lote_objetivo, data, status, qtd_pesados, qtd_animais_lote, cobertura_percentual, peso_medio, uniformidade_cv, gmd_medio, ganho_total_kg, custo_alimentacao, custo_por_arroba, condicao_pesagem, observacoes, fazenda_id, deleted_at, created_at";

function mapearResumo(linha: LinhaResumo): PesagemResumo | null {
  if (!linha.id || !linha.lote_id || !linha.lote_nome || !linha.data || !linha.status) {
    return null;
  }

  return {
    id: linha.id,
    lote_id: linha.lote_id,
    lote_nome: linha.lote_nome,
    lote_objetivo: linha.lote_objetivo,
    data: linha.data,
    status: linha.status,
    qtd_pesados: numeroOuZero(linha.qtd_pesados),
    qtd_animais_lote: numeroOuNulo(linha.qtd_animais_lote),
    cobertura_percentual: numeroOuNulo(linha.cobertura_percentual),
    peso_medio: numeroOuNulo(linha.peso_medio),
    uniformidade_cv: numeroOuNulo(linha.uniformidade_cv),
    gmd_medio: numeroOuNulo(linha.gmd_medio),
    ganho_total_kg: numeroOuNulo(linha.ganho_total_kg),
    custo_alimentacao: numeroOuNulo(linha.custo_alimentacao),
    custo_por_arroba: numeroOuNulo(linha.custo_por_arroba),
    condicao_pesagem: linha.condicao_pesagem ?? null,
    observacoes: linha.observacoes,
  };
}

export async function getPesagens(): Promise<PesagemResumo[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_pesagens_resumo")
    .select(SELECT_RESUMO)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar as pesagens.");
  }

  return (data ?? []).flatMap((linha) => {
    const pesagem = mapearResumo(linha as LinhaResumo);
    return pesagem ? [pesagem] : [];
  });
}

export async function getPesagemPorLoteData(
  loteId: string,
  data: string,
): Promise<PesagemResumo | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  const { data: linha, error } = await supabase
    .from("vw_pesagens_resumo")
    .select(SELECT_RESUMO)
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", loteId)
    .eq("data", data)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return linha ? mapearResumo(linha as LinhaResumo) : null;
}

type PesoAnterior = {
  peso_kg: number;
  data: string | null;
  origem: OrigemPesoAnterior;
  condicao: CondicaoPesagem | null;
};

function escolherAnterior(params: {
  historico: {
    animal_id: string;
    peso_kg: number;
    data: string;
    pesagem_id: string;
    condicao: CondicaoPesagem | null;
  }[];
  animalId: string;
  dataSessao: string;
  pesagemId: string;
  pesoEntrada: number | null;
  dataEntrada: string | null;
  pesoAtual: number | null;
  dataUltimaPesagem: string | null;
}): PesoAnterior | null {
  const anteriores = params.historico
    .filter(
      (item) =>
        item.animal_id === params.animalId &&
        item.pesagem_id !== params.pesagemId &&
        item.data < params.dataSessao,
    )
    .sort((a, b) => b.data.localeCompare(a.data));

  const ultimo = anteriores[0];

  if (ultimo) {
    return {
      peso_kg: ultimo.peso_kg,
      data: ultimo.data,
      origem: "pesagem",
      condicao: ultimo.condicao,
    };
  }

  // Cadastro: usa peso_atual mesmo sem data_ultima_pesagem.
  // Sem data o GMD não calcula (faltam dias), mas ganho e @ ainda fazem sentido.
  if (params.pesoAtual != null) {
    const dataCadastro =
      params.dataUltimaPesagem && params.dataUltimaPesagem < params.dataSessao
        ? params.dataUltimaPesagem
        : null;

    if (!params.dataUltimaPesagem || dataCadastro) {
      return {
        peso_kg: params.pesoAtual,
        data: dataCadastro,
        origem: "cadastro",
        condicao: null,
      };
    }
  }

  if (params.pesoEntrada != null && params.dataEntrada && params.dataEntrada < params.dataSessao) {
    return {
      peso_kg: params.pesoEntrada,
      data: params.dataEntrada,
      origem: "entrada",
      condicao: null,
    };
  }

  if (params.pesoEntrada != null && params.dataEntrada === params.dataSessao) {
    return {
      peso_kg: params.pesoEntrada,
      data: params.dataEntrada,
      origem: "entrada",
      condicao: null,
    };
  }

  // Entrada sem data cadastrada — ainda serve como referência de peso.
  if (params.pesoEntrada != null && !params.dataEntrada) {
    return {
      peso_kg: params.pesoEntrada,
      data: null,
      origem: "entrada",
      condicao: null,
    };
  }

  return null;
}

export async function getSessaoPesagem(id: string): Promise<PesagemSessao | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  const { data: linha, error } = await supabase
    .from("vw_pesagens_resumo")
    .select(SELECT_RESUMO)
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  const resumo = linha ? mapearResumo(linha as LinhaResumo) : null;

  if (!resumo) {
    return null;
  }

  const [{ data: itens, error: erroItens }, { data: doLote, error: erroLote }] =
    await Promise.all([
      supabase
        .from("pesagem_itens")
        .select("id, animal_id, peso_kg, confiabilidade")
        .eq("fazenda_id", fazenda.id)
        .eq("pesagem_id", id),
      supabase
        .from("animais")
        .select(
          "id, brinco, nome, sexo, categoria, fase_produtiva, foto_url, peso_entrada, data_entrada, peso_atual, data_ultima_pesagem, lote_id, status, deleted_at",
        )
        .eq("fazenda_id", fazenda.id)
        .eq("lote_id", resumo.lote_id)
        .eq("status", "ativo")
        .is("deleted_at", null)
        .order("brinco", { ascending: true }),
    ]);

  if (erroItens) {
    console.error(erroItens);
  }

  if (erroLote) {
    console.error(erroLote);
  }

  const pesosSalvos = new Map(
    (itens ?? []).map((item) => [item.animal_id, numeroOuNulo(item.peso_kg)]),
  );
  const confiabilidades = new Map(
    (itens ?? []).map((item) => [
      item.animal_id,
      (item.confiabilidade as ConfiabilidadeGmd | null) ?? null,
    ]),
  );
  const idsItens = [...pesosSalvos.keys()];
  const idsDoLote = new Set((doLote ?? []).map((animal) => animal.id));
  const idsFaltando = idsItens.filter((animalId) => !idsDoLote.has(animalId));

  let extras: typeof doLote = [];

  if (idsFaltando.length > 0) {
    const { data: foraDoLote, error: erroExtras } = await supabase
      .from("animais")
      .select(
        "id, brinco, nome, sexo, categoria, fase_produtiva, foto_url, peso_entrada, data_entrada, peso_atual, data_ultima_pesagem, lote_id, status, deleted_at",
      )
      .eq("fazenda_id", fazenda.id)
      .in("id", idsFaltando)
      .is("deleted_at", null);

    if (erroExtras) {
      console.error(erroExtras);
    }

    extras = foraDoLote ?? [];
  }

  const animaisBrutos = [...(doLote ?? []), ...extras];
  const idsAnimais = animaisBrutos.map((animal) => animal.id);

  const historico: {
    animal_id: string;
    peso_kg: number;
    data: string;
    pesagem_id: string;
    condicao: CondicaoPesagem | null;
  }[] = [];

  if (idsAnimais.length > 0) {
    const { data: anteriores, error: erroHist } = await supabase
      .from("pesagem_itens")
      .select(
        "animal_id, peso_kg, pesagem:pesagens!fk_pesagem_itens_pesagem ( id, data, status, deleted_at, condicao_pesagem )",
      )
      .eq("fazenda_id", fazenda.id)
      .in("animal_id", idsAnimais);

    if (erroHist) {
      console.error(erroHist);
    }

    for (const item of anteriores ?? []) {
      const pesagem = Array.isArray(item.pesagem) ? item.pesagem[0] : item.pesagem;

      if (!pesagem || pesagem.deleted_at || pesagem.status !== "concluida") {
        continue;
      }

      const peso = numeroOuNulo(item.peso_kg);

      if (peso == null) {
        continue;
      }

      historico.push({
        animal_id: item.animal_id,
        peso_kg: peso,
        data: pesagem.data,
        pesagem_id: pesagem.id,
        condicao: (pesagem.condicao_pesagem as CondicaoPesagem | null) ?? null,
      });
    }
  }

  const qtdAtivosLote = (doLote ?? []).length;

  const animais: AnimalPesagem[] = animaisBrutos
    .map((animal) => {
      const anterior = escolherAnterior({
        historico,
        animalId: animal.id,
        dataSessao: resumo.data,
        pesagemId: resumo.id,
        pesoEntrada: numeroOuNulo(animal.peso_entrada),
        dataEntrada: animal.data_entrada,
        pesoAtual: numeroOuNulo(animal.peso_atual),
        dataUltimaPesagem: animal.data_ultima_pesagem,
      });

      return {
        id: animal.id,
        brinco: animal.brinco,
        nome: animal.nome,
        sexo: animal.sexo,
        categoria: animal.categoria,
        fase_produtiva: animal.fase_produtiva as Enums<"fase_produtiva"> | null,
        foto_url: animal.foto_url,
        peso_entrada: numeroOuNulo(animal.peso_entrada),
        data_entrada: animal.data_entrada,
        peso_anterior_kg: anterior?.peso_kg ?? null,
        data_peso_anterior: anterior?.data ?? null,
        origem_anterior: anterior?.origem ?? null,
        condicao_anterior: anterior?.condicao ?? null,
        peso_salvo_kg: pesosSalvos.get(animal.id) ?? null,
        confiabilidade_salva: confiabilidades.get(animal.id) ?? null,
        fora_do_lote: !idsDoLote.has(animal.id),
      };
    })
    .sort((a, b) => a.brinco.localeCompare(b.brinco, "pt-BR", { numeric: true }));

  const cabecalho: PesagemCabecalho = {
    ...resumo,
    qtd_animais_lote: resumo.qtd_animais_lote ?? qtdAtivosLote,
    qtd_lote: qtdAtivosLote,
  };

  return { cabecalho, animais };
}

export async function animalTemHistoricoPesagem(animalId: string): Promise<boolean> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pesagem_itens")
    .select("id, pesagem:pesagens!fk_pesagem_itens_pesagem ( status, deleted_at )")
    .eq("fazenda_id", fazenda.id)
    .eq("animal_id", animalId)
    .limit(20);

  if (error) {
    console.error(error);
    return false;
  }

  return (data ?? []).some((item) => {
    const pesagem = Array.isArray(item.pesagem) ? item.pesagem[0] : item.pesagem;
    return Boolean(pesagem && !pesagem.deleted_at && pesagem.status === "concluida");
  });
}

export async function getHistoricoAnimal(
  animalId: string,
): Promise<DesempenhoAnimal> {
  const vazio: DesempenhoAnimal = {
    peso_atual: null,
    gmd_intervalo: null,
    gmd_acumulado: null,
    ganho_total_kg: null,
    dias_fazenda: null,
    custo_por_arroba: null,
    pontos: [],
  };

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return vazio;
  }

  const supabase = await createClient();
  const { data: animal, error: erroAnimal } = await supabase
    .from("animais")
    .select("id, peso_atual, peso_entrada, data_entrada, valor_aquisicao")
    .eq("id", animalId)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (erroAnimal) {
    console.error(erroAnimal);
    return vazio;
  }

  if (!animal) {
    return vazio;
  }

  const { data: itens, error } = await supabase
    .from("pesagem_itens")
    .select(
      "peso_kg, pesagem:pesagens!fk_pesagem_itens_pesagem ( id, data, status, deleted_at, lote:lotes!fk_pesagens_lote ( nome ) )",
    )
    .eq("fazenda_id", fazenda.id)
    .eq("animal_id", animalId);

  if (error) {
    console.error(error);
    return vazio;
  }

  const pesagens = (itens ?? [])
    .flatMap((item) => {
      const pesagem = Array.isArray(item.pesagem) ? item.pesagem[0] : item.pesagem;

      if (!pesagem || pesagem.deleted_at || pesagem.status !== "concluida") {
        return [];
      }

      const peso = numeroOuNulo(item.peso_kg);

      if (peso == null) {
        return [];
      }

      const lote = Array.isArray(pesagem.lote) ? pesagem.lote[0] : pesagem.lote;

      return [
        {
          data: pesagem.data,
          peso_kg: peso,
          origem: "pesagem" as const,
          pesagem_id: pesagem.id,
          lote_nome: lote?.nome ?? null,
        },
      ];
    })
    .sort((a, b) => a.data.localeCompare(b.data));

  const pontosBrutos: Omit<PontoHistoricoPeso, "gmd" | "dias" | "ganho_kg">[] = [];

  if (
    animal.peso_entrada != null &&
    animal.data_entrada &&
    (pesagens.length === 0 || animal.data_entrada <= pesagens[0]!.data)
  ) {
    pontosBrutos.push({
      data: animal.data_entrada,
      peso_kg: Number(animal.peso_entrada),
      origem: "entrada",
      pesagem_id: null,
      lote_nome: null,
    });
  }

  pontosBrutos.push(...pesagens);

  const pontos: PontoHistoricoPeso[] = pontosBrutos.map((ponto, indice) => {
    const anterior = pontosBrutos[indice - 1];
    const dias = anterior ? diasEntre(anterior.data, ponto.data) : null;
    const ganho = anterior ? ponto.peso_kg - anterior.peso_kg : null;
    const gmd =
      anterior && dias != null ? calcularGmd(ponto.peso_kg, anterior.peso_kg, dias) : null;

    return { ...ponto, dias, ganho_kg: ganho, gmd };
  });

  const ultimo = pontos[pontos.length - 1] ?? null;
  const primeiro = pontos[0] ?? null;
  const hoje = hojeISO();
  const pesoAtual = numeroOuNulo(animal.peso_atual) ?? ultimo?.peso_kg ?? null;
  const gmdAcumulado =
    primeiro && pesoAtual != null
      ? calcularGmd(pesoAtual, primeiro.peso_kg, diasEntre(primeiro.data, hoje))
      : null;
  const ganhoTotal =
    primeiro && pesoAtual != null ? pesoAtual - primeiro.peso_kg : null;
  const diasFazenda = animal.data_entrada
    ? Math.max(
        0,
        differenceInCalendarDays(
          new Date(`${hoje}T00:00:00`),
          new Date(`${animal.data_entrada}T00:00:00`),
        ),
      )
    : null;
  const custoPorArroba =
    animal.valor_aquisicao != null && pesoAtual != null && pesoAtual > 0
      ? Number(animal.valor_aquisicao) / kgParaArroba(pesoAtual)
      : null;

  return {
    peso_atual: pesoAtual,
    gmd_intervalo: ultimo?.gmd ?? null,
    gmd_acumulado: gmdAcumulado,
    ganho_total_kg: ganhoTotal,
    dias_fazenda: diasFazenda,
    custo_por_arroba: custoPorArroba,
    pontos,
  };
}

export async function getResumoLotePesagem(loteId: string): Promise<ResumoLotePesagem> {
  const vazio: ResumoLotePesagem = {
    ultima_data: null,
    gmd_medio: null,
    dias_desde: null,
    atrasada: true,
  };

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return vazio;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_pesagens_resumo")
    .select("data, gmd_medio, status")
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", loteId)
    .eq("status", "concluida")
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return vazio;
  }

  if (!data?.data) {
    return vazio;
  }

  const hoje = hojeISO();
  const dias = diasEntre(data.data, hoje) ?? 0;

  return {
    ultima_data: data.data,
    gmd_medio: numeroOuNulo(data.gmd_medio),
    dias_desde: dias,
    atrasada: dias >= DIAS_ATRASO_PESAGEM,
  };
}

export async function getLotesAtrasadosPesagem(): Promise<
  { id: string; nome: string; dias: number }[]
> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const [{ data: lotes, error: erroLotes }, { data: pesagens, error: erroPesagens }] =
    await Promise.all([
      supabase
        .from("vw_lotes_resumo")
        .select("id, nome, qtd_animais")
        .eq("fazenda_id", fazenda.id)
        .eq("status", "ativo")
        .is("deleted_at", null),
      supabase
        .from("vw_pesagens_resumo")
        .select("lote_id, data, status")
        .eq("fazenda_id", fazenda.id)
        .eq("status", "concluida")
        .is("deleted_at", null)
        .order("data", { ascending: false }),
    ]);

  if (erroLotes) {
    console.error(erroLotes);
  }

  if (erroPesagens) {
    console.error(erroPesagens);
  }

  const ultimaPorLote = new Map<string, string>();

  for (const pesagem of pesagens ?? []) {
    if (!pesagem.lote_id || !pesagem.data || ultimaPorLote.has(pesagem.lote_id)) {
      continue;
    }

    ultimaPorLote.set(pesagem.lote_id, pesagem.data);
  }

  const hoje = hojeISO();

  return (lotes ?? [])
    .filter((lote) => lote.id && numeroOuZero(lote.qtd_animais) > 0)
    .map((lote) => {
      const ultima = ultimaPorLote.get(lote.id!);
      const dias = ultima ? (diasEntre(ultima, hoje) ?? DIAS_ATRASO_PESAGEM) : 999;

      return { id: lote.id!, nome: lote.nome ?? "Lote", dias };
    })
    .filter((lote) => lote.dias >= DIAS_ATRASO_PESAGEM)
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 5);
}

export async function getIndicadoresPesagem(): Promise<{
  pesagensMes: number;
  gmdMedio: number | null;
  pesoMedio: number | null;
  custoArroba: number | null;
  lotesAtrasados: number;
}> {
  const fazenda = await getFazendaAtiva();
  const vazio = {
    pesagensMes: 0,
    gmdMedio: null as number | null,
    pesoMedio: null as number | null,
    custoArroba: null as number | null,
    lotesAtrasados: 0,
  };

  if (!fazenda) {
    return vazio;
  }

  const supabase = await createClient();
  const hoje = hojeISO();
  const [ano, mes] = hoje.split("-");
  const inicioIso = `${ano}-${mes}-01`;

  const [{ data: pesagens }, { data: animais }, atrasados] = await Promise.all([
    supabase
      .from("vw_pesagens_resumo")
      .select("data, status, gmd_medio, ganho_total_kg, custo_alimentacao, peso_medio, custo_por_arroba")
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null),
    supabase
      .from("animais")
      .select("peso_atual")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null),
    getLotesAtrasadosPesagem(),
  ]);

  const concluidas = (pesagens ?? []).filter((item) => item.status === "concluida");
  const doMes = concluidas.filter((item) => (item.data ?? "") >= inicioIso);
  const gmds = concluidas
    .map((item) => numeroOuNulo(item.gmd_medio))
    .filter((valor): valor is number => valor != null);
  const custos = concluidas.flatMap((item) => {
    const direto = numeroOuNulo(
      (item as { custo_por_arroba?: number | null }).custo_por_arroba,
    );

    if (direto != null) {
      return [direto];
    }

    const custo = numeroOuNulo(item.custo_alimentacao);
    const ganho = numeroOuNulo(item.ganho_total_kg);

    if (custo == null || ganho == null || ganho <= 0) {
      return [];
    }

    return [custo / kgParaArroba(ganho)];
  });
  const pesos = (animais ?? [])
    .map((item) => numeroOuNulo(item.peso_atual))
    .filter((valor): valor is number => valor != null);

  return {
    pesagensMes: doMes.length,
    gmdMedio: media(gmds),
    pesoMedio: media(pesos),
    custoArroba: media(custos),
    lotesAtrasados: atrasados.length,
  };
}
