import type { Metadata } from "next";
import Link from "next/link";

import { ReceitaDetalhe } from "@/components/receitas/receita-detalhe";
import { buttonVariants } from "@/components/ui/button";
import { getVendaAbate } from "@/lib/receitas/data";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Receita | Fazendas Joana e Cataguá",
};

export default async function PaginaReceita({ params }: Props) {
  const { id } = await params;
  const venda = await getVendaAbate(id);

  if (!venda) {
    return (
      <div className="p-4 md:p-6">
        <section className="rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
          <h1 className="text-lg font-semibold text-texto">Receita não encontrada</h1>
          <Link
            href="/financeiro/receitas"
            className={cn(buttonVariants({ variant: "outline" }), "mt-5 h-10 rounded-[10px] px-4")}
          >
            Voltar para receitas
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <ReceitaDetalhe venda={venda} />
    </div>
  );
}
