"use server";

import { revalidatePath } from "next/cache";

import { hojeISO } from "@/lib/animais";
import {
  atualizarMedicamento,
  criarMedicamento,
  getAnimaisMedicacao,
  registrarMedicacao,
  type AnimalMedicacao,
} from "@/lib/medicacoes/data";
import { VIAS_MEDICAMENTO, type ViaMedicamento } from "@/lib/medicacoes/tipos";

export async function listarAnimaisMedicacao(
  loteId: string,
): Promise<AnimalMedicacao[]> {
  return getAnimaisMedicacao(loteId);
}

function validarCadastro(dados: {
  nome: string;
  via: string;
  dose: string;
  carenciaDias: number;
}): { ok: true; via: ViaMedicamento } | { ok: false; message: string } {
  if (dados.nome.trim().length < 2) {
    return { ok: false, message: "Informe o nome do medicamento." };
  }

  if (!VIAS_MEDICAMENTO.includes(dados.via as ViaMedicamento)) {
    return { ok: false, message: "Escolha a via." };
  }

  if (!dados.dose.trim()) {
    return { ok: false, message: "Informe a dose." };
  }

  if (
    !Number.isInteger(dados.carenciaDias) ||
    dados.carenciaDias < 0 ||
    dados.carenciaDias > 3650
  ) {
    return {
      ok: false,
      message: "A carência é o número de dias até o abate. Use 0 se não houver.",
    };
  }

  return { ok: true, via: dados.via as ViaMedicamento };
}

export async function cadastrarMedicamentoAction(dados: {
  nome: string;
  via: string;
  dose: string;
  carenciaDias: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const validado = validarCadastro(dados);

  if (!validado.ok) {
    return validado;
  }

  const resultado = await criarMedicamento({
    nome: dados.nome,
    via: validado.via,
    dose: dados.dose,
    carenciaDias: dados.carenciaDias,
  });

  if (resultado.ok) {
    revalidatePath("/sanidade/medicacoes");
  }

  return resultado;
}

export async function atualizarMedicamentoAction(dados: {
  id: string;
  nome: string;
  via: string;
  dose: string;
  carenciaDias: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const validado = validarCadastro(dados);

  if (!validado.ok) {
    return validado;
  }

  const resultado = await atualizarMedicamento(dados.id, {
    nome: dados.nome,
    via: validado.via,
    dose: dados.dose,
    carenciaDias: dados.carenciaDias,
  });

  if (resultado.ok) {
    revalidatePath("/sanidade/medicacoes");
    revalidatePath("/animais");
  }

  return resultado;
}

export async function registrarMedicacaoAction(dados: {
  medicamentoId: string;
  loteId: string;
  data: string;
  animalIds: string[];
  observacoes: string;
  dose: string;
}): Promise<
  | { ok: true; quantidade: number; ignorados: number }
  | { ok: false; message: string }
> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data) || dados.data > hojeISO()) {
    return { ok: false, message: "Informe uma data válida, até hoje." };
  }

  if (!dados.medicamentoId) {
    return { ok: false, message: "Escolha o medicamento." };
  }

    const resultado = await registrarMedicacao({
      ...dados,
      dose: dados.dose ?? "",
    });

  if (resultado.ok) {
    revalidatePath("/sanidade/medicacoes");
    revalidatePath("/animais");
    revalidatePath("/dashboard");
    for (const id of dados.animalIds) {
      revalidatePath(`/animais/${id}`);
    }
  }

  return resultado;
}
