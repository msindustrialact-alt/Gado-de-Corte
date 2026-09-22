import type { Metadata } from "next";

import { LotesTela } from "@/components/lotes/lotes-tela";
import { getLotes } from "@/lib/lotes/data";

export const metadata: Metadata = {
  title: "Lotes | Fazendas Joana e Cataguá",
};

export default async function PaginaLotes() {
  const lotes = await getLotes();

  return <LotesTela lotes={lotes} />;
}
