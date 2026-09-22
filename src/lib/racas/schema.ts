import { z } from "zod";

export const schemaRaca = z.object({
  nome: z.string().trim().min(1, "Informe o nome da raça."),
});

export type RacaFormInput = z.input<typeof schemaRaca>;
