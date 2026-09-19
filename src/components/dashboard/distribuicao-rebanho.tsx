"use client";

import { ChartPie } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { CardPainel } from "@/components/dashboard/card-painel";
import { ChartContainer } from "@/components/ui/chart";
import type { FatiaRebanho } from "@/lib/dashboard/mock";
import { formatarInteiro } from "@/lib/formatacao";

export function DistribuicaoRebanho({ fatias }: { fatias: FatiaRebanho[] }) {
  const [pronto, setPronto] = useState(false);
  const total = fatias.reduce((soma, fatia) => soma + fatia.quantidade, 0);
  const config = Object.fromEntries(
    fatias.map((fatia) => [fatia.rotulo, { label: fatia.rotulo, color: fatia.cor }]),
  );

  useEffect(() => {
    setPronto(true);
  }, []);

  return (
    <CardPainel className="flex h-auto min-h-[242px] flex-col lg:h-[242px]">
      <h2 className="mb-3 flex items-center gap-2 text-[17px] font-semibold text-texto">
        <ChartPie className="size-4 text-primary" aria-hidden />
        Distribuição do Rebanho
      </h2>

      <div className="flex min-h-0 flex-1 items-center gap-4">
        <div className="relative size-[120px] shrink-0 xl:size-[160px]">
          {pronto ? (
            <ChartContainer
              config={config}
              className="aspect-auto size-full"
              initialDimension={{ width: 160, height: 160 }}
            >
              <PieChart>
                <Pie
                  data={fatias}
                  dataKey="quantidade"
                  nameKey="rotulo"
                  innerRadius="64%"
                  outerRadius="92%"
                  paddingAngle={1.6}
                  stroke="#ffffff"
                  strokeWidth={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {fatias.map((fatia) => (
                    <Cell key={fatia.rotulo} fill={fatia.cor} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : null}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] leading-none font-bold text-texto">
              {formatarInteiro(total)}
            </span>
            <span className="mt-1 text-xs text-texto-suave">animais</span>
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {fatias.map((fatia) => (
            <li
              key={fatia.rotulo}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[12px] sm:text-[13px]"
            >
              <span className="flex min-w-0 items-center gap-2 text-texto">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: fatia.cor }}
                />
                <span className="truncate">{fatia.rotulo}</span>
              </span>
              <span className="font-bold tabular-nums text-texto">
                {fatia.percentual}%
              </span>
              <span className="w-8 text-right tabular-nums text-texto-suave">
                {formatarInteiro(fatia.quantidade)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CardPainel>
  );
}
