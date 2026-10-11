import { z } from "zod";

import { hojeISO } from "@/lib/animais";

const uuid = z.string().uuid("Registro inválido.");

export const schemaVacina = z.object({
  id: z.union([z.literal(""), uuid]).optional(),
  nome: z.string().trim().min(1, "Informe o nome da vacina.").max(120),
  intervalo_dias: z.string(),
  observacoes: z.string(),
  ativa: z.boolean().optional(),
});

export type VacinaInput = z.input<typeof schemaVacina>;

export const schemaItemProtocolo = z.object({
  vacina_id: uuid,
  obrigatoria: z.boolean(),
  idade_minima_dias: z.string(),
  ordem: z.number().int().nonnegative(),
});

export const schemaProtocolo = z.object({
  id: z.union([z.literal(""), uuid]).optional(),
  nome: z.string().trim().min(1, "Informe o nome do protocolo.").max(120),
  itens: z.array(schemaItemProtocolo).min(1, "Inclua ao menos uma vacina."),
});

export type ProtocoloInput = z.input<typeof schemaProtocolo>;

export const schemaAplicarLote = z
  .object({
    lote_id: z.string().min(1, "Selecione o lote.").uuid("Lote inválido."),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
    vacina_ids: z.array(uuid).min(1, "Selecione ao menos uma vacina."),
    animal_ids: z.array(uuid).min(1, "Selecione ao menos um animal."),
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
  });

export type AplicarLoteInput = z.input<typeof schemaAplicarLote>;

export function valoresPadraoVacina(): VacinaInput {
  return {
    id: "",
    nome: "",
    intervalo_dias: "",
    observacoes: "",
    ativa: true,
  };
}

export function valoresPadraoAplicarLote(loteId = ""): AplicarLoteInput {
  return {
    lote_id: loteId,
    data: hojeISO(),
    vacina_ids: [],
    animal_ids: [],
    observacoes: "",
  };
}
