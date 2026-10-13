import type { Metadata } from "next";

import { MedicacoesHub } from "@/components/medicacoes/medicacoes-hub";
import { getSessoesMedicacao } from "@/lib/medicacoes/data";

export const metadata: Metadata = {
  title: "Medicações | Fazendas Joana e Cataguá",
};

export default async function PaginaMedicacoes() {
  const sessoes = await getSessoesMedicacao();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <MedicacoesHub sessoes={sessoes} />
    </div>
  );
}
