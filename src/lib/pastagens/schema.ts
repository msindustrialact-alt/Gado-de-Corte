import { z } from "zod";

import { vazioParaNulo } from "@/lib/acao";
import { parseNumeroPt } from "@/lib/animais";
import {
  STATUS_PIQUETE,
  type StatusPiquete,
} from "@/lib/pastagens";
import type { TablesInsert, TablesUpdate } from "@/types/database";

function numeroDeCampo(
  valor: string,
  ctx: z.RefinementCtx,
  caminho: string,
): number | null {
  const texto = valor.trim();

  if (!texto) {
    return null;
  }

  const numero = parseNumeroPt(texto);

  if (numero == null) {
    ctx.addIssue({
      code: "custom",
      path: [caminho],
      message: "Informe um número válido.",
    });
    return null;
  }

  return numero;
}

export const schemaPiquete = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome."),
    area_ha: z.string(),
    tipo_pastagem: z.string(),
    capacidade_ua: z.string(),
    status: z.enum(["ativo", "em_descanso", "em_reforma", "inativo"]),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    if (!STATUS_PIQUETE.includes(dados.status as StatusPiquete)) {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: "Status inválido.",
      });
    }

    const area = numeroDeCampo(dados.area_ha, ctx, "area_ha");

    if (area == null) {
      ctx.addIssue({
        code: "custom",
        path: ["area_ha"],
        message: "Informe a área em hectares.",
      });
    } else if (area <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["area_ha"],
        message: "A área deve ser maior que zero.",
      });
    }

    const capacidade = numeroDeCampo(dados.capacidade_ua, ctx, "capacidade_ua");

    if (capacidade != null && capacidade < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["capacidade_ua"],
        message: "A capacidade não pode ser negativa.",
      });
    }
  });

export type PiqueteFormInput = z.input<typeof schemaPiquete>;

export const VALORES_PADRAO_PIQUETE: PiqueteFormInput = {
  nome: "",
  area_ha: "",
  tipo_pastagem: "",
  capacidade_ua: "",
  status: "ativo",
  observacoes: "",
};

export function paraRegistroPiquete(dados: PiqueteFormInput): Pick<
  TablesInsert<"piquetes">,
  | "nome"
  | "area_ha"
  | "tipo_pastagem"
  | "capacidade_ua"
  | "status"
  | "observacoes"
> {
  return {
    nome: dados.nome.trim(),
    area_ha: parseNumeroPt(dados.area_ha),
    tipo_pastagem: vazioParaNulo(dados.tipo_pastagem),
    capacidade_ua: parseNumeroPt(dados.capacidade_ua),
    status: dados.status as StatusPiquete,
    observacoes: vazioParaNulo(dados.observacoes),
  };
}

export function paraAtualizacaoPiquete(
  dados: PiqueteFormInput,
): Pick<
  TablesUpdate<"piquetes">,
  | "nome"
  | "area_ha"
  | "tipo_pastagem"
  | "capacidade_ua"
  | "status"
  | "observacoes"
> {
  return paraRegistroPiquete(dados);
}
