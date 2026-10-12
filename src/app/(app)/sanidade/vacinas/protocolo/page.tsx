import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProtocoloForm } from "@/components/vacinas/protocolo-form";
import { buttonVariants } from "@/components/ui/button";
import { getProtocoloAtivo, getVacinas } from "@/lib/vacinas/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Protocolo de vacinas | Fazendas Joana e Cataguá",
};

export default async function PaginaProtocoloVacinas() {
  const [protocolo, vacinas] = await Promise.all([
    getProtocoloAtivo(),
    getVacinas(),
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
        <h1 className="text-2xl font-bold text-texto">Protocolo de vacinas</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Catálogo e lista de referência do rebanho (Joana e Cataguá).
        </p>
      </header>
      <ProtocoloForm protocolo={protocolo} vacinasIniciais={vacinas} />
    </div>
  );
}
