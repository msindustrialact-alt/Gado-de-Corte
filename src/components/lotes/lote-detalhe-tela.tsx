"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layers, Pencil, Scale, TrendingUp, Weight } from "lucide-react";

import { AnimaisPaginacao } from "@/components/animais/animais-paginacao";
import { AnimaisTabela } from "@/components/animais/animais-tabela";
import { AnimalCard } from "@/components/animais/animal-card";
import { LoteFormulario } from "@/components/lotes/lote-formulario";
import { ObjetivoBadge, StatusLoteBadge } from "@/components/lotes/lote-badges";
import { CardResumo } from "@/components/layout/card-resumo";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { Button, buttonVariants } from "@/components/ui/button";
import { DialogOuSheet } from "@/components/ui/dialog-ou-sheet";
import { IconeBoi } from "@/components/icons/icone-boi";
import {
  formatPeso,
  type AnimalListagem,
  type FiltrosAnimais,
} from "@/lib/animais";
import { formatarData, formatarInteiro } from "@/lib/formatacao";
import type { LoteDetalhe } from "@/lib/lotes";
import { formatGmd, type ResumoLotePesagem } from "@/lib/pesagens";
import { cn } from "@/lib/utils";

export function LoteDetalheTela({
  lote,
  animais,
  filtros,
  total,
  de,
  ate,
  resumoPesagem,
}: {
  lote: LoteDetalhe;
  animais: AnimalListagem[];
  filtros: FiltrosAnimais;
  total: number;
  de: number;
  ate: number;
  resumoPesagem: ResumoLotePesagem;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const caminho = `/lotes/${lote.id}`;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="flex flex-col gap-3">
        <Link
          href="/lotes"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-fit rounded-[10px] px-2 text-texto-suave",
          )}
        >
          <ArrowLeft />
          Voltar para lotes
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-texto">{lote.nome}</h1>
              <ObjetivoBadge objetivo={lote.objetivo} />
              <StatusLoteBadge status={lote.status} />
            </div>
            <p className="mt-1 text-sm text-texto-suave">
              Formação: {formatarData(lote.data_formacao)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/pesagens/nova?lote=${lote.id}`}
              className={cn(buttonVariants(), "h-10 rounded-[10px] px-4")}
            >
              <Weight />
              Pesar lote
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[10px] px-4"
              onClick={() => setAberto(true)}
            >
              <Pencil />
              Editar
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumo
          rotulo="Nº de animais"
          valor={formatarInteiro(lote.qtd_animais)}
          icone={<IconeBoi className="size-6" />}
        />
        <CardResumo
          rotulo="Peso médio"
          valor={formatPeso(lote.peso_medio)}
          icone={<Scale className="size-6" />}
        />
        <CardResumo
          rotulo="GMD da última pesagem"
          valor={formatGmd(resumoPesagem.gmd_medio)}
          icone={<TrendingUp className="size-6" />}
        />
        <CardResumo
          rotulo="Última pesagem"
          valor={
            resumoPesagem.ultima_data
              ? formatarData(resumoPesagem.ultima_data)
              : "Nunca"
          }
          icone={<Weight className="size-6" />}
        />
      </div>

      {animais.length === 0 ? (
        <EstadoVazio
          icone={Layers}
          titulo="Nenhum animal ativo neste lote"
          descricao="Mova animais para este lote ou cadastre um novo animal."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <AnimaisTabela
              animais={animais}
              filtros={filtros}
              caminho={caminho}
            />
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {animais.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
          <AnimaisPaginacao
            filtros={filtros}
            total={total}
            de={de}
            ate={ate}
            caminho={caminho}
          />
        </>
      )}

      <DialogOuSheet
        aberto={aberto}
        onAbertoChange={setAberto}
        titulo="Editar lote"
        descricao="Atualize os dados do lote."
      >
        <LoteFormulario
          lote={lote}
          onCancelar={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false);
            router.refresh();
          }}
        />
      </DialogOuSheet>
    </div>
  );
}
