import {
  MOCK_DESEMPENHO_LOTES,
  MOCK_DISTRIBUICAO_REBANHO,
  MOCK_EVOLUCAO_PESO,
  MOCK_KPIS,
  mockProximosManejos,
  mockUltimasOcorrencias,
  type DesempenhoLote,
  type FatiaRebanho,
  type Kpi,
  type Ocorrencia,
  type PontoEvolucaoPeso,
  type ProximoManejo,
} from "@/lib/dashboard/mock";

export type {
  DesempenhoLote,
  FatiaRebanho,
  Kpi,
  Ocorrencia,
  PontoEvolucaoPeso,
  ProximoManejo,
};

export async function getKpis(): Promise<Kpi[]> {
  return MOCK_KPIS;
}

export async function getEvolucaoPeso(): Promise<PontoEvolucaoPeso[]> {
  return MOCK_EVOLUCAO_PESO;
}

export async function getDesempenhoLotes(): Promise<DesempenhoLote[]> {
  return MOCK_DESEMPENHO_LOTES;
}

export async function getProximosManejos(): Promise<ProximoManejo[]> {
  return mockProximosManejos();
}

export async function getDistribuicaoRebanho(): Promise<FatiaRebanho[]> {
  return MOCK_DISTRIBUICAO_REBANHO;
}

export async function getUltimasOcorrencias(): Promise<Ocorrencia[]> {
  return mockUltimasOcorrencias();
}
