"use server";

import { revalidatePath } from "next/cache";

import {
  ehViolacaoFk,
  ehViolacaoUnica,
  falhaValidacao,
  type ResultadoAcao,
} from "@/lib/acao";
import { getFazendaAtiva } from "@/lib/fazenda";
import { contarAnimaisDaRaca } from "@/lib/racas/data";
import { schemaRaca } from "@/lib/racas/schema";
import { createClient } from "@/lib/supabase/server";

export type ResultadoRaca =
  | { ok: true; id: string; nome: string }
  | { ok: false; message: string };

function revalidarRacas() {
  revalidatePath("/cadastros/racas");
  revalidatePath("/animais");
  revalidatePath("/animais/novo");
}

function traduzirErroNome(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}): ResultadoAcao {
  if (ehViolacaoUnica(error, "uq_racas_nome")) {
    return {
      ok: false,
      message: "Já existe uma raça com este nome.",
      fieldErrors: { nome: ["Já existe uma raça com este nome"] },
    };
  }

  return {
    ok: false,
    message: "Não foi possível salvar a raça. Tente de novo.",
  };
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
      (raca) =>
        raca.nome.localeCompare(nome, "pt-BR", { sensitivity: "accent" }) === 0,
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
        .or(`fazenda_id.is.null,fazenda_id.eq.${fazenda.id}`)
        .ilike("nome", nome)
        .maybeSingle();

      if (conflito) {
        return { ok: true, id: conflito.id, nome: conflito.nome };
      }
    }

    return { ok: false, message: "Não foi possível cadastrar a raça." };
  }

  revalidarRacas();
  return { ok: true, id: data.id, nome: data.nome };
}

export async function cadastrarRaca(dados: unknown): Promise<ResultadoAcao> {
  const parsed = schemaRaca.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("racas").insert({
    nome: parsed.data.nome.trim(),
    fazenda_id: fazenda.id,
    ativa: true,
  });

  if (error) {
    console.error(error);
    return traduzirErroNome(error);
  }

  revalidarRacas();
  return { ok: true, message: "Raça cadastrada." };
}

export async function renomearRaca(
  id: string,
  dados: unknown,
): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Raça inválida." };
  }

  const parsed = schemaRaca.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("racas")
    .update({ nome: parsed.data.nome.trim() })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return traduzirErroNome(error);
  }

  if (!data) {
    return { ok: false, message: "Raça não encontrada." };
  }

  revalidarRacas();
  return { ok: true, message: "Raça atualizada." };
}

export async function alterarAtivaRaca(
  id: string,
  ativa: boolean,
): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Raça inválida." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("racas")
    .update({ ativa })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return {
      ok: false,
      message: "Não foi possível atualizar a raça. Tente de novo.",
    };
  }

  if (!data) {
    return { ok: false, message: "Raça não encontrada." };
  }

  revalidarRacas();
  return {
    ok: true,
    message: ativa ? "Raça reativada." : "Raça desativada.",
  };
}

export async function excluirRaca(id: string): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Raça inválida." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const usos = await contarAnimaisDaRaca(id);

  if (usos > 0) {
    return {
      ok: false,
      message:
        "Esta raça está em uso por animais cadastrados. Desative-a para tirá-la das listas de seleção, sem perder o histórico.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("racas")
    .delete()
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);

    if (ehViolacaoFk(error)) {
      return {
        ok: false,
        message:
          "Esta raça está em uso por animais cadastrados. Desative-a para tirá-la das listas de seleção, sem perder o histórico.",
      };
    }

    return { ok: false, message: "Não foi possível excluir a raça. Tente de novo." };
  }

  if (!data) {
    return { ok: false, message: "Raça não encontrada." };
  }

  revalidarRacas();
  return { ok: true, message: "Raça excluída." };
}
