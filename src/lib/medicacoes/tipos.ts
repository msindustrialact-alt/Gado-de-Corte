export type ViaMedicamento = "injetavel" | "pour_on" | "oral";

export type Medicamento = {
  id: string;
  nome: string;
  via: ViaMedicamento;
  dose: string | null;
  carencia_dias: number | null;
  ativo: boolean;
};

export type AnimalMedicacao = {
  id: string;
  brinco: string;
  nome: string | null;
};

export type SessaoMedicacao = {
  id: string;
  data: string;
  qtd_aplicados: number | null;
  observacoes: string | null;
  medicamento_nome: string;
  via: ViaMedicamento;
  dose: string | null;
  carencia_dias: number | null;
  lote_nome: string | null;
};

export type HistoricoMedicacao = {
  id: string;
  data: string;
  medicamento_nome: string;
  via: ViaMedicamento;
  dose: string | null;
  carencia_dias: number | null;
};

export type RegistroMedicacao = {
  medicamentoId: string;
  loteId: string;
  data: string;
  animalIds: string[];
  observacoes: string;
  dose: string;
};

export type CadastroMedicamento = {
  nome: string;
  via: ViaMedicamento;
  dose: string;
  carenciaDias: number;
};

export const VIAS_MEDICAMENTO: ViaMedicamento[] = [
  "injetavel",
  "pour_on",
  "oral",
];

export const LABELS_VIA: Record<ViaMedicamento, string> = {
  injetavel: "Injetável",
  pour_on: "Pour-on",
  oral: "Oral",
};

export function textoCarencia(dias: number | null): string {
  if (dias == null) {
    return "Carência não informada";
  }

  if (dias === 0) {
    return "Sem carência";
  }

  return dias === 1 ? "1 dia de carência" : `${dias} dias de carência`;
}

export function dataLiberacao(dataIso: string, dias: number): string {
  const data = new Date(`${dataIso}T00:00:00`);
  data.setDate(data.getDate() + dias);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}
