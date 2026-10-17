import type { Metadata } from "next";

import { ReceitaNovaTela } from "@/components/receitas/receita-nova-tela";
import { getAnimaisReceita } from "@/lib/receitas/data";

export const metadata: Metadata = {
  title: "Nova receita | Fazendas Joana e Cataguá",
};

export default async function PaginaNovaReceita() {
  const { animais, lotes } = await getAnimaisReceita();

  return (
    <div className="p-4 md:p-6">
      <ReceitaNovaTela animais={animais} lotes={lotes} />
    </div>
  );
}
