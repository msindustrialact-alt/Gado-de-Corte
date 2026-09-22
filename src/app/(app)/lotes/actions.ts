"use server";

import { revalidatePath } from "next/cache";

import {
  ehViolacaoUnica,
  falhaValidacao,
  type ResultadoAcao,
} from "@/lib/acao";
import { getFazendaAtiva } from "@/lib/fazenda";
import { contarAnimaisAtivosDoLote } from "@/lib/lotes/data";
import { paraAtualizacaoLote, paraRegistroLote, schemaLote } from "@/lib/lotes/schema";
import { createClient } from "@/lib/supabase/server";

function revalidarLotes(id?: string) {
  revalidatePath("/lotes");
  revalidatePath("/animais");
  revalidatePath("/pastagens");

  if (id) {
    revalidatePath(`/lotes/${id}`);
  }
}

function mensagemAnimaisAtivos(quantidade: number): ResultadoAcao {
  return {
    ok: false,
    message: `Este lote tem ${quantidade} animais ativos. Mova-os para outro lote antes.`,
  };
}

function traduzirErro(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}): ResultadoAcao {
  if (ehViolacaoUnica(error, "uq_lotes_fazenda_nome")) {
    return {
      ok: false,
      message: "Já existe um lote com este nome.",
      fieldErrors: { nome: ["Já existe um lote com este nome"] },
    };
  }

  return {
    ok: false,
    message: "Não foi possível salvar o lote. Tente de novo.",
  };
}

export async function criarLote(dados: unknown): Promise<ResultadoAcao> {
  const parsed = schemaLote.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const registro = paraRegistroLote(parsed.data);

  const { data, error } = await supabase
    .from("lotes")
    .insert({
      ...registro,
      status: "ativo",
      fazenda_id: fazenda.id,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return traduzirErro(error ?? {});
  }

  revalidarLotes(data.id);
  return { ok: true, message: "Lote criado." };
}

export async function atualizarLote(
  id: string,
  dados: unknown,
): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Lote inválido." };
  }

  const parsed = schemaLote.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("lotes")
    .select("status")
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!atual) {
    return { ok: false, message: "Lote não encontrado." };
  }

  if (parsed.data.status === "encerrado" && atual.status !== "encerrado") {
    const ativos = await contarAnimaisAtivosDoLote(id);

    if (ativos > 0) {
      return mensagemAnimaisAtivos(ativos);
    }
  }

  const { data, error } = await supabase
    .from("lotes")
    .update(paraAtualizacaoLote(parsed.data))
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return traduzirErro(error);
  }

  if (!data) {
    return { ok: false, message: "Lote não encontrado." };
  }

  revalidarLotes(id);
  return { ok: true, message: "Lote atualizado." };
}

export async function alterarStatusLote(
  id: string,
  status: "ativo" | "encerrado",
): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Lote inválido." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  if (status === "encerrado") {
    const ativos = await contarAnimaisAtivosDoLote(id);

    if (ativos > 0) {
      return mensagemAnimaisAtivos(ativos);
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lotes")
    .update({ status })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível atualizar o status do lote." };
  }

  if (!data) {
    return { ok: false, message: "Lote não encontrado." };
  }

  revalidarLotes(id);
  return {
    ok: true,
    message: status === "encerrado" ? "Lote encerrado." : "Lote reaberto.",
  };
}

export async function arquivarLote(id: string): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Lote inválido." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const ativos = await contarAnimaisAtivosDoLote(id);

  if (ativos > 0) {
    return mensagemAnimaisAtivos(ativos);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lotes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível arquivar o lote. Tente de novo." };
  }

  if (!data) {
    return { ok: false, message: "Lote não encontrado." };
  }

  revalidarLotes(id);
  return { ok: true, message: "Lote arquivado." };
}
