import type { Metadata } from "next";

import { BannerDashboard } from "@/components/dashboard/banner";
import { DesempenhoLotes } from "@/components/dashboard/desempenho-lotes";
import { DistribuicaoRebanho } from "@/components/dashboard/distribuicao-rebanho";
import { EvolucaoPeso } from "@/components/dashboard/evolucao-peso";
import { KpisDashboard } from "@/components/dashboard/kpis";
import { ProximosManejos } from "@/components/dashboard/proximos-manejos";
import { RebanhoPorFazenda } from "@/components/dashboard/rebanho-fazenda";
import { UltimasOcorrencias } from "@/components/dashboard/ultimas-ocorrencias";
import {
  getDesempenhoLotes,
  getDistribuicaoRebanho,
  getEvolucaoPeso,
  getKpis,
  getProximosManejos,
  getRebanhoPorFazenda,
  getUltimasOcorrencias,
} from "@/lib/dashboard/data";

export const metadata: Metadata = {
  title: "Início | Fazendas Joana e Cataguá",
};

export default async function PaginaDashboard() {
  const [kpis, evolucao, lotes, manejos, rebanho, ocorrencias, rebanhoFazenda] =
    await Promise.all([
      getKpis(),
      getEvolucaoPeso(),
      getDesempenhoLotes(),
      getProximosManejos(),
      getDistribuicaoRebanho(),
      getUltimasOcorrencias(),
      getRebanhoPorFazenda(),
    ]);

  return (
    <div>
      <h1 className="sr-only">Início</h1>
      <BannerDashboard />

      <div className="space-y-3 p-4">
        <KpisDashboard kpis={kpis} />

        <div className="lg:hidden">
          <DistribuicaoRebanho fatias={rebanho} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <EvolucaoPeso dados={evolucao} />
          <DesempenhoLotes lotes={lotes} />
          <ProximosManejos manejos={manejos} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <DistribuicaoRebanho fatias={rebanho} />
          </div>
          <UltimasOcorrencias ocorrencias={ocorrencias} />
          <RebanhoPorFazenda itens={rebanhoFazenda} />
        </div>
      </div>
    </div>
  );
}
