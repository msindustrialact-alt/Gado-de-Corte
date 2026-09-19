import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export function formatarInteiro(valor: number) {
  return valor.toLocaleString("pt-BR");
}

export function formatarDecimal(valor: number, casas = 2) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(valor: string | Date | null | undefined) {
  if (!valor) {
    return "—";
  }

  const data =
    valor instanceof Date
      ? valor
      : new Date(valor.includes("T") ? valor : `${valor}T00:00:00`);

  if (Number.isNaN(data.getTime())) {
    return "—";
  }

  return format(data, "dd/MM/yyyy");
}

export function formatarDiaMes(data: Date) {
  return format(data, "dd/MM");
}

export function formatarDiaMesExtenso(data: Date) {
  const mes = format(data, "MMM", { locale: ptBR })
    .replace(".", "")
    .slice(0, 3)
    .toUpperCase();

  return {
    dia: format(data, "dd"),
    mes,
  };
}
