"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign } from "lucide-react";

import type { PesagemCustoCard } from "@/lib/dashboard/data";
import {
  custoArrobaPonderado,
  somarCategorias,
} from "@/lib/custos-periodo/calculo";
import { formatarData, formatarMoeda } from "@/lib/formatacao";
import { formatCustoArroba } from "@/lib/pesagens";

export function CardCustoArroba({
  pesagens,
  lotes,
}: {
  pesagens: PesagemCustoCard[];
  lotes: { id: string; nome: string }[];
}) {
  const [loteId, setLoteId] = useState("");
  const filtradas = useMemo(
    () => (loteId ? pesagens.filter((item) => item.loteId === loteId) : pesagens),
    [loteId, pesagens],
  );
  const valor = custoArrobaPonderado(filtradas);
  const categorias = somarCategorias(filtradas);
  const ultima = [...filtradas]
    .filter((item) => item.custo != null && item.ganhoKg != null && item.ganhoKg > 0)
    .sort((a, b) => b.data.localeCompare(a.data))[0];
  const ultimaArroba = ultima
    ? custoArrobaPonderado([{ custo: ultima.custo, ganhoKg: ultima.ganhoKg }])
    : null;

  return (
    <article className="col-span-6 flex h-auto min-h-[88px] flex-col gap-2 rounded-[12px] border border-border bg-card px-3 py-2 shadow-card sm:col-span-6 lg:col-span-1 lg:h-auto lg:min-h-[112px] lg:px-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#DDF1E6] text-[#1D6A3D] sm:size-10 lg:size-12">
          <CircleDollarSign className="size-[18px] sm:size-[22px] lg:size-[30px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-texto-suave sm:text-[11px] lg:text-[12px]">
            Custo @ (Produzida)
          </p>
          <p className="text-[14px] font-bold text-texto sm:text-[16px] lg:text-[20px]">
            {formatCustoArroba(valor)}
          </p>
        </div>
      </div>
      <select
        value={loteId}
        onChange={(evento) => setLoteId(evento.target.value)}
        aria-label="Filtrar custo da arroba por lote"
        className="h-8 w-full rounded-[8px] border border-border bg-card px-2 text-xs text-texto"
      >
        <option value="">Todos os lotes</option>
        {lotes.map((lote) => (
          <option key={lote.id} value={lote.id}>
            {lote.nome}
          </option>
        ))}
      </select>
      <p className="text-[10px] leading-snug text-texto-suave lg:text-[11px]">
        {ultima
          ? `Último intervalo ${formatarData(ultima.data)} · ${formatCustoArroba(ultimaArroba)}`
          : "Sem pesagem com custo e ganho"}
      </p>
      <p className="text-[10px] leading-snug text-texto-suave lg:text-[11px]">
        Supl. {formatarMoeda(categorias.alimentacao)} · Med.{" "}
        {formatarMoeda(categorias.sanidade)} · Outros {formatarMoeda(categorias.outro)}
      </p>
    </article>
  );
}
