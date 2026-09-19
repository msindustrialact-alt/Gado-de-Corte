import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type PapelFazenda = "admin" | "gerente" | "operador";

export type FazendaAtiva = Tables<"fazendas"> & {
  papel: PapelFazenda;
};

function isPapelFazenda(valor: string): valor is PapelFazenda {
  return valor === "admin" || valor === "gerente" || valor === "operador";
}

function normalizarFazenda(
  fazenda: Tables<"fazendas"> | Tables<"fazendas">[] | null,
): Tables<"fazendas"> | null {
  if (!fazenda) {
    return null;
  }

  return Array.isArray(fazenda) ? (fazenda[0] ?? null) : fazenda;
}

export const getFazendasDoUsuario = cache(async (): Promise<FazendaAtiva[]> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId || typeof userId !== "string") {
    return [];
  }

  const { data: vinculos, error } = await supabase
    .from("fazenda_usuarios")
    .select("papel, fazenda:fazendas(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !vinculos) {
    return [];
  }

  return vinculos.flatMap((vinculo) => {
    const fazenda = normalizarFazenda(vinculo.fazenda);

    if (!fazenda || !isPapelFazenda(vinculo.papel)) {
      return [];
    }

    return [{ ...fazenda, papel: vinculo.papel }];
  });
});

export const getFazendaAtiva = cache(
  async (fazendaId?: string): Promise<FazendaAtiva | null> => {
    const fazendas = await getFazendasDoUsuario();

    if (fazendas.length === 0) {
      return null;
    }

    if (fazendaId) {
      return fazendas.find((fazenda) => fazenda.id === fazendaId) ?? fazendas[0];
    }

    return fazendas[0];
  },
);
