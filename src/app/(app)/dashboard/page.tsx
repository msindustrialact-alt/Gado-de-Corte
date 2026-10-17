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
  getIdsLotesDaPropriedade,
  getKpis,
  getPesagensCustoCard,
  getProximosManejos,
  getRebanhoPorFazenda,
  getUltimasOcorrencias,
} from "@/lib/dashboard/data";
import { lerFazendaPainelAtual } from "@/lib/fazenda-painel-servidor";

export const metadata: Metadata = {
  title: "Início | Fazendas Joana e Cataguá",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaginaDashboard({ searchParams }: Props) {
  const params = await searchParams;
  const fazendaPainel = await lerFazendaPainelAtual(params.fazenda);
  const propriedade = fazendaPainel === "todas" ? null : fazendaPainel;
  const loteIds = propriedade ? await getIdsLotesDaPropriedade(propriedade) : null;
  const [kpis, evolucao, lotes, manejos, rebanho, ocorrencias, rebanhoFazenda, custoArroba] =
    await Promise.all([
      getKpis(propriedade, loteIds),
      getEvolucaoPeso(loteIds),
      getDesempenhoLotes(loteIds),
      getProximosManejos(loteIds),
      getDistribuicaoRebanho(propriedade),
      getUltimasOcorrencias(loteIds),
      getRebanhoPorFazenda(),
      getPesagensCustoCard(loteIds),
    ]);

  return (
    <div>
      <h1 className="sr-only">Início</h1>
      <BannerDashboard />

      <div className="space-y-3 p-4">
        <KpisDashboard
          key={fazendaPainel}
          kpis={kpis}
          pesagensCusto={custoArroba.pesagens}
          lotes={custoArroba.lotes}
        />

        <div className="lg:hidden">
          <DistribuicaoRebanho fatias={rebanho} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <EvolucaoPeso dados={evolucao} />
          <DesempenhoLotes lotes={lotes} />
          <ProximosManejos manejos={manejos} />
        </div>

        <div
          className={`grid grid-cols-1 gap-3 ${
            propriedade
              ? "lg:grid-cols-2"
              : "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_minmax(0,1fr)]"
          }`}
        >
          <div className="hidden lg:block">
            <DistribuicaoRebanho fatias={rebanho} />
          </div>
          <UltimasOcorrencias ocorrencias={ocorrencias} />
          {propriedade ? null : <RebanhoPorFazenda itens={rebanhoFazenda} />}
        </div>
      </div>
    </div>
  );
}
