export type CategoriaProduto = "alimentacao" | "sanidade" | "outro";

export type ProdutoItem = {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  unidade: string;
  estoque_atual: number;
  custo_medio: number;
  ativo: boolean;
  observacoes: string | null;
};

export type LancamentoLoteItem = {
  id: string;
  lote_id: string;
  lote_nome: string;
  produto_id: string;
  produto_nome: string;
  categoria: CategoriaProduto;
  data_inicio: string;
  data_fim: string | null;
  quantidade: number;
  unidade: string;
  custo_total: number;
  qtd_cabecas_snapshot: number;
  custo_por_cabeca: number;
  observacoes: string | null;
};

export type LoteOpcaoEstoque = {
  id: string;
  nome: string;
  qtd_animais: number;
};

export const CATEGORIAS_PRODUTO: CategoriaProduto[] = [
  "alimentacao",
  "sanidade",
  "outro",
];

export const LABELS_CATEGORIA: Record<CategoriaProduto, string> = {
  alimentacao: "Alimentação",
  sanidade: "Sanidade",
  outro: "Outro",
};

export const OPCOES_CATEGORIA = CATEGORIAS_PRODUTO.map((valor) => ({
  valor,
  rotulo: LABELS_CATEGORIA[valor],
}));

export const UNIDADES_COMUNS = ["un", "saco", "kg", "L", "dose", "fardo"] as const;
