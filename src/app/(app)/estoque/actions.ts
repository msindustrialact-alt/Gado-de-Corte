"use server";

import { revalidatePath } from "next/cache";

import {
  falhaValidacao,
  vazioParaNulo,
  type ResultadoAcao,
} from "@/lib/acao";
import { getFazendaAtiva } from "@/lib/fazenda";
import type { CategoriaProduto } from "@/lib/estoque";
import {
  numeroCampo,
  schemaEntradaEstoque,
  schemaProduto,
} from "@/lib/estoque/schema";
import { createClient } from "@/lib/supabase/server";

function revalidarEstoque() {
  revalidatePath("/estoque");
  revalidatePath("/alimentacao");
  revalidatePath("/lotes");
  revalidatePath("/pesagens");
}

function mensagemRpc(error: { message?: string }): string {
  const texto = error.message ?? "";

  if (texto.includes("Estoque insuficiente")) {
    return texto.replace(/^.*Estoque insuficiente/i, "Estoque insuficiente");
  }

  if (texto.includes("Produto não encontrado")) {
    return "Produto não encontrado.";
  }

  if (texto.includes("Quantidade inválida")) {
    return "Informe uma quantidade válida.";
  }

  if (texto.includes("Custo unitário inválido")) {
    return "Informe um custo unitário válido.";
  }

  return "Não foi possível concluir a operação. Tente de novo.";
}

export async function cadastrarProduto(dados: unknown): Promise<ResultadoAcao> {
  const parsed = schemaProduto.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("produtos")
    .insert({
      fazenda_id: fazenda.id,
      nome: parsed.data.nome.trim(),
      categoria: parsed.data.categoria as CategoriaProduto,
      unidade: parsed.data.unidade.trim(),
      observacoes: vazioParaNulo(parsed.data.observacoes),
      ativo: true,
      estoque_atual: 0,
      custo_medio: 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);

    if (error.code === "23505") {
      return {
        ok: false,
        message: "Já existe um produto com este nome.",
        fieldErrors: { nome: ["Já existe um produto com este nome"] },
      };
    }

    return { ok: false, message: "Não foi possível cadastrar o produto." };
  }

  revalidarEstoque();
  return { ok: true, message: "Produto cadastrado.", id: data.id };
}

export async function registrarEntradaEstoque(
  dados: unknown,
): Promise<ResultadoAcao> {
  const parsed = schemaEntradaEstoque.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("registrar_entrada_estoque", {
    p_produto_id: parsed.data.produto_id,
    p_quantidade: numeroCampo(parsed.data.quantidade),
    p_custo_unitario: numeroCampo(parsed.data.custo_unitario),
    p_data: parsed.data.data,
    p_observacoes: vazioParaNulo(parsed.data.observacoes),
  });

  if (error) {
    console.error(error);
    return { ok: false, message: mensagemRpc(error) };
  }

  revalidarEstoque();
  return { ok: true, message: "Entrada registrada no estoque." };
}

export async function desativarProduto(id: string): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Produto inválido." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("produtos")
    .update({ ativo: false })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error(error);
    return { ok: false, message: "Não foi possível desativar o produto." };
  }

  revalidarEstoque();
  return { ok: true, message: "Produto desativado." };
}
