"use server";

import { revalidatePath } from "next/cache";

import { registrarVendaAbate, type NovaVendaAbate } from "@/lib/receitas/data";

export async function registrarVendaAbateAction(
  entrada: NovaVendaAbate,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const resultado = await registrarVendaAbate(entrada);

  if (resultado.ok) {
    revalidatePath("/financeiro/receitas");
    revalidatePath(`/financeiro/receitas/${resultado.id}`);
    revalidatePath("/animais");
    revalidatePath("/lotes");
    revalidatePath("/dashboard");
  }

  return resultado;
}
