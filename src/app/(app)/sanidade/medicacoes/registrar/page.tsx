import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RegistrarMedicacaoTela } from "@/components/medicacoes/registrar-medicacao-tela";
import { buttonVariants } from "@/components/ui/button";
import { getLotes } from "@/lib/lotes/data";
import {
  getAnimaisMedicacao,
  getMedicamentos,
} from "@/lib/medicacoes/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Registrar medicação | Fazendas Joana e Cataguá",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function texto(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] ?? "" : valor ?? "";
}

export default async function PaginaRegistrarMedicacao({ searchParams }: Props) {
  const query = await searchParams;
  const loteId = texto(query.lote);
  const animalId = texto(query.animal);
  const lotes = (await getLotes()).filter((lote) => lote.status === "ativo");
  const [medicamentos, animais] = await Promise.all([
    getMedicamentos(),
    getAnimaisMedicacao(loteId),
  ]);
  const marcados = animalId
    ? animais.filter((animal) => animal.id === animalId).map((animal) => animal.id)
    : animais.map((animal) => animal.id);

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
      <RegistrarMedicacaoTela
        medicamentos={medicamentos}
        lotes={lotes}
        loteInicial={loteId}
        animaisIniciais={animais}
        animaisMarcados={marcados.length > 0 ? marcados : animais.map((animal) => animal.id)}
      />
    </div>
  );
}
