"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listarAnimaisDoPiquete } from "@/app/(app)/pastagens/actions";
import {
  formatarHa,
  formatarUa,
  StatusPiqueteBadge,
} from "@/components/pastagens/piquete-badges";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPeso } from "@/lib/animais";
import { formatarInteiro } from "@/lib/formatacao";
import type { AnimalDoPiquete, PiqueteResumo } from "@/lib/pastagens";

export function PiqueteSheet({
  piquete,
  onFechar,
}: {
  piquete: PiqueteResumo | null;
  onFechar: () => void;
}) {
  return (
    <Sheet open={Boolean(piquete)} onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md"
      >
        {piquete ? <PiqueteSheetConteudo key={piquete.id} piquete={piquete} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function PiqueteSheetConteudo({ piquete }: { piquete: PiqueteResumo }) {
  const [animais, setAnimais] = useState<AnimalDoPiquete[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    listarAnimaisDoPiquete(piquete.id)
      .then((lista) => {
        if (ativo) {
          setAnimais(lista);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [piquete.id]);

  return (
    <>
      <SheetHeader className="border-b border-border">
        <SheetTitle className="text-texto">{piquete.nome}</SheetTitle>
        <SheetDescription>
          {formatarInteiro(piquete.qtd_animais)}{" "}
          {piquete.qtd_animais === 1 ? "animal ativo" : "animais ativos"}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-4 p-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-texto-suave">Área</dt>
            <dd className="text-texto">{formatarHa(piquete.area_ha)}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Status</dt>
            <dd>
              <StatusPiqueteBadge status={piquete.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">Tipo</dt>
            <dd className="text-texto">{piquete.tipo_pastagem ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-texto-suave">UA atual</dt>
            <dd className="tabular-nums text-texto">{formatarUa(piquete.ua_atual)}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-texto">Animais ativos</h3>
          {carregando ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, indice) => (
                <div
                  key={indice}
                  className="h-12 animate-pulse rounded-[10px] bg-muted"
                />
              ))}
            </div>
          ) : animais.length === 0 ? (
            <p className="rounded-[12px] border border-border bg-muted/50 px-3 py-6 text-center text-sm text-texto-suave">
              Nenhum animal ativo neste piquete.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-[12px] border border-border">
              {animais.map((animal) => (
                <li
                  key={animal.id}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    href={`/animais/${animal.id}`}
                    className="flex items-start justify-between gap-3 px-3 py-2.5 hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-texto">{animal.brinco}</p>
                      <p className="text-xs text-texto-suave">
                        {animal.categoria ?? "Sem categoria"}
                        {animal.lote ? ` · ${animal.lote.nome}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-sm text-texto">
                      {formatPeso(animal.peso_atual)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
