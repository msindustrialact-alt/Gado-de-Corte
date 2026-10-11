"use server";

import { revalidatePath } from "next/cache";

import { falhaValidacao, type ResultadoAcao } from "@/lib/acao";
import {
  arquivarVacina,
  criarSessaoVacinacao,
  getAnimaisAtivosDoLote,
  salvarProtocolo,
  upsertVacina,
  type AnimalVacinaRow,
} from "@/lib/vacinas/data";
import {
  schemaAplicarLote,
  schemaProtocolo,
  schemaVacina,
} from "@/lib/vacinas/schema";

function revalidarVacinas() {
  revalidatePath("/sanidade/vacinas");
  revalidatePath("/sanidade/vacinas/protocolo");
  revalidatePath("/sanidade/vacinas/aplicar");
  revalidatePath("/dashboard");
  revalidatePath("/animais");
}

export async function salvarVacinaAction(
  input: unknown,
): Promise<ResultadoAcao> {
  const parse = schemaVacina.safeParse(input);
  if (!parse.success) {
    return falhaValidacao(parse.error);
  }

  const resultado = await upsertVacina(parse.data);
  if (!resultado.ok) {
    return { ok: false, message: resultado.message };
  }

  revalidarVacinas();
  return { ok: true, id: resultado.id, message: "Vacina salva." };
}

export async function arquivarVacinaAction(id: string): Promise<ResultadoAcao> {
  const resultado = await arquivarVacina(id);
  if (!resultado.ok) {
    return { ok: false, message: resultado.message };
  }
  revalidarVacinas();
  return { ok: true, message: "Vacina arquivada." };
}

export async function salvarProtocoloAction(
  input: unknown,
): Promise<ResultadoAcao> {
  const parse = schemaProtocolo.safeParse(input);
  if (!parse.success) {
    return falhaValidacao(parse.error);
  }

  const resultado = await salvarProtocolo(parse.data);
  if (!resultado.ok) {
    return { ok: false, message: resultado.message };
  }

  revalidarVacinas();
  return { ok: true, id: resultado.id, message: "Protocolo salvo." };
}

export async function listarAnimaisDoLoteAction(
  loteId: string,
): Promise<AnimalVacinaRow[]> {
  if (!loteId) {
    return [];
  }
  return getAnimaisAtivosDoLote(loteId);
}

export async function aplicarVacinaLoteAction(
  input: unknown,
): Promise<ResultadoAcao> {
  const parse = schemaAplicarLote.safeParse(input);
  if (!parse.success) {
    return falhaValidacao(parse.error);
  }

  const resultado = await criarSessaoVacinacao(parse.data);
  if (!resultado.ok) {
    return { ok: false, message: resultado.message };
  }

  revalidarVacinas();
  revalidatePath(`/lotes/${parse.data.lote_id}`);
  return {
    ok: true,
    id: resultado.id,
    message: resultado.message ?? "Vacinação registrada.",
  };
}
