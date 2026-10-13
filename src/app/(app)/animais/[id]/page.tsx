import type { Metadata } from "next";
import Link from "next/link";

import { AnimalDetalhe } from "@/components/animais/animal-detalhe";
import { buttonVariants } from "@/components/ui/button";
import { getAnimalPorId } from "@/lib/animais/data";
import { getHistoricoAnimal } from "@/lib/pesagens/data";
import {
  getAvaliacaoAnimal,
  getHistoricoAnimalVacinas,
} from "@/lib/vacinas/data";
import { getHistoricoAnimalMedicacoes } from "@/lib/medicacoes/data";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const animal = await getAnimalPorId(id);

  return {
    title: animal
      ? `${animal.brinco} | Animais | Fazendas Joana e Cataguá`
      : "Animal não encontrado | Fazendas Joana e Cataguá",
  };
}

export default async function PaginaAnimal({ params }: Props) {
  const { id } = await params;
  const [animal, desempenho, avaliacaoVacinas, historicoVacinas, historicoMedicacoes] =
    await Promise.all([
      getAnimalPorId(id),
      getHistoricoAnimal(id),
      getAvaliacaoAnimal(id),
      getHistoricoAnimalVacinas(id),
      getHistoricoAnimalMedicacoes(id),
    ]);

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

  return (
    <AnimalDetalhe
      animal={animal}
      desempenho={desempenho}
      avaliacaoVacinas={avaliacaoVacinas}
      historicoVacinas={historicoVacinas}
      historicoMedicacoes={historicoMedicacoes}
    />
  );
}
