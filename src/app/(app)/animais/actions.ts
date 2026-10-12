"use server";

import { revalidatePath } from "next/cache";

import { buscarParentes as buscarParentesDados } from "@/lib/animais/data";
import {
  errosDoZod,
  paraRegistroAnimal,
  schemaAnimal,
} from "@/lib/animais/schema";
import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";

export type ResultadoAnimal =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function arquivarAnimal(
  id: string,
): Promise<{ ok: true } | { ok: false; mensagem: string }> {
  if (!id) {
    return { ok: false, mensagem: "Animal inválido." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, mensagem: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animais")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      mensagem: "Não foi possível arquivar o animal. Tente de novo.",
    };
  }

  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath(`/animais/${id}/editar`);
  revalidatePath("/lotes");
  revalidatePath("/pastagens");

  return { ok: true };
}

export async function buscarParentes(params: {
  q: string;
  sexo: "macho" | "femea";
  excluirId?: string;
}) {
  return buscarParentesDados(params);
}

function traduzirErroPostgres(
  error: { code?: string; message?: string; details?: string; hint?: string },
): ResultadoAnimal {
  const mensagem = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ");

  if (error.code === "23505") {
    if (mensagem.includes("uq_animais_fazenda_brinco_eletronico")) {
      return {
        ok: false,
        message: "Já existe um animal com este brinco eletrônico nesta fazenda.",
        fieldErrors: {
          brinco_eletronico: [
            "Já existe um animal com este brinco eletrônico nesta fazenda.",
          ],
        },
      };
    }

    if (mensagem.includes("uq_animais_fazenda_sisbov")) {
      return {
        ok: false,
        message: "Já existe um animal com este SISBOV nesta fazenda.",
        fieldErrors: {
          sisbov: ["Já existe um animal com este SISBOV nesta fazenda."],
        },
      };
    }

    if (mensagem.includes("uq_animais_fazenda_brinco")) {
      return {
        ok: false,
        message: "Já existe um animal com este brinco nesta fazenda.",
        fieldErrors: {
          brinco: ["Já existe um animal com este brinco nesta fazenda."],
        },
      };
    }

    return {
      ok: false,
      message: "Já existe um animal com estes dados nesta fazenda.",
    };
  }

  if (
    error.code === "P0001" ||
    mensagem.includes("módulo de pesagens") ||
    mensagem.includes("Registrar pesagem")
  ) {
    return {
      ok: false,
      message:
        "Peso atual só pode ser alterado pelo módulo de pesagens. Use Registrar pesagem ou o histórico do animal.",
      fieldErrors: {
        peso_atual: [
          "Peso controlado pelo histórico de pesagens concluídas.",
        ],
      },
    };
  }

  if (error.code === "23514") {
    return {
      ok: false,
      message:
        "Alguns dados não atendem às regras do cadastro. Confira datas, pesos e a saída.",
    };
  }

  return {
    ok: false,
    message: "Não foi possível salvar o animal. Tente de novo.",
  };
}

export async function criarAnimal(dados: unknown): Promise<ResultadoAnimal> {
  const parsed = schemaAnimal.safeParse(dados);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Confira os campos destacados.",
      fieldErrors: errosDoZod(parsed.error),
    };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const registro = paraRegistroAnimal(parsed.data);

  const { data, error } = await supabase
    .from("animais")
    .insert({
      ...registro,
      fazenda_id: fazenda.id,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return traduzirErroPostgres(error ?? {});
  }

  revalidatePath("/animais");
  revalidatePath(`/animais/${data.id}`);
  revalidatePath("/lotes");
  revalidatePath("/pastagens");

  return { ok: true, id: data.id };
}

export async function atualizarAnimal(
  id: string,
  dados: unknown,
): Promise<ResultadoAnimal> {
  if (!id) {
    return { ok: false, message: "Animal inválido." };
  }

  const parsed = schemaAnimal.safeParse({ ...asObject(dados), id });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Confira os campos destacados.",
      fieldErrors: errosDoZod(parsed.error),
    };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const registro = paraRegistroAnimal(parsed.data);

  const { data, error } = await supabase
    .from("animais")
    .update(registro)
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return traduzirErroPostgres(error);
  }

  if (!data) {
    return { ok: false, message: "Animal não encontrado." };
  }

  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath(`/animais/${id}/editar`);
  revalidatePath("/lotes");
  revalidatePath("/pastagens");

  return { ok: true, id: data.id };
}

const LIMITE_MOVER_LOTE = 500;

export async function moverAnimaisParaLote(
  ids: string[],
  loteId: string,
): Promise<{ ok: true; quantidade: number } | { ok: false; message: string }> {
  const unicos = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];

  if (unicos.length === 0) {
    return { ok: false, message: "Selecione ao menos um animal." };
  }

  if (unicos.length > LIMITE_MOVER_LOTE) {
    return {
      ok: false,
      message: `Selecione no máximo ${LIMITE_MOVER_LOTE} animais por vez.`,
    };
  }

  if (unicos.some((id) => !/^[0-9a-f-]{36}$/i.test(id))) {
    return { ok: false, message: "Há um animal inválido na seleção." };
  }

  const destino = loteId.trim();

  if (destino && !/^[0-9a-f-]{36}$/i.test(destino)) {
    return { ok: false, message: "Lote inválido." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();

  if (destino) {
    const { data: lote, error: erroLote } = await supabase
      .from("lotes")
      .select("id")
      .eq("id", destino)
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null)
      .maybeSingle();

    if (erroLote || !lote) {
      return { ok: false, message: "Esse lote não está disponível." };
    }
  }

  const { data, error } = await supabase
    .from("animais")
    .update({ lote_id: destino || null })
    .in("id", unicos)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível mover os animais." };
  }

  const quantidade = data?.length ?? 0;

  if (quantidade === 0) {
    return { ok: false, message: "Nenhum animal foi movido." };
  }

  revalidatePath("/animais");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
  revalidatePath("/pastagens");

  if (destino) {
    revalidatePath(`/lotes/${destino}`);
  }

  return { ok: true, quantidade };
}

function asObject(dados: unknown): Record<string, unknown> {
  if (dados && typeof dados === "object") {
    return dados as Record<string, unknown>;
  }

  return {};
}
