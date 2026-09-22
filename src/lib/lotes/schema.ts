import { z } from "zod";

import { vazioParaNulo } from "@/lib/acao";
import { hojeISO } from "@/lib/animais";
import { OBJETIVOS_LOTE, type ObjetivoLote, type StatusLote } from "@/lib/lotes";
import type { TablesInsert, TablesUpdate } from "@/types/database";

export const schemaLote = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome."),
    objetivo: z.string(),
    data_formacao: z.string(),
    status: z.enum(["ativo", "encerrado"]),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    const objetivo = vazioParaNulo(dados.objetivo);

    if (objetivo && !OBJETIVOS_LOTE.includes(objetivo as ObjetivoLote)) {
      ctx.addIssue({
        code: "custom",
        path: ["objetivo"],
        message: "Objetivo inválido.",
      });
    }

    const data = vazioParaNulo(dados.data_formacao);

    if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      ctx.addIssue({
        code: "custom",
        path: ["data_formacao"],
        message: "Informe uma data válida.",
      });
    }

    if (data && data > hojeISO()) {
      ctx.addIssue({
        code: "custom",
        path: ["data_formacao"],
        message: "A data não pode ser futura.",
      });
    }
  });

export type LoteFormInput = z.input<typeof schemaLote>;

export function valoresPadraoLote(): LoteFormInput {
  return {
    nome: "",
    objetivo: "",
    data_formacao: hojeISO(),
    status: "ativo",
    observacoes: "",
  };
}

export function paraRegistroLote(dados: LoteFormInput): Pick<
  TablesInsert<"lotes">,
  "nome" | "objetivo" | "data_formacao" | "observacoes" | "status"
> {
  return {
    nome: dados.nome.trim(),
    objetivo: (vazioParaNulo(dados.objetivo) as ObjetivoLote | null) ?? null,
    data_formacao: vazioParaNulo(dados.data_formacao),
    observacoes: vazioParaNulo(dados.observacoes),
    status: dados.status as StatusLote,
  };
}

export function paraAtualizacaoLote(
  dados: LoteFormInput,
): Pick<
  TablesUpdate<"lotes">,
  "nome" | "objetivo" | "data_formacao" | "observacoes" | "status"
> {
  return paraRegistroLote(dados);
}
