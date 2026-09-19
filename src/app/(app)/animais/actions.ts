"use server";

import { revalidatePath } from "next/cache";

import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";

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

  return { ok: true };
}
