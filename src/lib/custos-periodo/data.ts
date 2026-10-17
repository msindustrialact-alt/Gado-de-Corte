import {
  classificarLancamentos,
  type CategoriaCusto,
  type LancamentoPeriodo,
  type LinhaCustoPeriodo,
} from "@/lib/custos-periodo/calculo";
import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";

export type ConsultaCustoPeriodo = {
  pesagemId: string;
  loteId: string;
  dataPesagem: string;
  dataAnterior: string | null;
  linhas: LinhaCustoPeriodo[];
};

function categoriaDe(valor: string): CategoriaCusto {
  if (valor === "sanidade" || valor === "outro") {
    return valor;
  }

  return "alimentacao";
}

export async function consultarCustosPeriodo(
  pesagemId: string,
): Promise<ConsultaCustoPeriodo | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  const { data: pesagem } = await supabase
    .from("pesagens")
    .select("id, lote_id, data, status")
    .eq("id", pesagemId)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!pesagem) {
    return null;
  }

  const { data: anterior } = await supabase
    .from("pesagens")
    .select("data")
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", pesagem.lote_id)
    .eq("status", "concluida")
    .is("deleted_at", null)
    .lt("data", pesagem.data)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lancamentos, error } = await (supabase as any)
    .from("lancamentos_lote")
    .select(
      "id, data_inicio, data_fim, categoria, custo_total, quantidade, produto:produtos ( nome, unidade )",
    )
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", pesagem.lote_id)
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    throw new Error("Não foi possível consultar os custos do período.");
  }

  const linhasBase: LancamentoPeriodo[] = (lancamentos ?? []).map(
    (linha: {
      id: string;
      data_inicio: string;
      data_fim: string | null;
      categoria: string;
      custo_total: number;
      quantidade: number;
      produto: { nome?: string; unidade?: string } | { nome?: string; unidade?: string }[] | null;
    }) => {
      const produto = Array.isArray(linha.produto) ? linha.produto[0] : linha.produto;

      return {
        id: linha.id,
        data_inicio: linha.data_inicio,
        data_fim: linha.data_fim,
        categoria: categoriaDe(linha.categoria),
        custo_total: Number(linha.custo_total),
        quantidade: Number(linha.quantidade),
        produto_nome: produto?.nome ?? "Produto",
        unidade: produto?.unidade ?? "",
      };
    },
  );

  return {
    pesagemId: pesagem.id,
    loteId: pesagem.lote_id,
    dataPesagem: pesagem.data,
    dataAnterior: anterior?.data ?? null,
    linhas: classificarLancamentos(linhasBase, pesagem.data, anterior?.data ?? null),
  };
}

export async function gravarCustosPeriodo(
  pesagemId: string,
  lancamentoIds: string[],
): Promise<{ ok: true; total: number } | { ok: false; message: string }> {
  const consulta = await consultarCustosPeriodo(pesagemId);

  if (!consulta) {
    return { ok: false, message: "Pesagem não encontrada." };
  }

  const escolhidos = new Set(lancamentoIds);
  const linhas = consulta.linhas.filter((linha) => escolhidos.has(linha.id));
  const total = Math.round(linhas.reduce((soma, linha) => soma + linha.custo_total, 0) * 100) / 100;
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error: erroDelete } = await db
    .from("pesagem_custo_itens")
    .delete()
    .eq("pesagem_id", pesagemId)
    .eq("fazenda_id", fazenda.id);

  if (erroDelete) {
    console.error(erroDelete);
    return { ok: false, message: "Não foi possível atualizar o custo do período." };
  }

  if (linhas.length > 0) {
    const { error: erroInsert } = await db.from("pesagem_custo_itens").insert(
      linhas.map((linha) => ({
        fazenda_id: fazenda.id,
        pesagem_id: pesagemId,
        lancamento_lote_id: linha.id,
        categoria: linha.categoria,
        valor_snapshot: linha.custo_total,
      })),
    );

    if (erroInsert) {
      console.error(erroInsert);
      return { ok: false, message: "Não foi possível gravar o detalhe do custo." };
    }
  }

  const { error: erroPesagem } = await supabase
    .from("pesagens")
    .update({ custo_alimentacao: total })
    .eq("id", pesagemId)
    .eq("fazenda_id", fazenda.id);

  if (erroPesagem) {
    console.error(erroPesagem);
    return { ok: false, message: "Não foi possível gravar o custo do período." };
  }

  return { ok: true, total };
}
