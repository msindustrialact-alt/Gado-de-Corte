import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CadastrarMedicamentoTela } from "@/components/medicacoes/cadastrar-medicamento-tela";
import { buttonVariants } from "@/components/ui/button";
import { getMedicamentos } from "@/lib/medicacoes/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cadastrar medicamento | Fazendas Joana e Cataguá",
};

export default async function PaginaCadastrarMedicamento() {
  const medicamentos = await getMedicamentos();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Link
        href="/sanidade/medicacoes"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-9 rounded-[10px] px-2",
        )}
      >
        <ArrowLeft />
        Medicações
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-texto">Medicamentos</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Qualquer produto entra aqui, com a dose e a carência de abate. O estoque não muda.
        </p>
      </header>
      <CadastrarMedicamentoTela medicamentos={medicamentos} />
    </div>
  );
}
