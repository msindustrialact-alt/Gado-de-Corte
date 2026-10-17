import { cookies } from "next/headers";

import {
  COOKIE_FAZENDA_PAINEL,
  lerValorFazendaPainel,
  type FazendaPainel,
} from "@/lib/fazenda-painel";

export async function lerFazendaPainelAtual(
  param: string | string[] | undefined,
): Promise<FazendaPainel> {
  const bruto = Array.isArray(param) ? param[0] : param;

  if (bruto === "joana" || bruto === "catagua") {
    return bruto;
  }

  const jar = await cookies();
  return lerValorFazendaPainel(jar.get(COOKIE_FAZENDA_PAINEL)?.value);
}
