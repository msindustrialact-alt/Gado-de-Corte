import type { Metadata } from "next";

import { EstoqueTela } from "@/components/estoque/estoque-tela";
import { getProdutos } from "@/lib/estoque/data";

export const metadata: Metadata = {
  title: "Estoque | Fazendas Joana e Cataguá",
};

export default async function PaginaEstoque() {
  const produtos = await getProdutos({ soAtivos: true });

  return <EstoqueTela produtos={produtos} />;
}
