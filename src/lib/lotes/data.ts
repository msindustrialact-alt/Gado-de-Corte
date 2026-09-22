import { getFazendaAtiva } from "@/lib/fazenda";
import type { LoteDetalhe, LoteResumo } from "@/lib/lotes";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

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

type LinhaLoteResumo = Pick<
  Tables<"vw_lotes_resumo">,
  | "id"
  | "nome"
  | "objetivo"
  | "status"
  | "data_formacao"
  | "observacoes"
  | "qtd_animais"
  | "peso_medio"
>;

function mapearLote(linha: LinhaLoteResumo): LoteResumo | null {
  if (!linha.id || !linha.nome || !linha.status) {
    return null;
  }

  return {
    id: linha.id,
    nome: linha.nome,
    objetivo: linha.objetivo,
    status: linha.status,
    data_formacao: linha.data_formacao,
    observacoes: linha.observacoes,
    qtd_animais: numeroOuZero(linha.qtd_animais),
    peso_medio: numeroOuNulo(linha.peso_medio),
  };
}

export async function getLotes(): Promise<LoteResumo[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_lotes_resumo")
    .select(
      "id, nome, objetivo, status, data_formacao, observacoes, qtd_animais, peso_medio, fazenda_id, deleted_at",
    )
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os lotes.");
  }

  return (data ?? []).flatMap((linha) => {
    const lote = mapearLote(linha);
    return lote ? [lote] : [];
  });
}

export async function getLotePorId(id: string): Promise<LoteDetalhe | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_lotes_resumo")
    .select(
      "id, nome, objetivo, status, data_formacao, observacoes, qtd_animais, peso_medio, fazenda_id, deleted_at",
    )
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  const lote = data ? mapearLote(data) : null;

  if (!lote) {
    return null;
  }

  const { data: sexos, error: erroSexos } = await supabase
    .from("animais")
    .select("sexo")
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", id)
    .eq("status", "ativo")
    .is("deleted_at", null);

  if (erroSexos) {
    console.error(erroSexos);
  }

  const machos = (sexos ?? []).filter((item) => item.sexo === "macho").length;
  const femeas = (sexos ?? []).filter((item) => item.sexo === "femea").length;

  return { ...lote, machos, femeas };
}

export async function contarAnimaisAtivosDoLote(loteId: string): Promise<number> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return 0;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("animais")
    .select("id", { count: "exact", head: true })
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", loteId)
    .eq("status", "ativo")
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}

