import type { Metadata } from "next";

import { ReceitasLista } from "@/components/receitas/receitas-lista";
import { getVendasAbate } from "@/lib/receitas/data";

export const metadata: Metadata = {
  title: "Receitas | Fazendas Joana e Cataguá",
};

export default async function PaginaReceitas() {
  const vendas = await getVendasAbate();

  return (
    <div className="p-4 md:p-6">
      <ReceitasLista vendas={vendas} />
    </div>
  );
}
