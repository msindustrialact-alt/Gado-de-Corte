import Link from "next/link";

import { AnimalAcoes } from "@/components/animais/animal-acoes";
import { FotoAnimal } from "@/components/animais/foto-animal";
import { SexoBadge, StatusBadge } from "@/components/animais/status-badge";
import {
  formatPeso,
  LABELS_CATEGORIA,
  LABELS_PROPRIEDADE,
  type AnimalListagem,
} from "@/lib/animais";

export function AnimalCard({ animal }: { animal: AnimalListagem }) {
  return (
    <article className="relative rounded-[12px] border border-border bg-card p-4 shadow-card">
      <Link href={`/animais/${animal.id}`} className="flex items-start gap-3 pr-8">
        <FotoAnimal url={animal.foto_url} tamanho={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-texto">
                {animal.brinco}
              </p>
              {animal.nome ? (
                <p className="truncate text-sm text-texto-suave">{animal.nome}</p>
              ) : null}
            </div>
            <StatusBadge status={animal.status} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <div>
              <dt className="text-xs text-texto-suave">Categoria</dt>
              <dd className="text-texto">
                {animal.categoria
                  ? LABELS_CATEGORIA[animal.categoria]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-texto-suave">Sexo</dt>
              <dd>
                <SexoBadge sexo={animal.sexo} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-texto-suave">Fazenda</dt>
              <dd className="truncate text-texto">
                {LABELS_PROPRIEDADE[animal.propriedade]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-texto-suave">Peso</dt>
              <dd className="tabular-nums text-texto">
                {formatPeso(animal.peso_atual)}
              </dd>
            </div>
          </dl>
        </div>
      </Link>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-border pt-3 text-sm">
        <div>
          <dt className="text-xs text-texto-suave">Lote</dt>
          <dd className="truncate text-texto">
            {animal.lote ? (
              <Link
                href={`/lotes/${animal.lote.id}`}
                className="font-medium text-primary hover:underline"
              >
                {animal.lote.nome}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-texto-suave">Piquete</dt>
          <dd className="truncate text-texto">
            {animal.piquete ? (
              <Link
                href={`/pastagens?piquete=${animal.piquete.id}`}
                className="font-medium text-primary hover:underline"
              >
                {animal.piquete.nome}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
      <div className="absolute top-3 right-2">
        <AnimalAcoes id={animal.id} brinco={animal.brinco} />
      </div>
    </article>
  );
}
