import { addDays, subDays } from "date-fns";

export type IconeKpi = "animais" | "lotes" | "peso" | "ganho" | "custo";

export type Kpi = {
  id: string;
  rotulo: string;
  valor: number | null;
  sufixoValor?: string;
  moeda?: boolean;
  variacao: number | null;
  sufixoVariacao: string;
  direcao: "alta" | "baixa";
  icone: IconeKpi;
};

export type PontoEvolucaoPeso = {
  mes: string;
  peso: number;
};

export type DesempenhoLote = {
  nome: string;
  ganhoKgDia: number;
};

export type TipoManejo =
  | "vacinacao"
  | "vermifugacao"
  | "pesagem"
  | "pasto"
  | "cochos";

export type ProximoManejo = {
  id: string;
  titulo: string;
  subtitulo: string;
  data: Date;
  tipo: TipoManejo;
  href?: string;
};

export type FatiaRebanho = {
  rotulo: string;
  percentual: number;
  quantidade: number;
  cor: string;
};

export type TipoOcorrencia =
  | "entrada"
  | "pesagem"
  | "vacinacao"
  | "tratamento"
  | "dieta";

export type Ocorrencia = {
  id: string;
  titulo: string;
  subtitulo: string;
  data: Date;
  tipo: TipoOcorrencia;
  href?: string;
};

export type RebanhoFazenda = {
  propriedade: "joana" | "catagua";
  rotulo: string;
  quantidade: number;
  percentual: number;
};

export const MOCK_KPIS: Kpi[] = [
  {
    id: "animais",
    rotulo: "Total de Animais",
    valor: 1248,
    variacao: 8,
    sufixoVariacao: "%",
    direcao: "alta",
    icone: "animais",
  },
  {
    id: "lotes",
    rotulo: "Lotes Ativos",
    valor: 18,
    variacao: 12,
    sufixoVariacao: "%",
    direcao: "alta",
    icone: "lotes",
  },
  {
    id: "peso",
    rotulo: "Peso Médio Atual",
    valor: 342,
    sufixoValor: " kg",
    variacao: 22,
    sufixoVariacao: " kg",
    direcao: "alta",
    icone: "peso",
  },
  {
    id: "ganho",
    rotulo: "Ganho Médio Diário",
    valor: 1.25,
    sufixoValor: " kg/dia",
    variacao: 14,
    sufixoVariacao: "%",
    direcao: "alta",
    icone: "ganho",
  },
  {
    id: "custo",
    rotulo: "Custo @ (Projetado)",
    valor: 284.5,
    moeda: true,
    variacao: 6,
    sufixoVariacao: "%",
    direcao: "baixa",
    icone: "custo",
  },
];

export const MOCK_EVOLUCAO_PESO: PontoEvolucaoPeso[] = [
  { mes: "Mar", peso: 228 },
  { mes: "Abr", peso: 256 },
  { mes: "Mai", peso: 277 },
  { mes: "Jun", peso: 295 },
  { mes: "Jul", peso: 311 },
  { mes: "Ago", peso: 328 },
  { mes: "Set", peso: 342 },
];

export const MOCK_DESEMPENHO_LOTES: DesempenhoLote[] = [
  { nome: "Lote 01 - Recria", ganhoKgDia: 1.42 },
  { nome: "Lote 02 - Recria", ganhoKgDia: 1.28 },
  { nome: "Lote 03 - Engorda", ganhoKgDia: 1.18 },
  { nome: "Lote 04 - Engorda", ganhoKgDia: 1.1 },
  { nome: "Lote 05 - Recria", ganhoKgDia: 0.98 },
];

export const MOCK_DISTRIBUICAO_REBANHO: FatiaRebanho[] = [
  { rotulo: "Machos (0–12 meses)", percentual: 18, quantidade: 224, cor: "#146C3B" },
  { rotulo: "Machos (12–24 meses)", percentual: 32, quantidade: 398, cor: "#3DB37E" },
  { rotulo: "Machos (>24 meses)", percentual: 26, quantidade: 324, cor: "#7E8A6E" },
  { rotulo: "Fêmeas (0–12 meses)", percentual: 12, quantidade: 150, cor: "#8C8F86" },
  { rotulo: "Fêmeas (12–24 meses)", percentual: 8, quantidade: 102, cor: "#F4A26B" },
  { rotulo: "Fêmeas (>24 meses)", percentual: 4, quantidade: 50, cor: "#E8735F" },
];

export function mockProximosManejos(agora = new Date()): ProximoManejo[] {
  const offsets = [1, 3, 6, 9, 12];
  const itens: Omit<ProximoManejo, "id" | "data">[] = [
    { titulo: "Vacinação", subtitulo: "Lote 03 - Recria", tipo: "vacinacao" },
    { titulo: "Vermifugação", subtitulo: "Lote 01 e 02", tipo: "vermifugacao" },
    { titulo: "Pesagem", subtitulo: "Lote 04 - Engorda", tipo: "pesagem" },
    { titulo: "Manejo de Pasto", subtitulo: "Rotação - Piquete 5", tipo: "pasto" },
    { titulo: "Revisão de Cochos", subtitulo: "Todos os lotes", tipo: "cochos" },
  ];

  return itens.map((item, indice) => ({
    ...item,
    id: `manejo-${indice + 1}`,
    data: addDays(agora, offsets[indice]!),
  }));
}

export function mockUltimasOcorrencias(agora = new Date()): Ocorrencia[] {
  const offsets = [3, 4, 6, 7, 8];
  const itens: Omit<Ocorrencia, "id" | "data">[] = [
    {
      titulo: "Entrada de animais",
      subtitulo: "32 animais - Lote 06",
      tipo: "entrada",
    },
    {
      titulo: "Pesagem realizada",
      subtitulo: "Lote 03 - 148 animais",
      tipo: "pesagem",
    },
    {
      titulo: "Vacinação",
      subtitulo: "Lote 02 - 95 animais",
      tipo: "vacinacao",
    },
    {
      titulo: "Tratamento",
      subtitulo: "3 animais - carrapato",
      tipo: "tratamento",
    },
    {
      titulo: "Ajuste de dieta",
      subtitulo: "Lote 04 - aumento de concentrado",
      tipo: "dieta",
    },
  ];

  return itens.map((item, indice) => ({
    ...item,
    id: `ocorrencia-${indice + 1}`,
    data: subDays(agora, offsets[indice]!),
  }));
}
