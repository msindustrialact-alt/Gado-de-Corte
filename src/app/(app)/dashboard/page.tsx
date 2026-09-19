import type { Metadata } from "next";

import { BannerDashboard } from "@/components/dashboard/banner";
import { CardPromo } from "@/components/dashboard/card-promo";
import { DesempenhoLotes } from "@/components/dashboard/desempenho-lotes";
import { DistribuicaoRebanho } from "@/components/dashboard/distribuicao-rebanho";
import { EvolucaoPeso } from "@/components/dashboard/evolucao-peso";
import { KpisDashboard } from "@/components/dashboard/kpis";
import { ProximosManejos } from "@/components/dashboard/proximos-manejos";
import { UltimasOcorrencias } from "@/components/dashboard/ultimas-ocorrencias";
import {
  getDesempenhoLotes,
  getDistribuicaoRebanho,
  getEvolucaoPeso,
  getKpis,
  getProximosManejos,
  getUltimasOcorrencias,
} from "@/lib/dashboard/data";

export const metadata: Metadata = {
  title: "Início | Fazenda Joana",
};

export default async function PaginaDashboard() {
  const [kpis, evolucao, lotes, manejos, rebanho, ocorrencias] =
    await Promise.all([
      getKpis(),
      getEvolucaoPeso(),
      getDesempenhoLotes(),
      getProximosManejos(),
      getDistribuicaoRebanho(),
      getUltimasOcorrencias(),
    ]);

  return (
    <div>
      <h1 className="sr-only">Início</h1>
      <BannerDashboard />

      <div className="space-y-3 p-4">
        <KpisDashboard kpis={kpis} />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <EvolucaoPeso dados={evolucao} />
          <DesempenhoLotes lotes={lotes} />
          <ProximosManejos manejos={manejos} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <DistribuicaoRebanho fatias={rebanho} />
          <UltimasOcorrencias ocorrencias={ocorrencias} />
          <CardPromo />
        </div>
      </div>
    </div>
  );
}
