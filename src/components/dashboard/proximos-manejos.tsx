import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Pill,
  Soup,
  Syringe,
  Weight,
  Wheat,
} from "lucide-react";

import { CardPainel } from "@/components/dashboard/card-painel";
import type { ProximoManejo, TipoManejo } from "@/lib/dashboard/mock";
import { formatarDiaMesExtenso } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

const ICONES: Record<
  TipoManejo,
  { icone: typeof Syringe; fundo: string; cor: string }
> = {
  vacinacao: { icone: Syringe, fundo: "bg-[#DDF1E6]", cor: "text-primary" },
  vermifugacao: { icone: Pill, fundo: "bg-[#E4F8EF]", cor: "text-primary-action" },
  pesagem: { icone: Weight, fundo: "bg-[#EEF1EE]", cor: "text-texto" },
  pasto: { icone: Wheat, fundo: "bg-[#E7F4EA]", cor: "text-primary" },
  cochos: { icone: Soup, fundo: "bg-[#FDECDC]", cor: "text-marca-laranja" },
};

export function ProximosManejos({ manejos }: { manejos: ProximoManejo[] }) {
  return (
    <CardPainel className="flex h-auto min-h-[278px] flex-col lg:h-[278px]">
      <header className="mb-2 flex items-start justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-texto">
          <CalendarDays className="size-4 text-primary" aria-hidden />
          Próximos Manejos
        </h2>
        <Link
          href="/manejo"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-action hover:underline"
        >
          Ver todos
          <ArrowUpRight className="size-3.5" />
        </Link>
      </header>

      <ul className="flex flex-1 flex-col justify-between">
        {manejos.map((manejo) => {
          const { dia, mes } = formatarDiaMesExtenso(manejo.data);
          const visual = ICONES[manejo.tipo];
          const Icone = visual.icone;

          return (
            <li key={manejo.id}>
              <Link
                href="/manejo"
                className="flex items-center gap-2 rounded-lg hover:bg-muted/70"
              >
                <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-[8px] bg-[#F2F5F3]">
                  <span className="text-[13px] leading-none font-bold text-texto">
                    {dia}
                  </span>
                  <span className="mt-0.5 text-[9px] font-semibold tracking-wide text-texto-suave uppercase">
                    {mes}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[8px]",
                    visual.fundo,
                    visual.cor,
                  )}
                >
                  <Icone className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-texto">
                    {manejo.titulo}
                  </span>
                  <span className="block truncate text-xs text-texto-suave">
                    {manejo.subtitulo}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-texto-suave" />
              </Link>
            </li>
          );
        })}
      </ul>
    </CardPainel>
  );
}
