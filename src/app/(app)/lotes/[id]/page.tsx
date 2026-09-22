import type { Metadata } from "next";
import Link from "next/link";

import { LoteDetalheTela } from "@/components/lotes/lote-detalhe-tela";
import { buttonVariants } from "@/components/ui/button";
import { lerFiltrosAnimais } from "@/lib/animais";
import { getListaAnimais } from "@/lib/animais/data";
import { getLotePorId } from "@/lib/lotes/data";
import { getResumoLotePesagem } from "@/lib/pesagens/data";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lote = await getLotePorId(id);

  return {
    title: lote
      ? `${lote.nome} | Lotes | Fazendas Joana e Cataguá`
      : "Lote não encontrado | Fazendas Joana e Cataguá",
  };
}

export default async function PaginaLote({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const lote = await getLotePorId(id);

  if (!lote) {
    return (
      <div className="p-4 md:p-6">
        <section className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
          <h1 className="text-lg font-semibold text-texto">Lote não encontrado</h1>
          <p className="mt-1 max-w-sm text-sm text-texto-suave">
            Esse lote não existe, foi arquivado ou pertence a outra fazenda.
          </p>
          <Link
            href="/lotes"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-5 h-10 rounded-[10px] px-4",
            )}
          >
            Voltar para lotes
          </Link>
        </section>
      </div>
    );
  }

  const filtrosBase = lerFiltrosAnimais(query);
  const filtros = {
    ...filtrosBase,
    loteId: id,
    status: "ativo" as const,
  };
  const { animais, totalFiltrado, de, ate } = await getListaAnimais(filtros);
  const resumoPesagem = await getResumoLotePesagem(id);

  return (
    <LoteDetalheTela
      lote={lote}
      animais={animais}
      filtros={{ ...filtrosBase, loteId: "", status: "ativo" }}
      total={totalFiltrado}
      de={de}
      ate={ate}
      resumoPesagem={resumoPesagem}
    />
  );
}
