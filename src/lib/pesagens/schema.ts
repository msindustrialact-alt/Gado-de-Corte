import { z } from "zod";

import { vazioParaNulo } from "@/lib/acao";
import { hojeISO, parseNumeroPt } from "@/lib/animais";

const uuid = z.string().uuid("Registro inválido.");

const condicaoPesagem = z.enum(["sem_jejum", "jejum_ate_12h", "jejum_mais_12h"]);

export const schemaNovaPesagem = z
  .object({
    lote_id: z.string().min(1, "Selecione o lote.").uuid("Lote inválido."),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
    custo_alimentacao: z.string(),
    condicao_pesagem: z.union([z.literal(""), condicaoPesagem]),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    if (dados.data > hojeISO()) {
      ctx.addIssue({
        code: "custom",
        path: ["data"],
        message: "A data não pode ser futura.",
      });
    }

    const custo = vazioParaNulo(dados.custo_alimentacao);

    if (custo) {
      const numero = parseNumeroPt(custo);

      if (numero == null || numero < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["custo_alimentacao"],
          message: "Informe um custo válido.",
        });
      }
    }
  });

export type NovaPesagemInput = z.input<typeof schemaNovaPesagem>;

export const schemaSalvarSessao = z.object({
  custo_alimentacao: z.string(),
  condicao_pesagem: z.union([z.literal(""), condicaoPesagem]),
  observacoes: z.string(),
  itens: z.array(
    z.object({
      animal_id: uuid,
      peso: z.string(),
    }),
  ),
});

export type SalvarSessaoInput = z.input<typeof schemaSalvarSessao>;

export function valoresPadraoNovaPesagem(loteId = ""): NovaPesagemInput {
  return {
    lote_id: loteId,
    data: hojeISO(),
    custo_alimentacao: "",
    condicao_pesagem: "",
    observacoes: "",
  };
}

export function custoDeCampo(valor: string): number | null {
  const texto = vazioParaNulo(valor);

  if (!texto) {
    return null;
  }

  return parseNumeroPt(texto);
}

export function condicaoDeCampo(
  valor: string,
): "sem_jejum" | "jejum_ate_12h" | "jejum_mais_12h" | null {
  if (
    valor === "sem_jejum" ||
    valor === "jejum_ate_12h" ||
    valor === "jejum_mais_12h"
  ) {
    return valor;
  }

  return null;
}
