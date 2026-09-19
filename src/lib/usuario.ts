import type { User } from "@supabase/supabase-js";

import type { PapelFazenda } from "@/lib/fazenda";

const PAPEIS: Record<PapelFazenda, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  operador: "Operador",
};

function lerTexto(meta: User["user_metadata"], chave: string): string | null {
  const valor = meta?.[chave];
  if (typeof valor !== "string") return null;
  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

export function nomeDoUsuario(user: User): string {
  const meta = user.user_metadata ?? {};
  const nome =
    lerTexto(meta, "full_name") ??
    lerTexto(meta, "name") ??
    lerTexto(meta, "nome") ??
    lerTexto(meta, "display_name");

  if (nome) {
    return nome;
  }

  const local = user.email?.split("@")[0]?.trim() || "Usuário";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length >= 2) {
    return `${partes[0]!.charAt(0)}${partes[1]!.charAt(0)}`.toUpperCase();
  }

  return nome.trim().slice(0, 2).toUpperCase() || "U";
}

export function avatarDoUsuario(user: User): string | null {
  const meta = user.user_metadata ?? {};
  return lerTexto(meta, "avatar_url") ?? lerTexto(meta, "picture");
}

export function rotuloPapel(papel?: PapelFazenda | null): string {
  if (!papel) {
    return "";
  }

  return PAPEIS[papel];
}
