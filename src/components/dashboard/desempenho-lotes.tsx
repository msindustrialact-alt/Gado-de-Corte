import { ChartColumn } from "lucide-react";

import { CardPainel } from "@/components/dashboard/card-painel";
import { SeletorPainel } from "@/components/dashboard/seletor-painel";
import type { DesempenhoLote } from "@/lib/dashboard/mock";
import { formatarDecimal } from "@/lib/formatacao";

const TONS_VERDE = ["#1D6A3D", "#2E7D4A", "#4C9A66", "#6FB384", "#9FCEA9"];

export function DesempenhoLotes({ lotes }: { lotes: DesempenhoLote[] }) {
  const maximo = Math.max(0.01, ...lotes.map((lote) => lote.ganhoKgDia));

  return (
    <CardPainel className="flex h-auto min-h-[278px] flex-col lg:h-[278px]">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-texto">
          <ChartColumn className="size-4 text-primary" aria-hidden />
          Desempenho dos Lotes
        </h2>
        <SeletorPainel
          valor="ganho"
          opcoes={[{ valor: "ganho", rotulo: "Ganho de Peso" }]}
        />
      </header>

      {lotes.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-texto-suave">
          Conclua a primeira pesagem para comparar o GMD dos lotes.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col justify-between gap-3">
          {lotes.map((lote, indice) => {
            const largura = (lote.ganhoKgDia / maximo) * 100;

            return (
              <li
                key={lote.nome}
                className="grid w-full grid-cols-[130px_minmax(0,1fr)_90px] items-center gap-x-3"
              >
                <span className="truncate text-sm text-texto">{lote.nome}</span>
                <div className="h-3 overflow-hidden rounded-[6px] bg-[#E8F3EC]">
                  <div
                    className="h-full rounded-[6px]"
                    style={{
                      width: `${largura}%`,
                      backgroundColor:
                        TONS_VERDE[indice] ?? TONS_VERDE[TONS_VERDE.length - 1],
                    }}
                  />
                </div>
                <span className="text-right text-sm tabular-nums text-texto-suave">
                  {formatarDecimal(lote.ganhoKgDia)} kg/dia
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </CardPainel>
  );
}
