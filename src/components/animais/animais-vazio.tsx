import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AnimaisVazio() {
  return (
    <section className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#DDF1E6] text-primary">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-texto">
        Nenhum animal encontrado
      </h2>
      <p className="mt-1 max-w-sm text-sm text-texto-suave">
        Ajuste a busca ou limpe os filtros para ver o rebanho cadastrado.
      </p>
      <Link
        href="/animais"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-5 h-10 rounded-[10px] px-4",
        )}
      >
        Limpar filtros
      </Link>
    </section>
  );
}
