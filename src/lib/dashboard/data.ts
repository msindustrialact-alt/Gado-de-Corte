import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import {
  MOCK_DISTRIBUICAO_REBANHO,
  type DesempenhoLote,
  type FatiaRebanho,
  type Kpi,
  type Ocorrencia,
  type PontoEvolucaoPeso,
  type ProximoManejo,
  type RebanhoFazenda,
} from "@/lib/dashboard/mock";
import { getFazendaAtiva } from "@/lib/fazenda";
import { getIndicadoresPesagem, getLotesAtrasadosPesagem } from "@/lib/pesagens/data";
import { createClient } from "@/lib/supabase/server";

export type {
  DesempenhoLote,
  FatiaRebanho,
  Kpi,
  Ocorrencia,
  PontoEvolucaoPeso,
  ProximoManejo,
  RebanhoFazenda,
};

export async function getKpis(): Promise<Kpi[]> {
  const fazenda = await getFazendaAtiva();
  const supabase = await createClient();
  const fazendaId = fazenda?.id;

  const [{ count: animais }, { count: lotes }, indicadores] = await Promise.all([
    fazendaId
      ? supabase
          .from("animais")
          .select("id", { count: "exact", head: true })
          .eq("fazenda_id", fazendaId)
          .eq("status", "ativo")
          .is("deleted_at", null)
      : Promise.resolve({ count: 0 }),
    fazendaId
      ? supabase
          .from("lotes")
          .select("id", { count: "exact", head: true })
          .eq("fazenda_id", fazendaId)
          .eq("status", "ativo")
          .is("deleted_at", null)
      : Promise.resolve({ count: 0 }),
    getIndicadoresPesagem(),
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

export async function getEvolucaoPeso(): Promise<PontoEvolucaoPeso[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_pesagens_resumo")
    .select("data, peso_medio, status")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "concluida")
    .is("deleted_at", null)
    .order("data", { ascending: true });

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

export async function getDesempenhoLotes(): Promise<DesempenhoLote[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_pesagens_resumo")
    .select("lote_id, lote_nome, gmd_medio, data, status")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "concluida")
    .is("deleted_at", null)
    .order("data", { ascending: false });

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

export async function getProximosManejos(): Promise<ProximoManejo[]> {
  const atrasados = await getLotesAtrasadosPesagem();
  const agora = new Date();

  return atrasados.map((lote, indice) => {
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
}

export async function getDistribuicaoRebanho(): Promise<FatiaRebanho[]> {
  return MOCK_DISTRIBUICAO_REBANHO;
}

export async function getUltimasOcorrencias(): Promise<Ocorrencia[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_pesagens_resumo")
    .select("id, lote_nome, qtd_pesados, data, status")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .limit(5);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).flatMap((linha) => {
    if (!linha.id || !linha.data) {
      return [];
    }

    return [
      {
        id: linha.id,
        titulo: linha.status === "concluida" ? "Pesagem realizada" : "Pesagem em andamento",
        subtitulo: `${linha.lote_nome ?? "Lote"} · ${linha.qtd_pesados ?? 0} animais`,
        data: new Date(`${linha.data}T00:00:00`),
        tipo: "pesagem" as const,
        href: `/pesagens/${linha.id}`,
      },
    ];
  });
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
