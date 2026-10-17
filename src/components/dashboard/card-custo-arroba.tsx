import { CircleDollarSign } from "lucide-react";

import type { PesagemCustoCard } from "@/lib/dashboard/data";
import { custoArrobaPonderado } from "@/lib/custos-periodo/calculo";
import { formatCustoArroba } from "@/lib/pesagens";

export function CardCustoArroba({ pesagens }: { pesagens: PesagemCustoCard[] }) {
  const valor = custoArrobaPonderado(pesagens);

  return (
    <article className="col-span-3 flex h-auto min-h-[88px] flex-col items-start gap-1.5 rounded-[12px] border border-border bg-card px-2 py-2 shadow-card sm:flex-row sm:items-center sm:gap-2.5 sm:px-3 lg:col-span-1 lg:h-[112px] lg:min-h-0 lg:flex-row lg:items-center lg:gap-2.5 lg:px-3 lg:py-0 2xl:gap-3.5 2xl:px-3.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#DDF1E6] text-[#1D6A3D] sm:size-10 lg:size-12 lg:rounded-[12px] 2xl:size-[62px]">
        <CircleDollarSign
          className="size-[18px] text-[#1D6A3D] sm:size-[22px] lg:size-[30px]"
          strokeWidth={2.25}
        />
      </div>
      <div className="min-w-0 w-full">
        <p className="truncate text-[10px] leading-tight text-texto-suave sm:text-[11px] lg:text-[12px] 2xl:text-[14px]">
          Custo @ (Produzida)
        </p>
        <p className="truncate text-[14px] leading-tight font-bold text-texto sm:text-[16px] lg:text-[20px] 2xl:text-[30px]">
          {formatCustoArroba(valor)}
        </p>
        <p className="mt-0.5 truncate text-[9px] text-texto-suave sm:mt-1 sm:text-[10px] lg:text-[11px] 2xl:text-[12px]">
          Todas as pesagens
        </p>
      </div>
    </article>
  );
}
