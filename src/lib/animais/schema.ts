import { z } from "zod";

import {
  CHIFRES_VALIDOS,
  CATEGORIAS_VALIDAS,
  FASES_VALIDAS,
  MOTIVOS_SAIDA_VALIDOS,
  hojeISO,
  parseNumeroPt,
  type CategoriaAnimal,
  type FaseProdutiva,
  type MotivoSaida,
  type OrigemAnimal,
  type SexoAnimal,
  type StatusAnimal,
  type TipoChifre,
  type PropriedadeAnimal,
} from "@/lib/animais";
import type { TablesInsert, TablesUpdate } from "@/types/database";

function vazioParaNulo(valor: unknown): string | null {
  if (valor == null) {
    return null;
  }

  const texto = String(valor).trim();
  return texto.length > 0 ? texto : null;
}

const STATUS_ENUM = [
  "ativo",
  "vendido",
  "abatido",
  "morto",
  "transferido",
] as const;

const uuidOpcional = z.string().refine((valor) => {
  const texto = valor.trim();
  return texto.length === 0 || z.uuid().safeParse(texto).success;
}, "Seleção inválida.");

const dataOpcional = z.string().refine((valor) => {
  const texto = valor.trim();
  return texto.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(texto);
}, "Informe uma data válida.");

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

export const schemaAnimal = z
  .object({
    id: z.string().optional(),
    brinco: z
      .string()
      .trim()
      .min(1, "Informe o brinco.")
      .max(20, "O brinco deve ter no máximo 20 caracteres."),
    brinco_eletronico: z.string(),
    sisbov: z.string(),
    nome: z.string(),
    sexo: z.string().refine((valor) => valor === "macho" || valor === "femea", {
      message: "Selecione o sexo.",
    }),
    data_nascimento: dataOpcional,
    nascimento_estimado: z.boolean(),
    raca_id: uuidOpcional,
    composicao_racial: z.string(),
    pelagem: z.string(),
    categoria: z.string().refine((valor) => {
      const texto = vazioParaNulo(valor);
      return (
        texto == null || CATEGORIAS_VALIDAS.includes(texto as CategoriaAnimal)
      );
    }, "Categoria inválida."),
    tipo_chifre: z.string().refine((valor) => {
      const texto = vazioParaNulo(valor);
      return texto == null || CHIFRES_VALIDOS.includes(texto as TipoChifre);
    }, "Tipo de chifre inválido."),
    origem: z.enum(["nascido_fazenda", "comprado"]),
    pai_id: uuidOpcional,
    mae_id: uuidOpcional,
    fornecedor: z.string(),
    data_entrada: dataOpcional,
    peso_entrada: z.string(),
    valor_aquisicao: z.string(),
    status: z.enum(STATUS_ENUM),
    fase_produtiva: z.string().refine((valor) => {
      const texto = vazioParaNulo(valor);
      return texto == null || FASES_VALIDAS.includes(texto as FaseProdutiva);
    }, "Fase produtiva inválida."),
    lote_id: uuidOpcional,
    piquete_id: uuidOpcional,
    propriedade: z.string().refine((valor) => valor === "joana" || valor === "catagua", {
      message: "Selecione a fazenda.",
    }),
    peso_atual: z.string(),
    data_ultima_pesagem: dataOpcional,
    escore_corporal: z.string(),
    data_saida: dataOpcional,
    motivo_saida: z.string().refine((valor) => {
      const texto = vazioParaNulo(valor);
      return (
        texto == null || MOTIVOS_SAIDA_VALIDOS.includes(texto as MotivoSaida)
      );
    }, "Motivo de saída inválido."),
    destino: z.string(),
    valor_venda: z.string(),
    peso_saida: z.string(),
    observacoes: z.string(),
  })
  .superRefine((dados, ctx) => {
    const hoje = hojeISO();
    const nascimento = vazioParaNulo(dados.data_nascimento);
    const entrada = vazioParaNulo(dados.data_entrada);
    const pesagem = vazioParaNulo(dados.data_ultima_pesagem);
    const saida = vazioParaNulo(dados.data_saida);
    const motivo = vazioParaNulo(dados.motivo_saida);
    const pai = vazioParaNulo(dados.pai_id);
    const mae = vazioParaNulo(dados.mae_id);
    const id = vazioParaNulo(dados.id);

    const checarDataPassado = (valor: string | null, caminho: string) => {
      if (valor && valor > hoje) {
        ctx.addIssue({
          code: "custom",
          path: [caminho],
          message: "A data não pode ser futura.",
        });
      }
    };

    checarDataPassado(nascimento, "data_nascimento");
    checarDataPassado(entrada, "data_entrada");
    checarDataPassado(pesagem, "data_ultima_pesagem");
    checarDataPassado(saida, "data_saida");

    const checarPeso = (bruto: string, caminho: string) => {
      const numero = numeroDeCampo(bruto, ctx, caminho);

      if (numero == null) {
        return;
      }

      if (numero < 1 || numero > 1500) {
        ctx.addIssue({
          code: "custom",
          path: [caminho],
          message: "O peso deve estar entre 1 e 1.500 kg.",
        });
      }
    };

    const checarValor = (bruto: string, caminho: string) => {
      const numero = numeroDeCampo(bruto, ctx, caminho);

      if (numero == null) {
        return;
      }

      if (numero < 0) {
        ctx.addIssue({
          code: "custom",
          path: [caminho],
          message: "O valor não pode ser negativo.",
        });
      }
    };

    checarPeso(dados.peso_atual, "peso_atual");

    if (dados.origem === "comprado") {
      checarPeso(dados.peso_entrada, "peso_entrada");
      checarValor(dados.valor_aquisicao, "valor_aquisicao");
    }

    if (dados.status !== "ativo") {
      checarPeso(dados.peso_saida, "peso_saida");
      checarValor(dados.valor_venda, "valor_venda");
    }

    const escoreTexto = dados.escore_corporal.trim();

    if (escoreTexto) {
      const escore = Number(escoreTexto.replace(",", "."));

      if (!Number.isInteger(escore) || escore < 1 || escore > 5) {
        ctx.addIssue({
          code: "custom",
          path: ["escore_corporal"],
          message: "O escore corporal deve ser um inteiro de 1 a 5.",
        });
      }
    }

    if (pai && mae && pai === mae) {
      ctx.addIssue({
        code: "custom",
        path: ["mae_id"],
        message: "O pai e a mãe não podem ser o mesmo animal.",
      });
    }

    if (id && pai === id) {
      ctx.addIssue({
        code: "custom",
        path: ["pai_id"],
        message: "O pai não pode ser o próprio animal.",
      });
    }

    if (id && mae === id) {
      ctx.addIssue({
        code: "custom",
        path: ["mae_id"],
        message: "A mãe não pode ser o próprio animal.",
      });
    }

    if (dados.status !== "ativo") {
      if (!saida) {
        ctx.addIssue({
          code: "custom",
          path: ["data_saida"],
          message: "Informe a data de saída.",
        });
      }

      if (!motivo) {
        ctx.addIssue({
          code: "custom",
          path: ["motivo_saida"],
          message: "Informe o motivo da saída.",
        });
      }
    }

    if (saida && nascimento && saida < nascimento) {
      ctx.addIssue({
        code: "custom",
        path: ["data_saida"],
        message: "A saída não pode ser anterior ao nascimento.",
      });
    }

    if (saida && entrada && saida < entrada) {
      ctx.addIssue({
        code: "custom",
        path: ["data_saida"],
        message: "A saída não pode ser anterior à data de entrada.",
      });
    }
  });

export type AnimalFormInput = z.input<typeof schemaAnimal>;
export type AnimalFormValores = z.output<typeof schemaAnimal>;

export const VALORES_PADRAO_ANIMAL: AnimalFormInput = {
  brinco: "",
  brinco_eletronico: "",
  sisbov: "",
  nome: "",
  sexo: "",
  data_nascimento: "",
  nascimento_estimado: false,
  raca_id: "",
  composicao_racial: "",
  pelagem: "",
  categoria: "",
  tipo_chifre: "",
  origem: "nascido_fazenda",
  pai_id: "",
  mae_id: "",
  fornecedor: "",
  data_entrada: "",
  peso_entrada: "",
  valor_aquisicao: "",
  status: "ativo",
  fase_produtiva: "",
  lote_id: "",
  piquete_id: "",
  propriedade: "",
  peso_atual: "",
  data_ultima_pesagem: "",
  escore_corporal: "",
  data_saida: "",
  motivo_saida: "",
  destino: "",
  valor_venda: "",
  peso_saida: "",
  observacoes: "",
};

export function errosDoZod(erro: z.ZodError): Record<string, string[]> {
  const campos: Record<string, string[]> = {};

  for (const issue of erro.issues) {
    const chave = String(issue.path[0] ?? "root");
    campos[chave] ??= [];
    campos[chave].push(issue.message);
  }

  return campos;
}

export function paraRegistroAnimal(
  dados: AnimalFormValores,
): Omit<
  TablesInsert<"animais">,
  "fazenda_id" | "created_at" | "created_by" | "deleted_at" | "id" | "updated_at"
> {
  const comprado = dados.origem === "comprado";
  const saida = dados.status !== "ativo";
  const escore = parseNumeroPt(dados.escore_corporal);

  return {
    brinco: dados.brinco,
    brinco_eletronico: vazioParaNulo(dados.brinco_eletronico),
    sisbov: vazioParaNulo(dados.sisbov),
    nome: vazioParaNulo(dados.nome),
    sexo: dados.sexo as SexoAnimal,
    data_nascimento: vazioParaNulo(dados.data_nascimento),
    nascimento_estimado: dados.nascimento_estimado,
    raca_id: vazioParaNulo(dados.raca_id),
    composicao_racial: vazioParaNulo(dados.composicao_racial),
    pelagem: vazioParaNulo(dados.pelagem),
    categoria: (vazioParaNulo(dados.categoria) as CategoriaAnimal | null) ?? null,
    tipo_chifre: (vazioParaNulo(dados.tipo_chifre) as TipoChifre | null) ?? null,
    origem: dados.origem as OrigemAnimal,
    pai_id: vazioParaNulo(dados.pai_id),
    mae_id: vazioParaNulo(dados.mae_id),
    fornecedor: comprado ? vazioParaNulo(dados.fornecedor) : null,
    data_entrada: comprado ? vazioParaNulo(dados.data_entrada) : null,
    peso_entrada: comprado ? parseNumeroPt(dados.peso_entrada) : null,
    valor_aquisicao: comprado ? parseNumeroPt(dados.valor_aquisicao) : null,
    status: dados.status as StatusAnimal,
    fase_produtiva:
      (vazioParaNulo(dados.fase_produtiva) as FaseProdutiva | null) ?? null,
    lote_id: vazioParaNulo(dados.lote_id),
    piquete_id: vazioParaNulo(dados.piquete_id),
    propriedade: dados.propriedade as PropriedadeAnimal,
    peso_atual: parseNumeroPt(dados.peso_atual),
    data_ultima_pesagem: vazioParaNulo(dados.data_ultima_pesagem),
    escore_corporal: escore == null ? null : Math.round(escore),
    data_saida: saida ? vazioParaNulo(dados.data_saida) : null,
    motivo_saida: saida
      ? ((vazioParaNulo(dados.motivo_saida) as MotivoSaida | null) ?? null)
      : null,
    destino: saida ? vazioParaNulo(dados.destino) : null,
    valor_venda: saida ? parseNumeroPt(dados.valor_venda) : null,
    peso_saida: saida ? parseNumeroPt(dados.peso_saida) : null,
    observacoes: vazioParaNulo(dados.observacoes),
  };
}

export function paraAtualizacaoAnimal(
  dados: AnimalFormValores,
): TablesUpdate<"animais"> {
  return paraRegistroAnimal(dados);
}
