import { z } from "zod";

import { vazioParaNulo } from "@/lib/acao";
import { hojeISO, parseNumeroPt } from "@/lib/animais";
import { CATEGORIAS_PRODUTO, type CategoriaProduto } from "@/lib/estoque";

function numeroDeCampo(
  valor: string,
  ctx: z.RefinementCtx,
  path: string,
  rotulo: string,
  opts?: { min?: number; permitirZero?: boolean },
): number | null {
  const texto = vazioParaNulo(valor);

  if (!texto) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: `Informe ${rotulo}.`,
    });
    return null;
  }

  const numero = parseNumeroPt(texto);

  if (numero == null || !Number.isFinite(numero)) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: `${rotulo} inválido.`,
    });
    return null;
  }

  const minimo = opts?.min ?? (opts?.permitirZero ? 0 : 0.0001);

  if (numero < minimo) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: opts?.permitirZero
        ? `${rotulo} não pode ser negativo.`
        : `${rotulo} deve ser maior que zero.`,
    });
    return null;
  }

  return numero;
}

export const schemaProduto = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome."),
    categoria: z.string(),
    unidade: z.string().trim().min(1, "Informe a unidade."),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    if (!CATEGORIAS_PRODUTO.includes(dados.categoria as CategoriaProduto)) {
      ctx.addIssue({
        code: "custom",
        path: ["categoria"],
        message: "Categoria inválida.",
      });
    }
  });

export type ProdutoFormInput = z.input<typeof schemaProduto>;

export function valoresPadraoProduto(
  categoria: CategoriaProduto = "alimentacao",
): ProdutoFormInput {
  return {
    nome: "",
    categoria,
    unidade: "saco",
    observacoes: "",
  };
}

export const schemaEntradaEstoque = z
  .object({
    produto_id: z.string().uuid("Selecione o produto."),
    quantidade: z.string(),
    custo_unitario: z.string(),
    data: z.string(),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    numeroDeCampo(dados.quantidade, ctx, "quantidade", "a quantidade");
    numeroDeCampo(dados.custo_unitario, ctx, "custo_unitario", "o custo unitário", {
      permitirZero: true,
      min: 0,
    });

    const data = vazioParaNulo(dados.data);

    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      ctx.addIssue({
        code: "custom",
        path: ["data"],
        message: "Informe uma data válida.",
      });
    } else if (data > hojeISO()) {
      ctx.addIssue({
        code: "custom",
        path: ["data"],
        message: "A data não pode ser futura.",
      });
    }
  });

export type EntradaEstoqueFormInput = z.input<typeof schemaEntradaEstoque>;

export function valoresPadraoEntrada(produtoId = ""): EntradaEstoqueFormInput {
  return {
    produto_id: produtoId,
    quantidade: "",
    custo_unitario: "",
    data: hojeISO(),
    observacoes: "",
  };
}

export const schemaLancamentoLote = z
  .object({
    lote_id: z.string().uuid("Selecione o lote."),
    produto_id: z.string().uuid("Selecione o produto."),
    quantidade: z.string(),
    data_inicio: z.string(),
    data_fim: z.string(),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    numeroDeCampo(dados.quantidade, ctx, "quantidade", "a quantidade");

    const inicio = vazioParaNulo(dados.data_inicio);

    if (!inicio || !/^\d{4}-\d{2}-\d{2}$/.test(inicio)) {
      ctx.addIssue({
        code: "custom",
        path: ["data_inicio"],
        message: "Informe a data de início.",
      });
    } else if (inicio > hojeISO()) {
      ctx.addIssue({
        code: "custom",
        path: ["data_inicio"],
        message: "A data não pode ser futura.",
      });
    }

    const fim = vazioParaNulo(dados.data_fim);

    if (fim) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fim)) {
        ctx.addIssue({
          code: "custom",
          path: ["data_fim"],
          message: "Data final inválida.",
        });
      } else if (inicio && fim < inicio) {
        ctx.addIssue({
          code: "custom",
          path: ["data_fim"],
          message: "A data final deve ser após o início.",
        });
      }
    }
  });

export type LancamentoLoteFormInput = z.input<typeof schemaLancamentoLote>;

export function valoresPadraoLancamento(
  loteId = "",
): LancamentoLoteFormInput {
  return {
    lote_id: loteId,
    produto_id: "",
    quantidade: "",
    data_inicio: hojeISO(),
    data_fim: "",
    observacoes: "",
  };
}

export function numeroCampo(valor: string): number {
  return parseNumeroPt(valor.trim()) ?? 0;
}
