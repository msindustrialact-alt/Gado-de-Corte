import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  ClipboardList,
  Pill,
  Soup,
  Syringe,
  TriangleAlert,
  Weight,
} from "lucide-react";

import { CardPainel } from "@/components/dashboard/card-painel";
import type { Ocorrencia, TipoOcorrencia } from "@/lib/dashboard/mock";
import { formatarDiaMes } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

const ICONES: Record<
  TipoOcorrencia,
  { icone: typeof ArrowUp; fundo: string; cor: string }
> = {
  entrada: { icone: ArrowUp, fundo: "bg-[#DDF1E6]", cor: "text-positivo" },
  pesagem: { icone: Weight, fundo: "bg-[#FEF3C7]", cor: "text-alerta" },
  vacinacao: { icone: Syringe, fundo: "bg-[#DBEAFE]", cor: "text-info" },
  medicacao: { icone: Pill, fundo: "bg-[#E4F8EF]", cor: "text-primary-action" },
  tratamento: { icone: TriangleAlert, fundo: "bg-[#FEE2E2]", cor: "text-perigo" },
  dieta: { icone: Soup, fundo: "bg-[#EEF1EE]", cor: "text-texto-suave" },
};

export function UltimasOcorrencias({
  ocorrencias,
}: {
  ocorrencias: Ocorrencia[];
}) {
  return (
    <CardPainel className="flex h-auto min-h-[242px] flex-col lg:h-[242px]">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-texto">
          <ClipboardList className="size-4 text-primary" aria-hidden />
          Últimas Ocorrências
        </h2>
        <Link
          href="/pesagens"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-action hover:underline"
        >
          Ver todas
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      <ul className="flex flex-1 flex-col justify-between">
        {ocorrencias.length === 0 ? (
          <li className="flex flex-1 items-center justify-center text-sm text-texto-suave">
            Pesagens, vacinas e medicações aparecem aqui.
          </li>
        ) : (
          ocorrencias.map((ocorrencia) => {
            const visual = ICONES[ocorrencia.tipo];
            const Icone = visual.icone;

            return (
              <li key={ocorrencia.id}>
                <Link
                  href={ocorrencia.href ?? "/pesagens"}
                  className="flex items-center gap-2.5 rounded-lg hover:bg-muted/70"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      visual.fundo,
                      visual.cor,
                    )}
                  >
                    <Icone className="size-4" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-texto">
                      {ocorrencia.titulo}
                    </span>
                    <span className="block truncate text-xs text-texto-suave">
                      {ocorrencia.subtitulo}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-texto-suave">
                    {formatarDiaMes(ocorrencia.data)}
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </CardPainel>
  );
}
