import { getFazendaAtiva } from "@/lib/fazenda";
import type {
  CategoriaProduto,
  LancamentoLoteItem,
  LoteOpcaoEstoque,
  ProdutoItem,
} from "@/lib/estoque";
import { createClient } from "@/lib/supabase/server";

function numeroOuZero(valor: number | string | null | undefined): number {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
}

export async function getProdutos(opts?: {
  categoria?: CategoriaProduto;
  soAtivos?: boolean;
  comEstoque?: boolean;
}): Promise<ProdutoItem[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("produtos")
    .select(
      "id, nome, categoria, unidade, estoque_atual, custo_medio, ativo, observacoes",
    )
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("nome", { ascending: true });

  if (opts?.categoria) {
    query = query.eq("categoria", opts.categoria);
  }

  if (opts?.soAtivos !== false) {
    query = query.eq("ativo", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os produtos.");
  }

  let lista = ((data ?? []) as ProdutoItem[]).map((item) => ({
    ...item,
    estoque_atual: numeroOuZero(item.estoque_atual),
    custo_medio: numeroOuZero(item.custo_medio),
  }));

  if (opts?.comEstoque) {
    lista = lista.filter((item) => item.estoque_atual > 0);
  }

  return lista;
}

export async function getLotesComCabecas(): Promise<LoteOpcaoEstoque[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_lotes_resumo")
    .select("id, nome, qtd_animais, status")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .eq("status", "ativo")
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? [])
    .filter((lote) => lote.id && numeroOuZero(lote.qtd_animais) > 0)
    .map((lote) => ({
      id: lote.id!,
      nome: lote.nome ?? "Lote",
      qtd_animais: numeroOuZero(lote.qtd_animais),
    }));
}

export async function getLancamentosRecentes(
  limite = 30,
): Promise<LancamentoLoteItem[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("lancamentos_lote")
    .select(
      `
      id,
      lote_id,
      produto_id,
      categoria,
      data_inicio,
      data_fim,
      quantidade,
      custo_total,
      qtd_cabecas_snapshot,
      custo_por_cabeca,
      observacoes,
      lote:lotes!inner(nome),
      produto:produtos!inner(nome, unidade)
    `,
    )
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("data_inicio", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) {
    console.error(error);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((linha) => {
    const lote = linha.lote as { nome?: string } | null;
    const produto = linha.produto as { nome?: string; unidade?: string } | null;

    return {
      id: String(linha.id),
      lote_id: String(linha.lote_id),
      lote_nome: lote?.nome ?? "Lote",
      produto_id: String(linha.produto_id),
      produto_nome: produto?.nome ?? "Produto",
      categoria: linha.categoria as CategoriaProduto,
      data_inicio: String(linha.data_inicio),
      data_fim: linha.data_fim ? String(linha.data_fim) : null,
      quantidade: numeroOuZero(linha.quantidade as number),
      unidade: produto?.unidade ?? "un",
      custo_total: numeroOuZero(linha.custo_total as number),
      qtd_cabecas_snapshot: numeroOuZero(linha.qtd_cabecas_snapshot as number),
      custo_por_cabeca: numeroOuZero(linha.custo_por_cabeca as number),
      observacoes: (linha.observacoes as string | null) ?? null,
    };
  });
}
