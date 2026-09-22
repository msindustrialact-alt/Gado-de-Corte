"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartLine, TrendingUp, Weight } from "lucide-react";

import { CardResumo } from "@/components/layout/card-resumo";
import { ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPeso } from "@/lib/animais";
import { formatarData } from "@/lib/formatacao";
import {
  formatArroba,
  formatCustoArroba,
  formatGanho,
  formatGmd,
  type DesempenhoAnimal,
} from "@/lib/pesagens";

const CONFIG = {
  peso: { label: "Peso", color: "#1D6A3D" },
};

export function AnimalDesempenho({
  desempenho,
  loteId,
}: {
  desempenho: DesempenhoAnimal;
  loteId: string | null;
}) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPronto(true);
  }, []);

  const pontosGrafico = desempenho.pontos.map((ponto) => ({
    data: formatarData(ponto.data),
    peso: Math.round(ponto.peso_kg * 10) / 10,
  }));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-[17px] font-semibold text-texto">Desempenho</h2>
        {loteId ? (
          <Link
            href={`/pesagens/nova?lote=${loteId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Pesar o lote
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumo
          rotulo="Peso atual"
          valor={
            desempenho.peso_atual != null
              ? `${formatPeso(desempenho.peso_atual)} · ${formatArroba(desempenho.peso_atual)}`
              : "—"
          }
          icone={<Weight className="size-6" />}
        />
        <CardResumo
          rotulo="GMD do último intervalo"
          valor={formatGmd(desempenho.gmd_intervalo)}
          icone={<TrendingUp className="size-6" />}
        />
        <CardResumo
          rotulo="GMD acumulado"
          valor={formatGmd(desempenho.gmd_acumulado)}
          icone={<TrendingUp className="size-6" />}
        />
        <CardResumo
          rotulo="Custo @ est. em estoque"
          valor={formatCustoArroba(desempenho.custo_por_arroba)}
          icone={<ChartLine className="size-6" />}
        />
      </div>

      <div className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-texto">Curva de peso</h3>
        {desempenho.pontos.length < 2 ? (
          <p className="py-10 text-center text-sm text-texto-suave">
            Com duas pesagens a curva e o ganho por dia aparecem aqui.
          </p>
        ) : pronto ? (
          <ChartContainer
            config={CONFIG}
            className="aspect-[2.4/1] w-full"
            initialDimension={{ width: 520, height: 220 }}
          >
            <AreaChart data={pontosGrafico} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pesoAnimal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D6A3D" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#1D6A3D" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E4E9E6" />
              <XAxis
                dataKey="data"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: "#6B7A72", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={48}
                tick={{ fill: "#6B7A72", fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="peso"
                stroke="#1D6A3D"
                strokeWidth={2.2}
                fill="url(#pesoAnimal)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-[220px]" />
        )}
      </div>

      {desempenho.pontos.length > 0 ? (
        <div className="overflow-hidden rounded-[12px] border border-border bg-card shadow-card">
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Data</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead title="Arrobas estimadas (rendimento 50%)">@ est.</TableHead>
                <TableHead>Ganho</TableHead>
                <TableHead>GMD</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {desempenho.pontos.map((ponto) => (
                <TableRow key={`${ponto.origem}-${ponto.data}-${ponto.pesagem_id ?? "entrada"}`}>
                  <TableCell className="pl-4 tabular-nums">{formatarData(ponto.data)}</TableCell>
                  <TableCell className="tabular-nums">{formatPeso(ponto.peso_kg)}</TableCell>
                  <TableCell className="tabular-nums">{formatArroba(ponto.peso_kg)}</TableCell>
                  <TableCell className="tabular-nums">{formatGanho(ponto.ganho_kg)}</TableCell>
                  <TableCell className="tabular-nums">{formatGmd(ponto.gmd)}</TableCell>
                  <TableCell>
                    {ponto.origem === "entrada"
                      ? "Entrada"
                      : ponto.lote_nome
                        ? ponto.lote_nome
                        : "Pesagem"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
}
