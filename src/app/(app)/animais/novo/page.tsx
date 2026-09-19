import type { Metadata } from "next";

import { AnimalForm } from "@/components/animais/animal-form";
import { getOpcoesFiltroAnimais } from "@/lib/animais/data";

export const metadata: Metadata = {
  title: "Novo animal | Fazenda Joana",
};

export default async function PaginaNovoAnimal() {
  const opcoes = await getOpcoesFiltroAnimais();

  return (
    <div className="p-4 md:p-6">
      <AnimalForm
        modo="novo"
        racasIniciais={opcoes.racas}
        lotes={opcoes.lotes}
        piquetes={opcoes.piquetes}
      />
    </div>
  );
}
