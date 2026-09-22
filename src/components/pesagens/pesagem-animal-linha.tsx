"use client";

import type { KeyboardEvent } from "react";

import { FotoAnimal } from "@/components/animais/foto-animal";
import {
  AlertaGmdBadge,
  ConfiabilidadeBadge,
} from "@/components/pesagens/pesagem-badges";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { formatPeso, LABELS_CATEGORIA } from "@/lib/animais";
import { formatarData } from "@/lib/formatacao";
import {
  desempenhoDaLinha,
  formatArroba,
  formatGanho,
  formatGmd,
  TEXTO_TOOLTIP_ARROBA,
  type AnimalPesagem,
  type CondicaoPesagem,
} from "@/lib/pesagens";
import { cn } from "@/lib/utils";

export function PesagemAnimalLinha({
  animal,
  peso,
  dataSessao,
  condicaoAtual,
  somenteLeitura,
  indice,
  variante,
  onChange,
  onEnter,
}: {
  animal: AnimalPesagem;
  peso: string;
  dataSessao: string;
  condicaoAtual: CondicaoPesagem | null;
  somenteLeitura: boolean;
  indice: number;
  variante: "tabela" | "cartao";
  onChange: (valor: string) => void;
  onEnter: (atual: HTMLInputElement) => void;
}) {
  const desempenho = desempenhoDaLinha(peso, animal, dataSessao, condicaoAtual);
  const gmdClasse =
    desempenho.gmd == null
      ? "text-texto-suave"
      : desempenho.gmd < 0
        ? "text-perigo"
        : "text-positivo";

  function tecla(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Enter") {
      evento.preventDefault();
      onEnter(evento.currentTarget);
    }
  }

  const avisoFora = animal.fora_do_lote ? (
    <span className="mt-0.5 inline-block rounded-full bg-alerta/15 px-2 py-0.5 text-[10px] font-medium text-alerta">
      Não está mais neste lote
    </span>
  ) : null;

  if (variante === "cartao") {
    return (
      <article
        className={cn(
          "rounded-[12px] border bg-card p-4 shadow-card",
          animal.fora_do_lote ? "border-alerta/40" : "border-border",
        )}
      >
        <div className="flex items-start gap-3">
          <FotoAnimal url={animal.foto_url} tamanho={44} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-texto">{animal.brinco}</p>
            <p className="text-xs text-texto-suave">
              Anterior {formatPeso(animal.peso_anterior_kg)}
              {animal.data_peso_anterior
                ? ` · ${formatarData(animal.data_peso_anterior)}`
                : ""}
            </p>
            {avisoFora}
          </div>
          <div className="flex flex-col items-end gap-1">
            <AlertaGmdBadge alerta={desempenho.alerta} />
            <ConfiabilidadeBadge nivel={desempenho.confiabilidade} />
          </div>
        </div>
        <div className="relative mt-3">
          <input
            data-peso-input
            data-indice={indice}
            inputMode="decimal"
            autoComplete="off"
            disabled={somenteLeitura}
            value={peso}
            onChange={(evento) => onChange(evento.target.value)}
            onKeyDown={tecla}
            placeholder="Peso atual"
            className={cn(CLASSE_CAMPO, "h-12 pr-10 text-xl font-bold tabular-nums")}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-texto-suave">
            kg
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <dt className="text-[11px] text-texto-suave" title={TEXTO_TOOLTIP_ARROBA}>
              @ est.
            </dt>
            <dd className="font-semibold tabular-nums" title={TEXTO_TOOLTIP_ARROBA}>
              {formatArroba(desempenho.peso_kg)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-texto-suave">Ganho</dt>
            <dd className={cn("font-semibold tabular-nums", gmdClasse)}>
              {formatGanho(desempenho.ganho_kg)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-texto-suave">GMD</dt>
            <dd className={cn("font-semibold tabular-nums", gmdClasse)}>
              {formatGmd(desempenho.gmd)}
            </dd>
          </div>
        </dl>
      </article>
    );
  }

  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0",
        animal.fora_do_lote && "bg-alerta/5",
      )}
    >
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          <FotoAnimal url={animal.foto_url} tamanho={40} />
          <div className="min-w-0">
            <p className="font-semibold text-texto">{animal.brinco}</p>
            <p className="truncate text-xs text-texto-suave">
              {animal.nome ?? "Sem nome"}
              {animal.categoria ? ` · ${LABELS_CATEGORIA[animal.categoria]}` : ""}
            </p>
            {avisoFora}
          </div>
        </div>
      </td>
      <td className="tabular-nums text-texto">
        <span className="block">{formatPeso(animal.peso_anterior_kg)}</span>
        <span className="text-xs text-texto-suave">
          {animal.data_peso_anterior
            ? formatarData(animal.data_peso_anterior)
            : "sem histórico"}
        </span>
      </td>
      <td className="pr-2">
        <div className="relative w-[8.5rem]">
          <input
            data-peso-input
            data-indice={indice}
            inputMode="decimal"
            autoComplete="off"
            disabled={somenteLeitura}
            value={peso}
            onChange={(evento) => onChange(evento.target.value)}
            onKeyDown={tecla}
            placeholder="0"
            className={cn(CLASSE_CAMPO, "h-11 pr-9 text-right text-lg font-semibold tabular-nums")}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-texto-suave">
            kg
          </span>
        </div>
      </td>
      <td className="tabular-nums text-texto" title={TEXTO_TOOLTIP_ARROBA}>
        {formatArroba(desempenho.peso_kg)}
      </td>
      <td className={cn("tabular-nums font-medium", gmdClasse)}>
        {formatGanho(desempenho.ganho_kg)}
      </td>
      <td className={cn("tabular-nums font-semibold", gmdClasse)}>
        {formatGmd(desempenho.gmd)}
      </td>
      <td className="pr-4">
        <div className="flex flex-col items-start gap-1">
          <AlertaGmdBadge alerta={desempenho.alerta} />
          <ConfiabilidadeBadge nivel={desempenho.confiabilidade} />
        </div>
      </td>
    </tr>
  );
}
