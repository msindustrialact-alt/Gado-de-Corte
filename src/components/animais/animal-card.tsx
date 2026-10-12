import Link from "next/link";

import { AnimalAcoes } from "@/components/animais/animal-acoes";
import { FotoAnimal } from "@/components/animais/foto-animal";
import { SexoBadge, StatusBadge } from "@/components/animais/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatPeso,
  LABELS_CATEGORIA,
  LABELS_PROPRIEDADE,
  type AnimalListagem,
} from "@/lib/animais";

export function AnimalCard({
  animal,
  ocultarLote = false,
  selecionado,
  onAlternarSelecao,
}: {
  animal: AnimalListagem;
  /** Em detalhe de lote, o nome do lote é redundante. */
  ocultarLote?: boolean;
  selecionado?: boolean;
  onAlternarSelecao?: (id: string) => void;
}) {
  const categoria = animal.categoria
    ? LABELS_CATEGORIA[animal.categoria]
    : "—";

  return (
    <article className="relative rounded-[10px] border border-border bg-card px-2.5 py-2 shadow-card">
      <div className="flex items-center gap-2">
        {onAlternarSelecao ? (
          <Checkbox
            checked={selecionado === true}
            aria-label={`Selecionar brinco ${animal.brinco}`}
            onCheckedChange={() => onAlternarSelecao(animal.id)}
          />
        ) : null}
      <Link
        href={`/animais/${animal.id}`}
        className="flex min-w-0 flex-1 items-center gap-2.5 pr-8"
      >
        <FotoAnimal url={animal.foto_url} tamanho={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-texto">
              {animal.brinco}
            </p>
            {animal.nome ? (
              <p className="min-w-0 truncate text-xs text-texto-suave">
                {animal.nome}
              </p>
            ) : null}
            <span className="ml-auto shrink-0 origin-right scale-90">
              <StatusBadge status={animal.status} />
            </span>
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-texto">
            <span className="truncate text-texto-suave">{categoria}</span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <SexoBadge sexo={animal.sexo} />
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="tabular-nums font-medium">
              {formatPeso(animal.peso_atual)}
            </span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="truncate text-texto-suave">
              {LABELS_PROPRIEDADE[animal.propriedade]}
            </span>
          </div>
        </div>
      </Link>
      </div>

      {ocultarLote && !animal.piquete ? null : (
        <div className={`mt-1.5 flex items-center gap-3 border-t border-border/70 pt-1.5 text-[11px] ${onAlternarSelecao ? "pl-[70px]" : "pl-[46px]"}`}>
          {ocultarLote ? null : animal.lote ? (
            <Link
              href={`/lotes/${animal.lote.id}`}
              className="truncate font-medium text-primary hover:underline"
            >
              {animal.lote.nome}
            </Link>
          ) : (
            <span className="text-texto-suave">Sem lote</span>
          )}
          {animal.piquete ? (
            <Link
              href={`/pastagens?piquete=${animal.piquete.id}`}
              className="truncate text-texto-suave hover:text-primary hover:underline"
            >
              {animal.piquete.nome}
            </Link>
          ) : ocultarLote ? null : (
            <span className="text-texto-suave">Sem piquete</span>
          )}
        </div>
      )}

      <div className="absolute top-1 right-0.5">
        <AnimalAcoes id={animal.id} brinco={animal.brinco} />
      </div>
    </article>
  );
}
