import type { Metadata } from "next";

import { RacasTela } from "@/components/racas/racas-tela";
import { getRacas } from "@/lib/racas/data";

export const metadata: Metadata = {
  title: "Raças | Fazendas Joana e Cataguá",
};

export default async function PaginaRacas() {
  const { padrao, minhas } = await getRacas();

  return <RacasTela padrao={padrao} minhas={minhas} />;
}
