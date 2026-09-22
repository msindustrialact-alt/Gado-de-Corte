import type { Enums } from "@/types/database";

export type ObjetivoLote = Enums<"objetivo_lote">;
export type StatusLote = Enums<"status_lote">;

export type LoteResumo = {
  id: string;
  nome: string;
  objetivo: ObjetivoLote | null;
  status: StatusLote;
  data_formacao: string | null;
  observacoes: string | null;
  qtd_animais: number;
  peso_medio: number | null;
};

export type LoteDetalhe = LoteResumo & {
  machos: number;
  femeas: number;
};

export const OBJETIVOS_LOTE: ObjetivoLote[] = [
  "cria",
  "recria",
  "engorda",
  "reproducao",
  "quarentena",
  "venda",
];

export const LABELS_OBJETIVO: Record<ObjetivoLote, string> = {
  cria: "Cria",
  recria: "Recria",
  engorda: "Engorda",
  reproducao: "Reprodução",
  quarentena: "Quarentena",
  venda: "Venda",
};

export const LABELS_STATUS_LOTE: Record<StatusLote, string> = {
  ativo: "Ativo",
  encerrado: "Encerrado",
};

export const OPCOES_OBJETIVO = OBJETIVOS_LOTE.map((valor) => ({
  valor,
  rotulo: LABELS_OBJETIVO[valor],
}));

export const OPCOES_STATUS_LOTE = [
  { valor: "ativo", rotulo: "Ativo" },
  { valor: "encerrado", rotulo: "Encerrado" },
] as const;

export const OPCOES_FILTRO_STATUS_LOTE = [
  { valor: "ativo", rotulo: "Ativos" },
  { valor: "encerrado", rotulo: "Encerrados" },
  { valor: "todos", rotulo: "Todos" },
] as const;

export type FiltroStatusLote = "ativo" | "encerrado" | "todos";

export function filtrarLotes(
  lotes: LoteResumo[],
  busca: string,
  status: StatusLote | "todos",
): LoteResumo[] {
  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  return lotes.filter((lote) => {
    if (status !== "todos" && lote.status !== status) {
      return false;
    }

    if (!termo) {
      return true;
    }

    return lote.nome.toLocaleLowerCase("pt-BR").includes(termo);
  });
}
