import { CircleDollarSign, Layers, ArrowDown, ArrowUp, TrendingUp, Weight } from "lucide-react";

import { IconeBoi } from "@/components/icons/icone-boi";
import type { IconeKpi, Kpi } from "@/lib/dashboard/mock";
import { formatarDecimal, formatarInteiro, formatarMoeda } from "@/lib/formatacao";

export function KpisDashboard({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <article
          key={kpi.id}
          className="flex h-[112px] items-center gap-2.5 rounded-[12px] border border-border bg-card px-3 shadow-card 2xl:gap-3.5 2xl:px-3.5"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[#DDF1E6] text-[#1D6A3D] 2xl:size-[62px]">
            <IconeDoKpi nome={kpi.icone} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] text-texto-suave 2xl:text-[14px]">{kpi.rotulo}</p>
            <p className="truncate text-[20px] leading-tight font-bold text-texto 2xl:text-[30px]">
              {formatarValor(kpi)}
            </p>
            <p className="mt-1 flex items-center gap-1 truncate text-[11px] 2xl:text-[12px]">
              {kpi.direcao === "alta" ? (
                <ArrowUp className="size-3.5 text-positivo" aria-hidden />
              ) : (
                <ArrowDown className="size-3.5 text-positivo" aria-hidden />
              )}
              <span className="font-bold text-positivo">
                {`${formatarInteiro(kpi.variacao)}${kpi.sufixoVariacao}`}
              </span>
              <span className="truncate text-texto-suave">vs. mês anterior</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function formatarValor(kpi: Kpi) {
  if (kpi.moeda) {
    return formatarMoeda(kpi.valor);
  }

  const numero =
    kpi.icone === "ganho" ? formatarDecimal(kpi.valor) : formatarInteiro(kpi.valor);

  return `${numero}${kpi.sufixoValor ?? ""}`;
}

function IconeDoKpi({ nome }: { nome: IconeKpi }) {
  const classeLucide = "size-[30px] text-[#1D6A3D]";

  if (nome === "animais") {
    return (
      <IconeBoi
        className="h-[30px] w-[45px] text-[#1D6A3D] [&_path]:[vector-effect:non-scaling-stroke] [&_circle]:[vector-effect:non-scaling-stroke]"
        strokeWidth={2.25}
      />
    );
  }

  if (nome === "lotes") {
    return <Layers className={classeLucide} strokeWidth={2.25} />;
  }

  if (nome === "peso") {
    return <Weight className={classeLucide} strokeWidth={2.25} />;
  }

  if (nome === "ganho") {
    return <TrendingUp className={classeLucide} strokeWidth={2.25} />;
  }

  return <CircleDollarSign className={classeLucide} strokeWidth={2.25} />;
}
