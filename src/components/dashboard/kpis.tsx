import { CircleDollarSign, Layers, ArrowDown, ArrowUp, TrendingUp, Weight } from "lucide-react";

import { CardCustoArroba } from "@/components/dashboard/card-custo-arroba";
import { IconeBoi } from "@/components/icons/icone-boi";
import type { PesagemCustoCard } from "@/lib/dashboard/data";
import type { IconeKpi, Kpi } from "@/lib/dashboard/mock";
import { formatarDecimal, formatarInteiro, formatarMoeda } from "@/lib/formatacao";

export function KpisDashboard({
  kpis,
  pesagensCusto,
  lotes,
}: {
  kpis: Kpi[];
  pesagensCusto: PesagemCustoCard[];
  lotes: { id: string; nome: string }[];
}) {
  return (
    <div className="grid grid-cols-6 gap-2 lg:grid-cols-5 lg:gap-3">
      {kpis.map((kpi, indice) =>
        kpi.id === "custo" ? (
          <CardCustoArroba key={kpi.id} pesagens={pesagensCusto} lotes={lotes} />
        ) : (
        <article
          key={kpi.id}
          className={`flex h-auto min-h-[88px] flex-col items-start gap-1.5 rounded-[12px] border border-border bg-card px-2 py-2 shadow-card sm:flex-row sm:items-center sm:gap-2.5 sm:px-3 lg:col-span-1 lg:h-[112px] lg:min-h-0 lg:flex-row lg:items-center lg:gap-2.5 lg:px-3 lg:py-0 2xl:gap-3.5 2xl:px-3.5 ${
            indice < 3 ? "col-span-2" : "col-span-3"
          }`}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#DDF1E6] text-[#1D6A3D] sm:size-10 lg:size-12 lg:rounded-[12px] 2xl:size-[62px]">
            <IconeDoKpi nome={kpi.icone} />
          </div>
          <div className="min-w-0 w-full">
            <p className="truncate text-[10px] leading-tight text-texto-suave sm:text-[11px] lg:text-[12px] 2xl:text-[14px]">
              {kpi.rotulo}
            </p>
            <p className="truncate text-[14px] leading-tight font-bold text-texto sm:text-[16px] lg:text-[20px] 2xl:text-[30px]">
              {formatarValor(kpi)}
            </p>
            {kpi.variacao != null ? (
              <p className="mt-0.5 flex items-center gap-0.5 truncate text-[9px] sm:mt-1 sm:gap-1 sm:text-[10px] lg:text-[11px] 2xl:text-[12px]">
                {kpi.direcao === "alta" ? (
                  <ArrowUp className="size-3 text-positivo lg:size-3.5" aria-hidden />
                ) : (
                  <ArrowDown className="size-3 text-positivo lg:size-3.5" aria-hidden />
                )}
                <span className="font-bold text-positivo">
                  {`${formatarInteiro(kpi.variacao)}${kpi.sufixoVariacao}`}
                </span>
                <span className="hidden truncate text-texto-suave sm:inline">vs. mês anterior</span>
              </p>
            ) : (
              <p className="mt-0.5 truncate text-[9px] text-texto-suave sm:mt-1 sm:text-[10px] lg:text-[11px] 2xl:text-[12px]">
                Rebanho atual
              </p>
            )}
          </div>
        </article>
        ),
      )}
    </div>
  );
}

function formatarValor(kpi: Kpi) {
  if (kpi.valor == null) {
    return "—";
  }

  if (kpi.moeda) {
    return formatarMoeda(kpi.valor);
  }

  const numero =
    kpi.icone === "ganho" ? formatarDecimal(kpi.valor) : formatarInteiro(kpi.valor);

  return `${numero}${kpi.sufixoValor ?? ""}`;
}

function IconeDoKpi({ nome }: { nome: IconeKpi }) {
  const classeLucide =
    "size-[18px] text-[#1D6A3D] sm:size-[22px] lg:size-[30px]";

  if (nome === "animais") {
    return (
      <IconeBoi className={classeLucide} strokeWidth={2.25} />
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
