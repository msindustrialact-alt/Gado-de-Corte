"use server";

import { revalidatePath } from "next/cache";

import {
  ehViolacaoUnica,
  falhaValidacao,
  type ResultadoAcao,
} from "@/lib/acao";
import { getFazendaAtiva } from "@/lib/fazenda";
import { contarAnimaisAtivosDoPiquete, getAnimaisDoPiquete } from "@/lib/pastagens/data";
import {
  paraAtualizacaoPiquete,
  paraRegistroPiquete,
  schemaPiquete,
} from "@/lib/pastagens/schema";
import { createClient } from "@/lib/supabase/server";

function revalidarPastagens() {
  revalidatePath("/pastagens");
  revalidatePath("/animais");
  revalidatePath("/lotes");
}

function mensagemAnimaisAtivos(quantidade: number): ResultadoAcao {
  return {
    ok: false,
    message: `Este piquete tem ${quantidade} animais ativos. Mova-os para outro piquete antes.`,
  };
}

function traduzirErro(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}): ResultadoAcao {
  if (ehViolacaoUnica(error, "uq_piquetes_fazenda_nome")) {
    return {
      ok: false,
      message: "Já existe um piquete com este nome.",
      fieldErrors: { nome: ["Já existe um piquete com este nome"] },
    };
  }

  return {
    ok: false,
    message: "Não foi possível salvar o piquete. Tente de novo.",
  };
}

export async function criarPiquete(dados: unknown): Promise<ResultadoAcao> {
  const parsed = schemaPiquete.safeParse(dados);

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

  const { data, error } = await supabase
    .from("piquetes")
    .insert({
      ...paraRegistroPiquete(parsed.data),
      fazenda_id: fazenda.id,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return traduzirErro(error ?? {});
  }

  revalidarPastagens();
  return { ok: true, message: "Piquete criado." };
}

export async function atualizarPiquete(
  id: string,
  dados: unknown,
): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Piquete inválido." };
  }

  const parsed = schemaPiquete.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("piquetes")
    .select("status")
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!atual) {
    return { ok: false, message: "Piquete não encontrado." };
  }

  if (parsed.data.status === "inativo" && atual.status !== "inativo") {
    const ativos = await contarAnimaisAtivosDoPiquete(id);

    if (ativos > 0) {
      return mensagemAnimaisAtivos(ativos);
    }
  }

  const { data, error } = await supabase
    .from("piquetes")
    .update(paraAtualizacaoPiquete(parsed.data))
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
    return { ok: false, message: "Piquete não encontrado." };
  }

  revalidarPastagens();
  return { ok: true, message: "Piquete atualizado." };
}

export async function listarAnimaisDoPiquete(id: string) {
  if (!id) {
    return [];
  }

  try {
    return await getAnimaisDoPiquete(id);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function arquivarPiquete(id: string): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Piquete inválido." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const ativos = await contarAnimaisAtivosDoPiquete(id);

  if (ativos > 0) {
    return mensagemAnimaisAtivos(ativos);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("piquetes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return {
      ok: false,
      message: "Não foi possível arquivar o piquete. Tente de novo.",
    };
  }

  if (!data) {
    return { ok: false, message: "Piquete não encontrado." };
  }

  revalidarPastagens();
  return { ok: true, message: "Piquete arquivado." };
}
