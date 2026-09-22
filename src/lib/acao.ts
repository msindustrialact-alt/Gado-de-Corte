import type { z } from "zod";

export type ResultadoAcao = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  id?: string;
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

export function falhaValidacao(erro: z.ZodError): ResultadoAcao {
  return {
    ok: false,
    message: "Confira os campos destacados.",
    fieldErrors: errosDoZod(erro),
  };
}

export function textoDoErro(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}): string {
  return [error.message, error.details, error.hint].filter(Boolean).join(" ");
}

export function ehViolacaoUnica(
  error: { code?: string; message?: string; details?: string; hint?: string },
  indice: string,
): boolean {
  return error.code === "23505" && textoDoErro(error).includes(indice);
}

export function ehViolacaoFk(error: { code?: string }): boolean {
  return error.code === "23503";
}

export function vazioParaNulo(valor: unknown): string | null {
  if (valor == null) {
    return null;
  }

  const texto = String(valor).trim();
  return texto.length > 0 ? texto : null;
}
