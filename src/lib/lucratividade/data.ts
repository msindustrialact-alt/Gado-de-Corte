import { hojeISO } from "@/lib/animais";
import { getFazendaAtiva } from "@/lib/fazenda";
import type { LoteLucratividadeBase } from "@/lib/lucratividade";
import { createClient } from "@/lib/supabase/server";

function numeroOuZero(valor: number | string | null | undefined): number {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
}

function numeroOuNulo(valor: number | string | null | undefined): number | null {
  if (valor == null || valor === "") {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function media(valores: number[]): number | null {
  if (valores.length === 0) {
    return null;
  }

  return valores.reduce((acc, item) => acc + item, 0) / valores.length;
}

type CustosInsumosLote = {
  custo_alimentacao: number | string | null;
  custo_sanidade: number | string | null;
  custo_outro: number | string | null;
};

/**
 * Agrega custos e pesos do lote para o painel de lucratividade.
 * Suplementação = pesagens concluídas + lançamentos de alimentação (+ outros insumos).
 * Sanidade = lançamentos categoria sanidade.
 * Data de entrada de referência = mais antiga entre os ativos.
 */
export async function getBaseLucratividadeLote(
  loteId: string,
): Promise<LoteLucratividadeBase | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  // Tabelas/views novas — tipagem completa após regenerar database.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [
    { data: lote, error: erroLote },
    { data: animais, error: erroAnimais },
    { data: insumos, error: erroInsumos },
  ] = await Promise.all([
    supabase
      .from("lotes")
      .select("id, nome")
      .eq("id", loteId)
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("animais")
      .select("peso_entrada, peso_atual, data_entrada, valor_aquisicao")
      .eq("fazenda_id", fazenda.id)
      .eq("lote_id", loteId)
      .eq("status", "ativo")
      .is("deleted_at", null),
    db
      .from("vw_custos_lote_insumos")
      .select("custo_alimentacao, custo_sanidade, custo_outro")
      .eq("fazenda_id", fazenda.id)
      .eq("lote_id", loteId)
      .maybeSingle(),
  ]);

  if (erroLote) {
    console.error(erroLote);
    return null;
  }

  if (!lote) {
    return null;
  }

  if (erroAnimais) {
    console.error(erroAnimais);
  }

  if (erroInsumos) {
    console.error(erroInsumos);
  }

  const lista = animais ?? [];
  const pesosEntrada = lista
    .map((item) => numeroOuNulo(item.peso_entrada))
    .filter((valor): valor is number => valor != null);
  const pesosAtuais = lista
    .map((item) => numeroOuNulo(item.peso_atual))
    .filter((valor): valor is number => valor != null);

  const datasEntrada = lista
    .map((item) => item.data_entrada)
    .filter((valor): valor is string => Boolean(valor))
    .sort();

  const custoAquisicao = lista.reduce(
    (acc, item) => acc + numeroOuZero(item.valor_aquisicao),
    0,
  );

  const custosInsumos = (insumos ?? null) as CustosInsumosLote | null;
  const custoAlimentacaoLancamentos = numeroOuZero(
    custosInsumos?.custo_alimentacao,
  );
  const custoSanidade = numeroOuZero(custosInsumos?.custo_sanidade);
  const custoOutroInsumos = numeroOuZero(custosInsumos?.custo_outro);

  return {
    lote_id: lote.id,
    lote_nome: lote.nome,
    qtd_cabecas: lista.length,
    data_entrada_ref: datasEntrada[0] ?? null,
    peso_entrada_medio: media(pesosEntrada),
    peso_atual_medio: media(pesosAtuais),
    custo_aquisicao_total: custoAquisicao,
    custo_suplementacao_ate_hoje:
      custoAlimentacaoLancamentos + custoOutroInsumos,
    custo_sanidade_ate_hoje: custoSanidade,
    hoje: hojeISO(),
  };
}
