import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AnimaisFiltros } from "@/components/animais/animais-filtros";
import { AnimaisPaginacao } from "@/components/animais/animais-paginacao";
import { AnimaisSelecao } from "@/components/animais/animais-selecao";
import { AnimaisVazio } from "@/components/animais/animais-vazio";
import { buttonVariants } from "@/components/ui/button";
import { lerFiltrosAnimais } from "@/lib/animais";
import {
  getIdsAnimaisFiltrados,
  getListaAnimais,
  getOpcoesFiltroAnimais,
} from "@/lib/animais/data";
import { formatarInteiro } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Animais | Fazendas Joana e Cataguá",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaginaAnimais({ searchParams }: Props) {
  const params = await searchParams;
  const filtros = lerFiltrosAnimais(params);
  const [{ animais, totalFiltrado, totalCadastrados, de, ate }, opcoes, idsFiltrados] =
    await Promise.all([
      getListaAnimais(filtros),
      getOpcoesFiltroAnimais(),
      getIdsAnimaisFiltrados(filtros),
    ]);

  const subtitulo =
    totalCadastrados === 1
      ? "1 animal cadastrado"
      : `${formatarInteiro(totalCadastrados)} animais cadastrados`;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Animais</h1>
          <p className="mt-1 text-sm text-texto-suave">{subtitulo}</p>
        </div>
        <Link
          href="/animais/novo"
          className={cn(
            buttonVariants(),
            "h-10 rounded-[10px] px-4",
          )}
        >
          <Plus />
          Novo animal
        </Link>
      </header>

      <AnimaisFiltros
        filtros={filtros}
        racas={opcoes.racas}
        lotes={opcoes.lotes}
        piquetes={opcoes.piquetes}
      />

      {animais.length === 0 ? (
        <AnimaisVazio />
      ) : (
        <>
          <AnimaisSelecao
            animais={animais}
            filtros={filtros}
            idsFiltrados={idsFiltrados}
            lotes={opcoes.lotes}
          />
          <AnimaisPaginacao
            filtros={filtros}
            total={totalFiltrado}
            de={de}
            ate={ate}
          />
        </>
      )}
    </div>
  );
}
