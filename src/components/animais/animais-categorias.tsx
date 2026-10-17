import Link from "next/link";

import {
  LABELS_CATEGORIA,
  urlAnimais,
  type FiltrosAnimais,
} from "@/lib/animais";
import type { ResumoCategoria } from "@/lib/animais/data";
import { formatarInteiro } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

function colunasDoCard(total: number, indice: number) {
  if (total <= 1) {
    return "col-span-6";
  }

  if (total === 2) {
    return "col-span-3";
  }

  if (total === 3) {
    return "col-span-2";
  }

  const resto = total % 3;

  if (resto === 0) {
    return "col-span-2";
  }

  if (resto === 2) {
    return indice >= total - 2 ? "col-span-3" : "col-span-2";
  }

  return indice >= total - 4 ? "col-span-3" : "col-span-2";
}

export function AnimaisCategorias({
  itens,
  filtros,
}: {
  itens: ResumoCategoria[];
  filtros: FiltrosAnimais;
}) {
  if (itens.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-6 gap-2 xl:flex">
      {itens.map((item, indice) => {
        const marcada = filtros.categoria === item.categoria;
        const href = urlAnimais(filtros, {
          categoria: marcada ? "todos" : item.categoria,
        });

        return (
          <li
            key={item.categoria}
            className={cn("min-w-0 xl:flex-1", colunasDoCard(itens.length, indice))}
          >
            <Link
              href={href}
              aria-current={marcada ? "true" : undefined}
              className={cn(
                "flex h-full min-w-0 flex-col rounded-[12px] border bg-card px-2.5 py-2 shadow-card sm:px-3 sm:py-2.5",
                marcada
                  ? "border-primary bg-[#DDF1E6]"
                  : "border-border hover:bg-muted/60",
              )}
            >
              <span className="truncate text-xs font-medium text-texto-suave">
                {LABELS_CATEGORIA[item.categoria]}
              </span>
              <span className="mt-1 text-xl font-bold tabular-nums text-texto">
                {formatarInteiro(item.quantidade)}
              </span>
              <span className="mt-0.5 text-xs leading-snug text-texto-suave">
                {item.pesoMedio == null
                  ? "Sem peso"
                  : `Média ${formatarInteiro(Math.round(item.pesoMedio))} kg`}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
