import type { Metadata } from "next";

import { PastagensTela } from "@/components/pastagens/pastagens-tela";
import { getPiquetes } from "@/lib/pastagens/data";

export const metadata: Metadata = {
  title: "Pastagens | Fazendas Joana e Cataguá",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaginaPastagens({ searchParams }: Props) {
  const params = await searchParams;
  const piqueteParam = Array.isArray(params.piquete)
    ? params.piquete[0]
    : params.piquete;
  const piquetes = await getPiquetes();
  const selecionado = piqueteParam
    ? (piquetes.find((item) => item.id === piqueteParam) ?? null)
    : null;

  return <PastagensTela piquetes={piquetes} piqueteInicial={selecionado} />;
}
