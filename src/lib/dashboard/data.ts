import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { mesesDeIdade, type PropriedadeAnimal } from "@/lib/animais";
import {
  type DesempenhoLote,
  type FatiaRebanho,
  type Kpi,
  type Ocorrencia,
  type PontoEvolucaoPeso,
  type ProximoManejo,
  type RebanhoFazenda,
} from "@/lib/dashboard/mock";
import type { CategoriaCusto } from "@/lib/custos-periodo/calculo";
import { getFazendaAtiva } from "@/lib/fazenda";
import { getSessoesMedicacao } from "@/lib/medicacoes/data";
import { getIndicadoresPesagem, getLotesAtrasadosPesagem } from "@/lib/pesagens/data";
import { createClient } from "@/lib/supabase/server";
import {
  getLotesComVacinaPendente,
  getSessoesRecentes,
} from "@/lib/vacinas/data";

export type {
  DesempenhoLote,
  FatiaRebanho,
  Kpi,
  Ocorrencia,
  PontoEvolucaoPeso,
  ProximoManejo,
  RebanhoFazenda,
};

function pertenceAoLote(loteId: string | null | undefined, loteIds: string[] | null) {
  if (!loteIds) {
    return true;
  }

  return loteId != null && loteIds.includes(loteId);
}

export async function getIdsLotesDaPropriedade(
  propriedade: PropriedadeAnimal,
): Promise<string[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animais")
    .select("lote_id")
    .eq("fazenda_id", fazenda.id)
    .eq("propriedade", propriedade)
    .eq("status", "ativo")
    .is("deleted_at", null)
    .not("lote_id", "is", null);

  if (error) {
    console.error(error);
    return [];
  }

  return [...new Set((data ?? []).flatMap((animal) => (animal.lote_id ? [animal.lote_id] : [])))];
}

const CORES_DISTRIBUICAO = {
  macho_0_12: "#146C3B",
  macho_12_24: "#3DB37E",
  macho_24: "#7E8A6E",
  femea_0_12: "#8C8F86",
  femea_12_24: "#F4A26B",
  femea_24: "#E8735F",
  sem_idade: "#B0B0B0",
} as const;

export async function getKpis(
  propriedade: PropriedadeAnimal | null = null,
  loteIds: string[] | null = null,
): Promise<Kpi[]> {
  const fazenda = await getFazendaAtiva();
  const supabase = await createClient();
  const fazendaId = fazenda?.id;
  let consultaAnimais = fazendaId
    ? supabase
        .from("animais")
        .select("id", { count: "exact", head: true })
        .eq("fazenda_id", fazendaId)
        .eq("status", "ativo")
        .is("deleted_at", null)
    : null;
  let consultaLotes = fazendaId
    ? supabase
        .from("lotes")
        .select("id", { count: "exact", head: true })
        .eq("fazenda_id", fazendaId)
        .eq("status", "ativo")
        .is("deleted_at", null)
    : null;

  if (consultaAnimais && propriedade) {
    consultaAnimais = consultaAnimais.eq("propriedade", propriedade);
  }

  if (consultaLotes && loteIds) {
    consultaLotes = loteIds.length === 0 ? null : consultaLotes.in("id", loteIds);
  }

  const [{ count: animais }, { count: lotes }, indicadores] = await Promise.all([
    consultaAnimais ?? Promise.resolve({ count: 0 }),
    consultaLotes ?? Promise.resolve({ count: 0 }),
    getIndicadoresPesagem(
      propriedade && loteIds ? { propriedade, loteIds } : undefined,
    ),
  ]);

  return [
    {
      id: "animais",
      rotulo: "Total de Animais",
      valor: animais ?? 0,
      variacao: null,
      sufixoVariacao: "%",
      direcao: "alta",
      icone: "animais",
    },
    {
      id: "lotes",
      rotulo: "Lotes Ativos",
      valor: lotes ?? 0,
      variacao: null,
      sufixoVariacao: "%",
      direcao: "alta",
      icone: "lotes",
    },
    {
      id: "peso",
      rotulo: "Peso Médio Atual",
      valor: indicadores.pesoMedio != null ? Math.round(indicadores.pesoMedio) : null,
      sufixoValor: " kg",
      variacao: null,
      sufixoVariacao: " kg",
      direcao: "alta",
      icone: "peso",
    },
    {
      id: "ganho",
      rotulo: "Ganho Médio Diário",
      valor: indicadores.gmdMedio,
      sufixoValor: " kg/dia",
      variacao: null,
      sufixoVariacao: "%",
      direcao: "alta",
      icone: "ganho",
    },
    {
      id: "custo",
      rotulo: "Custo @ (Produzida)",
      valor: indicadores.custoArroba,
      moeda: true,
      variacao: null,
      sufixoVariacao: "%",
      direcao: "baixa",
      icone: "custo",
    },
  ];
}

export async function getEvolucaoPeso(
  loteIds: string[] | null = null,
): Promise<PontoEvolucaoPeso[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda || loteIds?.length === 0) {
    return [];
  }

  const supabase = await createClient();
  let consulta = supabase
    .from("vw_pesagens_resumo")
    .select("data, peso_medio, status")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "concluida")
    .is("deleted_at", null)
    .order("data", { ascending: true });

  if (loteIds) {
    consulta = consulta.in("lote_id", loteIds);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error(error);
    return [];
  }

  const porMes = new Map<string, { soma: number; qtd: number; ordem: string }>();

  for (const linha of data ?? []) {
    if (!linha.data || linha.peso_medio == null) {
      continue;
    }

    const dataRef = new Date(`${linha.data}T00:00:00`);
    const chave = format(dataRef, "yyyy-MM");
    const mes = format(dataRef, "MMM", { locale: ptBR }).replace(".", "");
    const atual = porMes.get(chave) ?? { soma: 0, qtd: 0, ordem: mes };
    atual.soma += Number(linha.peso_medio);
    atual.qtd += 1;
    atual.ordem = mes;
    porMes.set(chave, atual);
  }

  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([, valor]) => ({
      mes: valor.ordem.slice(0, 3).replace(/^./, (letra) => letra.toUpperCase()),
      peso: Math.round(valor.soma / valor.qtd),
    }));
}

export async function getDesempenhoLotes(
  loteIds: string[] | null = null,
): Promise<DesempenhoLote[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda || loteIds?.length === 0) {
    return [];
  }

  const supabase = await createClient();
  let consulta = supabase
    .from("vw_pesagens_resumo")
    .select("lote_id, lote_nome, gmd_medio, data, status")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "concluida")
    .is("deleted_at", null)
    .order("data", { ascending: false });

  if (loteIds) {
    consulta = consulta.in("lote_id", loteIds);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error(error);
    return [];
  }

  const vistos = new Set<string>();
  const lotes: DesempenhoLote[] = [];

  for (const linha of data ?? []) {
    if (!linha.lote_id || !linha.lote_nome || linha.gmd_medio == null) {
      continue;
    }

    if (vistos.has(linha.lote_id)) {
      continue;
    }

    vistos.add(linha.lote_id);
    lotes.push({
      nome: linha.lote_nome,
      ganhoKgDia: Number(linha.gmd_medio),
    });

    if (lotes.length >= 5) {
      break;
    }
  }

  return lotes.sort((a, b) => b.ganhoKgDia - a.ganhoKgDia);
}

export async function getProximosManejos(
  loteIds: string[] | null = null,
): Promise<ProximoManejo[]> {
  const fazenda = await getFazendaAtiva();
  const atrasadosTodos = await getLotesAtrasadosPesagem();
  const atrasados = atrasadosTodos.filter((lote) => pertenceAoLote(lote.id, loteIds));
  const vacinasPendentes = fazenda
    ? (await getLotesComVacinaPendente()).filter((lote) =>
        pertenceAoLote(lote.lote_id, loteIds),
      )
    : [];
  const agora = new Date();

  const pesagens: ProximoManejo[] = atrasados.map((lote, indice) => {
    const data = new Date(agora);
    data.setDate(data.getDate() + indice);

    return {
      id: lote.id,
      titulo: "Pesagem atrasada",
      subtitulo: `${lote.nome} · ${lote.dias === 999 ? "nunca pesado" : `${lote.dias} dias`}`,
      data,
      tipo: "pesagem" as const,
      href: `/pesagens/nova?lote=${lote.id}`,
    };
  });

  const vacinacoes: ProximoManejo[] = vacinasPendentes.map((lote) => ({
    id: `vacina-${lote.lote_id}`,
    titulo: "Vacinação pendente",
    subtitulo: `${lote.nome} · ${lote.qtd_pendentes} animais`,
    data: agora,
    tipo: "vacinacao" as const,
    href: `/sanidade/vacinas/aplicar?lote=${lote.lote_id}`,
  }));

  const mistos: ProximoManejo[] = [];
  let i = 0;
  let j = 0;
  while (mistos.length < 8 && (i < pesagens.length || j < vacinacoes.length)) {
    if (i < pesagens.length) {
      mistos.push(pesagens[i]!);
      i += 1;
    }
    if (mistos.length >= 8) break;
    if (j < vacinacoes.length) {
      mistos.push(vacinacoes[j]!);
      j += 1;
    }
  }

  return mistos;
}

export async function getDistribuicaoRebanho(
  propriedade: PropriedadeAnimal | null = null,
): Promise<FatiaRebanho[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  let consulta = supabase
    .from("animais")
    .select("sexo, data_nascimento")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "ativo")
    .is("deleted_at", null);

  if (propriedade) {
    consulta = consulta.eq("propriedade", propriedade);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error(error);
    return [];
  }

  const contagem = {
    macho_0_12: 0,
    macho_12_24: 0,
    macho_24: 0,
    femea_0_12: 0,
    femea_12_24: 0,
    femea_24: 0,
    sem_idade: 0,
  };

  for (const animal of data ?? []) {
    const meses =
      animal.data_nascimento != null
        ? mesesDeIdade(animal.data_nascimento)
        : null;

    if (meses == null) {
      contagem.sem_idade += 1;
      continue;
    }

    if (animal.sexo === "macho") {
      if (meses < 12) contagem.macho_0_12 += 1;
      else if (meses < 24) contagem.macho_12_24 += 1;
      else contagem.macho_24 += 1;
    } else if (animal.sexo === "femea") {
      if (meses < 12) contagem.femea_0_12 += 1;
      else if (meses < 24) contagem.femea_12_24 += 1;
      else contagem.femea_24 += 1;
    } else {
      contagem.sem_idade += 1;
    }
  }

  const total = Object.values(contagem).reduce((soma, n) => soma + n, 0);

  if (total === 0) {
    return [];
  }

  const fatiasBase: {
    chave: keyof typeof contagem;
    rotulo: string;
    cor: string;
  }[] = [
    {
      chave: "macho_0_12",
      rotulo: "Machos (0–12 meses)",
      cor: CORES_DISTRIBUICAO.macho_0_12,
    },
    {
      chave: "macho_12_24",
      rotulo: "Machos (12–24 meses)",
      cor: CORES_DISTRIBUICAO.macho_12_24,
    },
    {
      chave: "macho_24",
      rotulo: "Machos (>24 meses)",
      cor: CORES_DISTRIBUICAO.macho_24,
    },
    {
      chave: "femea_0_12",
      rotulo: "Fêmeas (0–12 meses)",
      cor: CORES_DISTRIBUICAO.femea_0_12,
    },
    {
      chave: "femea_12_24",
      rotulo: "Fêmeas (12–24 meses)",
      cor: CORES_DISTRIBUICAO.femea_12_24,
    },
    {
      chave: "femea_24",
      rotulo: "Fêmeas (>24 meses)",
      cor: CORES_DISTRIBUICAO.femea_24,
    },
  ];

  const fatias: FatiaRebanho[] = fatiasBase
    .filter((item) => contagem[item.chave] > 0)
    .map((item) => ({
      rotulo: item.rotulo,
      quantidade: contagem[item.chave],
      percentual: Math.round((contagem[item.chave] / total) * 100),
      cor: item.cor,
    }));

  if (contagem.sem_idade > 0) {
    fatias.push({
      rotulo: "Sem data de nascimento",
      quantidade: contagem.sem_idade,
      percentual: Math.round((contagem.sem_idade / total) * 100),
      cor: CORES_DISTRIBUICAO.sem_idade,
    });
  }

  return fatias;
}

export async function getUltimasOcorrencias(
  loteIds: string[] | null = null,
): Promise<Ocorrencia[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  let consultaPesagens = supabase
    .from("vw_pesagens_resumo")
    .select("id, lote_id, lote_nome, qtd_pesados, data, status")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .limit(8);

  if (loteIds && loteIds.length > 0) {
    consultaPesagens = consultaPesagens.in("lote_id", loteIds);
  }

  const [{ data, error }, sessoesVacina, sessoesMedicacao] = await Promise.all([
    loteIds?.length === 0 ? Promise.resolve({ data: [], error: null }) : consultaPesagens,
    getSessoesRecentes(loteIds ? 40 : 8),
    getSessoesMedicacao(),
  ]);

  if (error) {
    console.error(error);
  }

  const pesagens: Ocorrencia[] = (data ?? []).flatMap((linha) => {
    if (!linha.id || !linha.data) {
      return [];
    }

    return [
      {
        id: linha.id,
        titulo:
          linha.status === "concluida"
            ? "Pesagem realizada"
            : "Pesagem em andamento",
        subtitulo: `${linha.lote_nome ?? "Lote"} · ${linha.qtd_pesados ?? 0} animais`,
        data: new Date(`${linha.data}T00:00:00`),
        tipo: "pesagem" as const,
        href: `/pesagens/${linha.id}`,
      },
    ];
  });

  const vacinacoes: Ocorrencia[] = sessoesVacina
    .filter((sessao) => pertenceAoLote(sessao.lote_id, loteIds))
    .map((sessao) => ({
    id: `vacina-${sessao.id}`,
    titulo: "Vacinação realizada",
    subtitulo: `${sessao.lote_nome} · ${sessao.qtd_aplicados} animais`,
    data: new Date(`${sessao.data}T00:00:00`),
    tipo: "vacinacao" as const,
    href: "/sanidade/vacinas",
  }));

  const medicacoes: Ocorrencia[] = sessoesMedicacao
    .filter((sessao) => pertenceAoLote(sessao.lote_id, loteIds))
    .slice(0, 8)
    .map((sessao) => ({
    id: `medicacao-${sessao.id}`,
    titulo: "Medicação registrada",
    subtitulo: `${sessao.medicamento_nome} · ${sessao.lote_nome ?? "Sem lote"} · ${sessao.qtd_aplicados ?? 0} animais`,
    data: new Date(`${sessao.data}T00:00:00`),
    tipo: "medicacao" as const,
    href: "/sanidade/medicacoes",
  }));

  return [...pesagens, ...vacinacoes, ...medicacoes]
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, 8);
}

export async function getRebanhoPorFazenda(): Promise<RebanhoFazenda[]> {
  const vazio: RebanhoFazenda[] = [
    { propriedade: "joana", rotulo: "Fazenda Joana", quantidade: 0, percentual: 0 },
    { propriedade: "catagua", rotulo: "Fazenda Cataguá", quantidade: 0, percentual: 0 },
  ];

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return vazio;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animais")
    .select("propriedade")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "ativo")
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    return vazio;
  }

  const joana = (data ?? []).filter((item) => item.propriedade === "joana").length;
  const catagua = (data ?? []).filter((item) => item.propriedade === "catagua").length;
  const total = joana + catagua;

  return [
    {
      propriedade: "joana",
      rotulo: "Fazenda Joana",
      quantidade: joana,
      percentual: total === 0 ? 0 : Math.round((joana / total) * 100),
    },
    {
      propriedade: "catagua",
      rotulo: "Fazenda Cataguá",
      quantidade: catagua,
      percentual: total === 0 ? 0 : Math.round((catagua / total) * 100),
    },
  ];
}

export type PesagemCustoCard = {
  id: string;
  loteId: string;
  loteNome: string;
  data: string;
  custo: number | null;
  ganhoKg: number | null;
  fotos: { categoria: CategoriaCusto; valor: number }[];
};

export async function getPesagensCustoCard(loteIds: string[] | null = null): Promise<{
  pesagens: PesagemCustoCard[];
  lotes: { id: string; nome: string }[];
}> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { pesagens: [], lotes: [] };
  }

  const supabase = await createClient();
  const [{ data: pesagens }, { data: lotes }, { data: fotos }] = await Promise.all([
    supabase
      .from("vw_pesagens_resumo")
      .select("id, lote_id, lote_nome, data, status, ganho_total_kg, custo_alimentacao")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "concluida")
      .is("deleted_at", null),
    supabase
      .from("lotes")
      .select("id, nome")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null)
      .order("nome"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("pesagem_custo_itens")
      .select("pesagem_id, categoria, valor_snapshot")
      .eq("fazenda_id", fazenda.id),
  ]);

  const fotosPorPesagem = new Map<string, PesagemCustoCard["fotos"]>();

  for (const foto of fotos ?? []) {
    const lista = fotosPorPesagem.get(foto.pesagem_id) ?? [];
    const categoria =
      foto.categoria === "sanidade" || foto.categoria === "outro"
        ? foto.categoria
        : "alimentacao";
    lista.push({ categoria, valor: Number(foto.valor_snapshot) });
    fotosPorPesagem.set(foto.pesagem_id, lista);
  }

  return {
    lotes: (lotes ?? []).filter((lote) => pertenceAoLote(lote.id, loteIds)),
    pesagens: (pesagens ?? []).flatMap((item) => {
      if (!item.id || !item.lote_id || !item.data || !pertenceAoLote(item.lote_id, loteIds)) {
        return [];
      }

      return [
        {
          id: item.id,
          loteId: item.lote_id,
          loteNome: item.lote_nome ?? "Lote",
          data: item.data,
          custo: item.custo_alimentacao,
          ganhoKg: item.ganho_total_kg,
          fotos: fotosPorPesagem.get(item.id) ?? [],
        },
      ];
    }),
  };
}
