export const COOKIE_FAZENDA_PAINEL = "painel_fazenda";

export type FazendaPainel = "todas" | "joana" | "catagua";

export function lerValorFazendaPainel(valor: string | null | undefined): FazendaPainel {
  if (valor === "joana" || valor === "catagua") {
    return valor;
  }

  return "todas";
}

export function lerCookieFazendaPainel(): FazendaPainel {
  if (typeof document === "undefined") {
    return "todas";
  }

  const trecho = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_FAZENDA_PAINEL}=`));

  return lerValorFazendaPainel(trecho?.split("=")[1]);
}

export function gravarFazendaPainel(valor: FazendaPainel) {
  if (typeof document === "undefined") {
    return;
  }

  if (valor === "todas") {
    document.cookie = `${COOKIE_FAZENDA_PAINEL}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  document.cookie = `${COOKIE_FAZENDA_PAINEL}=${valor}; path=/; max-age=31536000; samesite=lax`;
}
