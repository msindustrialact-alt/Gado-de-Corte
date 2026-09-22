"use client";

import { ChartLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { CardPainel } from "@/components/dashboard/card-painel";
import { SeletorPainel } from "@/components/dashboard/seletor-painel";
import { ChartContainer } from "@/components/ui/chart";
import type { PontoEvolucaoPeso } from "@/lib/dashboard/mock";

const CONFIG = {
  peso: { label: "Peso", color: "#1D6A3D" },
};

export function EvolucaoPeso({ dados }: { dados: PontoEvolucaoPeso[] }) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPronto(true);
  }, []);

  return (
    <CardPainel className="flex h-auto min-h-[278px] flex-col lg:h-[278px]">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-texto">
          <ChartLine className="size-4 text-primary" aria-hidden />
          Evolução de Peso
        </h2>
        <SeletorPainel
          valor="6m"
          opcoes={[{ valor: "6m", rotulo: "Últimos 6 meses" }]}
        />
      </header>

      {dados.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-texto-suave">
          A curva entra depois das primeiras pesagens concluídas.
        </p>
      ) : pronto ? (
        <ChartContainer
          config={CONFIG}
          className="aspect-auto min-h-0 w-full flex-1"
          initialDimension={{ width: 420, height: 200 }}
        >
          <AreaChart
            data={dados}
            margin={{ top: 18, right: 44, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="preenchimentoPeso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D6A3D" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#1D6A3D" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#E4E9E6"
            />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: "#6B7A72", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={48}
              tick={{ fill: "#6B7A72", fontSize: 11 }}
              label={{
                value: "Peso (kg)",
                angle: -90,
                position: "insideLeft",
                offset: 8,
                style: { fill: "#6B7A72", fontSize: 11 },
              }}
            />
            <Area
              type="monotone"
              dataKey="peso"
              stroke="#1D6A3D"
              strokeWidth={2.2}
              fill="url(#preenchimentoPeso)"
              dot={<PontoPeso indiceUltimo={dados.length - 1} />}
              activeDot={{ r: 5, fill: "#1D6A3D", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </CardPainel>
  );
}

function PontoPeso({
  cx,
  cy,
  index,
  payload,
  indiceUltimo,
}: {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: PontoEvolucaoPeso;
  indiceUltimo?: number;
}) {
  if (cx == null || cy == null || payload == null) {
    return null;
  }

  const ehUltimo = index === indiceUltimo;

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#1D6A3D" stroke="#fff" strokeWidth={2} />
      {ehUltimo ? (
        <g transform={`translate(${cx - 26}, ${cy - 28})`}>
          <rect width="52" height="22" rx="11" fill="#1D6A3D" />
          <text
            x="26"
            y="15"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="600"
          >
            {payload.peso} kg
          </text>
        </g>
      ) : null}
    </g>
  );
}
