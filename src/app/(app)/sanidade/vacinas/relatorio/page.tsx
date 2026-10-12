import type { Metadata } from "next";

import { RelatorioVacinasTela } from "@/components/vacinas/relatorio-vacinas-tela";
import { getRelatorioVacinas } from "@/lib/vacinas/data";

export const metadata: Metadata = {
  title: "Relatório de Vacinas | Fazendas Joana e Cataguá",
};

export default async function PaginaRelatorioVacinas() {
  const dados = await getRelatorioVacinas();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-texto">Relatório de Vacinas</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Acompanhe status, última dose e vacinas feitas por animal. Baixe em
          PDF para imprimir ou arquivar.
        </p>
      </header>
      <RelatorioVacinasTela dados={dados} />
    </div>
  );
}
