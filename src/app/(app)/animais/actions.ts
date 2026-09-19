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

export type ResultadoRaca =
  | { ok: true; id: string; nome: string }
  | { ok: false; message: string };

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

  return { ok: true };
}

export async function buscarParentes(params: {
  q: string;
  sexo: "macho" | "femea";
  excluirId?: string;
}) {
  return buscarParentesDados(params);
}

export async function criarRaca(nomeBruto: string): Promise<ResultadoRaca> {
  const nome = nomeBruto.trim();

  if (!nome) {
    return { ok: false, message: "Informe o nome da raça." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data: existentes, error: erroBusca } = await supabase
    .from("racas")
    .select("id, nome")
    .eq("ativa", true)
    .or(`fazenda_id.is.null,fazenda_id.eq.${fazenda.id}`)
    .ilike("nome", nome);

  if (!erroBusca) {
    const igual = (existentes ?? []).find(
      (raca) => raca.nome.localeCompare(nome, "pt-BR", { sensitivity: "accent" }) === 0,
    );

    if (igual) {
      return { ok: true, id: igual.id, nome: igual.nome };
    }
  }

  const { data, error } = await supabase
    .from("racas")
    .insert({
      nome,
      fazenda_id: fazenda.id,
      ativa: true,
    })
    .select("id, nome")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: conflito } = await supabase
        .from("racas")
        .select("id, nome")
        .eq("fazenda_id", fazenda.id)
        .ilike("nome", nome)
        .maybeSingle();

      if (conflito) {
        return { ok: true, id: conflito.id, nome: conflito.nome };
      }
    }

    return { ok: false, message: "Não foi possível cadastrar a raça." };
  }

  revalidatePath("/animais/novo");
  revalidatePath("/animais");

  return { ok: true, id: data.id, nome: data.nome };
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

  return { ok: true, id: data.id };
}

function asObject(dados: unknown): Record<string, unknown> {
  if (dados && typeof dados === "object") {
    return dados as Record<string, unknown>;
  }

  return {};
}
