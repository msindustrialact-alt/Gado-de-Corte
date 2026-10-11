import type { Metadata } from "next";

import { VacinasHub } from "@/components/vacinas/vacinas-hub";
import { getSessoesRecentes, getStatusRebanho } from "@/lib/vacinas/data";

export const metadata: Metadata = {
  title: "Vacinas | Fazendas Joana e Cataguá",
};

export default async function PaginaVacinas() {
  const [status, sessoes] = await Promise.all([
    getStatusRebanho(),
    getSessoesRecentes(),
  ]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-texto">Vacinas</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Calendário sanitário do rebanho por data de realização.
        </p>
      </header>
      <VacinasHub status={status} sessoes={sessoes} />
    </div>
  );
}
