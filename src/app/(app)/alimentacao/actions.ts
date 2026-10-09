"use server";

import { revalidatePath } from "next/cache";

import {
  falhaValidacao,
  vazioParaNulo,
  type ResultadoAcao,
} from "@/lib/acao";
import { getFazendaAtiva } from "@/lib/fazenda";
import { numeroCampo, schemaLancamentoLote } from "@/lib/estoque/schema";
import { createClient } from "@/lib/supabase/server";

function revalidar() {
  revalidatePath("/alimentacao");
  revalidatePath("/estoque");
  revalidatePath("/lotes");
  revalidatePath("/pesagens");
}

function mensagemRpc(error: { message?: string }): string {
  const texto = error.message ?? "";

  if (texto.includes("Estoque insuficiente")) {
    const match = texto.match(/disponível: ([0-9.]+)/i);
    return match
      ? `Estoque insuficiente (disponível: ${match[1]}).`
      : "Estoque insuficiente para esta quantidade.";
  }

  if (texto.includes("Lote sem animais")) {
    return "O lote não tem animais ativos para ratear o custo.";
  }

  if (texto.includes("Lote não encontrado")) {
    return "Lote não encontrado.";
  }

  if (texto.includes("Produto não encontrado")) {
    return "Produto não encontrado ou inativo.";
  }

  if (texto.includes("Período inválido")) {
    return "Período inválido.";
  }

  return "Não foi possível lançar o uso. Tente de novo.";
}

export async function lancarUsoNoLote(dados: unknown): Promise<ResultadoAcao> {
  const parsed = schemaLancamentoLote.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("lancar_uso_lote", {
    p_lote_id: parsed.data.lote_id,
    p_produto_id: parsed.data.produto_id,
    p_quantidade: numeroCampo(parsed.data.quantidade),
    p_data_inicio: parsed.data.data_inicio,
    p_data_fim: vazioParaNulo(parsed.data.data_fim),
    p_observacoes: vazioParaNulo(parsed.data.observacoes),
  });

  if (error) {
    console.error(error);
    return { ok: false, message: mensagemRpc(error) };
  }

  revalidar();
  return {
    ok: true,
    message: "Lançamento registrado — estoque baixado e custo no lote.",
  };
}
