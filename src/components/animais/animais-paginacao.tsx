import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ITENS_POR_PAGINA, urlAnimais, type FiltrosAnimais } from "@/lib/animais";
import { formatarInteiro } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

export function AnimaisPaginacao({
  filtros,
  total,
  de,
  ate,
}: {
  filtros: FiltrosAnimais;
  total: number;
  de: number;
  ate: number;
}) {
  if (total === 0) {
    return null;
  }

  const paginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
  const temAnterior = filtros.pagina > 1;
  const temProxima = filtros.pagina < paginas;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-texto-suave">
        Mostrando {formatarInteiro(de)}–{formatarInteiro(ate)} de{" "}
        {formatarInteiro(total)}
      </p>
      <div className="flex items-center gap-2">
        {temAnterior ? (
          <Link
            href={urlAnimais(filtros, { pagina: filtros.pagina - 1 })}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-[10px]",
            )}
          >
            <ChevronLeft />
            Anterior
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-[10px] opacity-50",
            )}
          >
            <ChevronLeft />
            Anterior
          </span>
        )}
        {temProxima ? (
          <Link
            href={urlAnimais(filtros, { pagina: filtros.pagina + 1 })}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-[10px]",
            )}
          >
            Próxima
            <ChevronRight />
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-[10px] opacity-50",
            )}
          >
            Próxima
            <ChevronRight />
          </span>
        )}
      </div>
    </div>
  );
}
