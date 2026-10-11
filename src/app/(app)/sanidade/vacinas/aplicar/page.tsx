import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AplicarLoteTela } from "@/components/vacinas/aplicar-lote-tela";
import { buttonVariants } from "@/components/ui/button";
import { getLotes } from "@/lib/lotes/data";
import {
  getAnimaisAtivosDoLote,
  getProtocoloAtivo,
  getVacinas,
} from "@/lib/vacinas/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Aplicar vacinas | Fazendas Joana e Cataguá",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaginaAplicarVacinas({ searchParams }: Props) {
  const query = await searchParams;
  const loteParam = query.lote;
  const loteId = Array.isArray(loteParam) ? loteParam[0] ?? "" : loteParam ?? "";

  const lotes = (await getLotes()).filter((lote) => lote.status === "ativo");
  const loteEscolhido = loteId || lotes[0]?.id || "";

  const [vacinas, protocolo, animais] = await Promise.all([
    getVacinas(true),
    getProtocoloAtivo(),
    loteEscolhido ? getAnimaisAtivosDoLote(loteEscolhido) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Link
        href="/sanidade/vacinas"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-fit rounded-[10px] px-2 text-texto-suave",
        )}
      >
        <ArrowLeft />
        Voltar
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-texto">Aplicar vacinas</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Registre a vacinação do lote pela data de realização.
        </p>
      </header>
      <AplicarLoteTela
        lotes={lotes}
        loteIdInicial={loteEscolhido}
        vacinas={vacinas}
        protocolo={protocolo}
        animaisIniciais={animais}
      />
    </div>
  );
}
