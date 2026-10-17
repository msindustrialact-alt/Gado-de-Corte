import Link from "next/link";

import {
  LABELS_CATEGORIA,
  urlAnimais,
  type FiltrosAnimais,
} from "@/lib/animais";
import type { ResumoCategoria } from "@/lib/animais/data";
import { formatarInteiro } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

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
    <ul className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible xl:grid-cols-7">
      {itens.map((item) => {
        const marcada = filtros.categoria === item.categoria;
        const href = urlAnimais(filtros, {
          categoria: marcada ? "todos" : item.categoria,
        });

        return (
          <li key={item.categoria} className="min-w-[9.25rem] shrink-0 md:min-w-0">
            <Link
              href={href}
              aria-current={marcada ? "true" : undefined}
              className={cn(
                "flex h-full flex-col rounded-[12px] border bg-card px-3 py-2.5 shadow-card",
                marcada
                  ? "border-primary bg-[#DDF1E6]"
                  : "border-border hover:bg-muted/60",
              )}
            >
              <span className="text-xs font-medium text-texto-suave">
                {LABELS_CATEGORIA[item.categoria]}
              </span>
              <span className="mt-1 text-xl font-bold tabular-nums text-texto">
                {formatarInteiro(item.quantidade)}
              </span>
              <span className="mt-0.5 text-xs tabular-nums text-texto-suave">
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
