import type { Metadata } from "next";
import Link from "next/link";

import { PesagemSessaoTela } from "@/components/pesagens/pesagem-sessao-tela";
import { buttonVariants } from "@/components/ui/button";
import { getSessaoPesagem } from "@/lib/pesagens/data";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sessao = await getSessaoPesagem(id);

  return {
    title: sessao
      ? `${sessao.cabecalho.lote_nome} | Pesagens | Fazendas Joana e Cataguá`
      : "Pesagem não encontrada | Fazendas Joana e Cataguá",
  };
}

export default async function PaginaSessaoPesagem({ params }: Props) {
  const { id } = await params;
  const sessao = await getSessaoPesagem(id);

  if (!sessao) {
    return (
      <div className="p-4 md:p-6">
        <section className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
          <h1 className="text-lg font-semibold text-texto">Pesagem não encontrada</h1>
          <p className="mt-1 max-w-sm text-sm text-texto-suave">
            Essa sessão não existe, foi arquivada ou pertence a outra fazenda.
          </p>
          <Link
            href="/pesagens"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-5 h-10 rounded-[10px] px-4",
            )}
          >
            Voltar para pesagens
          </Link>
        </section>
      </div>
    );
  }

  return <PesagemSessaoTela sessao={sessao} />;
}
