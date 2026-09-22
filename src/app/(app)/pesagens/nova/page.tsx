import type { Metadata } from "next";

import { PesagemNovaTela } from "@/components/pesagens/pesagem-nova-tela";
import { getLotes } from "@/lib/lotes/data";

export const metadata: Metadata = {
  title: "Nova pesagem | Fazendas Joana e Cataguá",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaginaNovaPesagem({ searchParams }: Props) {
  const query = await searchParams;
  const loteParam = query.lote;
  const loteId = Array.isArray(loteParam) ? loteParam[0] ?? "" : loteParam ?? "";
  const lotes = (await getLotes()).filter((lote) => lote.status === "ativo");

  return <PesagemNovaTela lotes={lotes} loteId={loteId} />;
}
