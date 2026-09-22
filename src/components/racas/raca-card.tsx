"use client";

import { Lock, Pencil, Power, PowerOff, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarInteiro } from "@/lib/formatacao";
import type { RacaItem } from "@/lib/racas";
import { cn } from "@/lib/utils";

export function RacaCard({
  raca,
  somenteLeitura,
  onRenomear,
  onDesativar,
  onReativar,
  onExcluir,
}: {
  raca: RacaItem;
  somenteLeitura?: boolean;
  onRenomear?: (raca: RacaItem) => void;
  onDesativar?: (raca: RacaItem) => void;
  onReativar?: (raca: RacaItem) => void;
  onExcluir?: (raca: RacaItem) => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between",
        !raca.ativa && "opacity-80",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {somenteLeitura ? (
            <Lock className="size-4 text-texto-suave" aria-label="Raça padrão do sistema" />
          ) : null}
          <h3 className="font-semibold text-texto">{raca.nome}</h3>
          {!raca.ativa ? (
            <Badge
              variant="outline"
              className="rounded-full border-transparent bg-muted font-medium text-texto-suave"
            >
              Desativada
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-texto-suave">
          {raca.qtd_animais === 1
            ? "1 animal usa esta raça"
            : `${formatarInteiro(raca.qtd_animais)} animais usam esta raça`}
        </p>
      </div>

      {somenteLeitura ? null : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[10px]"
            onClick={() => onRenomear?.(raca)}
          >
            <Pencil />
            Renomear
          </Button>
          {raca.ativa ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-[10px]"
              onClick={() => onDesativar?.(raca)}
            >
              <PowerOff />
              Desativar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-[10px]"
              onClick={() => onReativar?.(raca)}
            >
              <Power />
              Reativar
            </Button>
          )}
          {raca.qtd_animais === 0 ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-[10px]"
              onClick={() => onExcluir?.(raca)}
            >
              <Trash2 />
              Excluir
            </Button>
          ) : (
            <p className="self-center text-xs text-texto-suave">
              Em uso. Desative para ocultar das listas de seleção.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
