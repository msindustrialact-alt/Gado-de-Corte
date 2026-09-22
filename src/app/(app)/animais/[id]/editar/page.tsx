import type { Metadata } from "next";
import Link from "next/link";

import { AnimalForm } from "@/components/animais/animal-form";
import { buttonVariants } from "@/components/ui/button";
import { getAnimalPorId, getOpcoesFiltroAnimais } from "@/lib/animais/data";
import { animalTemHistoricoPesagem } from "@/lib/pesagens/data";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const animal = await getAnimalPorId(id);

  return {
    title: animal
      ? `Editar ${animal.brinco} | Fazendas Joana e Cataguá`
      : "Animal não encontrado | Fazendas Joana e Cataguá",
  };
}

export default async function PaginaEditarAnimal({ params }: Props) {
  const { id } = await params;
  const animal = await getAnimalPorId(id);

  if (!animal) {
    return (
      <div className="p-4 md:p-6">
        <section className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
          <h1 className="text-lg font-semibold text-texto">
            Animal não encontrado
          </h1>
          <p className="mt-1 max-w-sm text-sm text-texto-suave">
            Esse cadastro não existe, foi arquivado ou pertence a outra
            fazenda.
          </p>
          <Link
            href="/animais"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-5 h-10 rounded-[10px] px-4",
            )}
          >
            Voltar para animais
          </Link>
        </section>
      </div>
    );
  }

  const [opcoes, temHistoricoPesagem] = await Promise.all([
    getOpcoesFiltroAnimais({
      racaId: animal.raca?.id,
      loteId: animal.lote?.id,
      piqueteId: animal.piquete?.id,
    }),
    animalTemHistoricoPesagem(animal.id),
  ]);

  return (
    <div className="p-4 md:p-6">
      <AnimalForm
        modo="editar"
        animal={animal}
        racasIniciais={opcoes.racas}
        lotes={opcoes.lotes}
        piquetes={opcoes.piquetes}
        pesoTravadoPorPesagem={temHistoricoPesagem}
      />
    </div>
  );
}
