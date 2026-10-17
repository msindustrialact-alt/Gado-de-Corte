import { ratearMl } from "@/lib/custos-periodo/calculo";
import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";

import type {
  AnimalMedicacao,
  CadastroMedicamento,
  HistoricoMedicacao,
  Medicamento,
  RegistroMedicacao,
  SessaoMedicacao,
  ViaMedicamento,
} from "@/lib/medicacoes/tipos";

export type {
  AnimalMedicacao,
  CadastroMedicamento,
  HistoricoMedicacao,
  Medicamento,
  RegistroMedicacao,
  SessaoMedicacao,
  ViaMedicamento,
} from "@/lib/medicacoes/tipos";
export { LABELS_VIA } from "@/lib/medicacoes/tipos";

function viaDe(valor: string): ViaMedicamento {
  if (valor === "pour_on" || valor === "oral") {
    return valor;
  }

  return "injetavel";
}

async function exigirFazenda() {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  return fazenda;
}

export async function getMedicamentos(): Promise<Medicamento[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicamentos")
    .select("id, nome, via, dose, carencia_dias, produto_id, ativo")
    .eq("fazenda_id", fazenda.id)
    .eq("ativo", true)
    .is("deleted_at", null)
    .order("nome");

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os medicamentos.");
  }

  return (data ?? []).map((item) => ({
      id: item.id,
      nome: item.nome,
      via: viaDe(item.via),
      dose: item.dose,
      carencia_dias: item.carencia_dias,
      produto_id: item.produto_id,
      ativo: item.ativo,
  }));
}

export async function getSessoesMedicacao(): Promise<SessaoMedicacao[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicacao_sessoes")
    .select(
      "id, data, lote_id, qtd_aplicados, observacoes, dose, carencia_dias, medicamento:medicamentos ( nome, via, dose, carencia_dias ), lote:lotes ( nome )",
    )
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar as medicações.");
  }

  return (data ?? []).map((linha) => {
    const medicamento = Array.isArray(linha.medicamento)
      ? linha.medicamento[0]
      : linha.medicamento;
    const lote = Array.isArray(linha.lote) ? linha.lote[0] : linha.lote;

    return {
      id: linha.id,
      data: linha.data,
      qtd_aplicados: linha.qtd_aplicados,
      observacoes: linha.observacoes,
      medicamento_nome: medicamento?.nome ?? "Medicamento",
      via: viaDe(medicamento?.via ?? "injetavel"),
      dose: linha.dose ?? medicamento?.dose ?? null,
      carencia_dias: linha.carencia_dias ?? medicamento?.carencia_dias ?? null,
      lote_id: linha.lote_id,
      lote_nome: lote?.nome ?? null,
    };
  });
}

export async function getAnimaisMedicacao(
  loteId: string,
): Promise<AnimalMedicacao[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  let consulta = supabase
    .from("animais")
    .select("id, brinco, nome, lote_id")
    .eq("fazenda_id", fazenda.id)
    .eq("status", "ativo")
    .is("deleted_at", null)
    .order("brinco");

  if (loteId) {
    consulta = consulta.eq("lote_id", loteId);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os animais.");
  }

  return data ?? [];
}

export async function getHistoricoAnimalMedicacoes(
  animalId: string,
): Promise<HistoricoMedicacao[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicacao_aplicacoes")
    .select(
      "id, data, dose, carencia_dias, medicamento:medicamentos ( nome, via, dose, carencia_dias )",
    )
    .eq("fazenda_id", fazenda.id)
    .eq("animal_id", animalId)
    .is("deleted_at", null)
    .order("data", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar as medicações do animal.");
  }

  return (data ?? []).map((linha) => {
    const medicamento = Array.isArray(linha.medicamento)
      ? linha.medicamento[0]
      : linha.medicamento;

    return {
      id: linha.id,
      data: linha.data,
      medicamento_nome: medicamento?.nome ?? "Medicamento",
      via: viaDe(medicamento?.via ?? "injetavel"),
      dose: linha.dose ?? medicamento?.dose ?? null,
      carencia_dias: linha.carencia_dias ?? medicamento?.carencia_dias ?? null,
    };
  });
}

export async function registrarMedicacao(
  input: RegistroMedicacao,
): Promise<
  | { ok: true; quantidade: number; ignorados: number }
  | { ok: false; message: string }
> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const animalIds = [...new Set(input.animalIds)];

  if (animalIds.length === 0) {
    return { ok: false, message: "Deixe ao menos um animal no manejo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medicamento } = await supabase
    .from("medicamentos")
    .select("id, dose, carencia_dias, produto_id")
    .eq("id", input.medicamentoId)
    .eq("fazenda_id", fazenda.id)
    .eq("ativo", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!medicamento) {
    return { ok: false, message: "Medicamento inválido." };
  }

  const animaisValidos = await getAnimaisMedicacao(input.loteId);
  const idsValidos = new Set(animaisValidos.map((animal) => animal.id));
  const escolhidos = animalIds.filter((id) => idsValidos.has(id));

  if (escolhidos.length === 0) {
    return { ok: false, message: "Nenhum animal válido ficou no manejo." };
  }

  const { data: jaFeitos } = await supabase
    .from("medicacao_aplicacoes")
    .select("animal_id")
    .eq("fazenda_id", fazenda.id)
    .eq("medicamento_id", input.medicamentoId)
    .eq("data", input.data)
    .in("animal_id", escolhidos)
    .is("deleted_at", null);

  const repetidos = new Set((jaFeitos ?? []).map((linha) => linha.animal_id));
  const novos = escolhidos.filter((id) => !repetidos.has(id));

  if (novos.length === 0) {
    return {
      ok: false,
      message: "Esses animais já têm esse medicamento nesta data.",
    };
  }

  const loteId = input.loteId || null;
  const dose = input.dose.trim() || medicamento.dose;
  const carenciaDias = medicamento.carencia_dias;
  const baixa = await prepararBaixaMl(input.mlTotal, medicamento.produto_id, novos);

  if (baixa && !baixa.ok) {
    return baixa;
  }
  const { data: sessao, error: erroSessao } = await supabase
    .from("medicacao_sessoes")
    .insert({
      fazenda_id: fazenda.id,
      medicamento_id: input.medicamentoId,
      lote_id: loteId,
      data: input.data,
      qtd_aplicados: novos.length,
      observacoes: input.observacoes.trim() || null,
      dose,
      carencia_dias: carenciaDias,
      ml_total: baixa && baixa.ok ? baixa.mlTotal : null,
      custo_total: baixa && baixa.ok ? baixa.custoTotal : null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (erroSessao || !sessao) {
    console.error(erroSessao);
    return { ok: false, message: "Não foi possível registrar a medicação." };
  }

  const { error: erroAplicacoes } = await supabase
    .from("medicacao_aplicacoes")
    .insert(
      novos.map((animalId) => ({
        fazenda_id: fazenda.id,
        sessao_id: sessao.id,
        animal_id: animalId,
        medicamento_id: input.medicamentoId,
        lote_id: loteId,
        data: input.data,
        dose,
        carencia_dias: carenciaDias,
      })),
    );

  if (erroAplicacoes) {
    console.error(erroAplicacoes);
    await supabase
      .from("medicacao_sessoes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", sessao.id);
    return { ok: false, message: "Não foi possível gravar os animais." };
  }

  if (baixa && baixa.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: erroSaida } = await (supabase as any).rpc("registrar_saida_ml", {
      p_produto_id: baixa.produtoId,
      p_data: input.data,
      p_observacoes: input.observacoes.trim() || null,
      p_partes: baixa.partes,
    });

    if (erroSaida) {
      console.error(erroSaida);
      await supabase
        .from("medicacao_aplicacoes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("sessao_id", sessao.id);
      await supabase
        .from("medicacao_sessoes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", sessao.id);
      const texto = String(erroSaida.message ?? "");
      return {
        ok: false,
        message: texto.includes("Estoque insuficiente")
          ? texto.replace("Estoque insuficiente", "Estoque insuficiente")
          : "Não foi possível baixar os mL do estoque.",
      };
    }
  }

  return { ok: true, quantidade: novos.length, ignorados: repetidos.size };
}

async function prepararBaixaMl(
  mlTotal: number | null,
  produtoId: string | null,
  animalIds: string[],
): Promise<
  | { ok: true; produtoId: string; mlTotal: number; custoTotal: number; partes: unknown[] }
  | { ok: false; message: string }
  | null
> {
  if (mlTotal == null) {
    return null;
  }

  if (!produtoId) {
    return {
      ok: false,
      message: "Vincule um produto em mL neste medicamento antes de informar a saída.",
    };
  }

  const supabase = await createClient();
  const { data: produto } = await supabase
    .from("produtos")
    .select("id, unidade, custo_medio, estoque_atual, ativo")
    .eq("id", produtoId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!produto || !produto.ativo || produto.unidade.trim().toLowerCase() !== "ml") {
    return { ok: false, message: "O produto vinculado precisa estar ativo e na unidade mL." };
  }

  if (Number(produto.estoque_atual) < mlTotal) {
    return {
      ok: false,
      message: `Estoque insuficiente (disponível: ${produto.estoque_atual} mL).`,
    };
  }

  const animais = await getAnimaisMedicacao("");
  const contagem = new Map<string | null, number>();

  for (const id of animalIds) {
    const lote = animais.find((animal) => animal.id === id)?.lote_id ?? null;
    contagem.set(lote, (contagem.get(lote) ?? 0) + 1);
  }

  const partes = ratearMl(
    mlTotal,
    Number(produto.custo_medio),
    [...contagem.entries()].map(([loteId, cabecas]) => ({ loteId, cabecas })),
  );

  return {
    ok: true,
    produtoId,
    mlTotal,
    custoTotal: partes.reduce((total, parte) => total + parte.custo, 0),
    partes: partes.map((parte) => ({
      lote_id: parte.loteId,
      cabecas: parte.cabecas,
      ml: parte.ml,
      custo: parte.custo,
    })),
  };
}

async function nomeEmUso(nome: string, ignorarId?: string) {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicamentos")
    .select("id, nome")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    throw new Error("Não foi possível conferir os medicamentos.");
  }

  const alvo = nome.trim().toLocaleLowerCase("pt-BR");
  return (data ?? []).some(
    (item) =>
      item.id !== ignorarId && item.nome.trim().toLocaleLowerCase("pt-BR") === alvo,
  );
}

export async function criarMedicamento(
  input: CadastroMedicamento,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  if (await nomeEmUso(input.nome)) {
    return { ok: false, message: "Já existe um medicamento com esse nome." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("medicamentos").insert({
    fazenda_id: fazenda.id,
    nome: input.nome.trim(),
    via: input.via,
    dose: input.dose.trim(),
    carencia_dias: input.carenciaDias,
    produto_id: input.produtoId,
    created_by: user?.id ?? null,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível cadastrar o medicamento." };
  }

  return { ok: true };
}

export async function atualizarMedicamento(
  id: string,
  input: CadastroMedicamento,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  if (await nomeEmUso(input.nome, id)) {
    return { ok: false, message: "Já existe um medicamento com esse nome." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicamentos")
    .update({
      nome: input.nome.trim(),
      via: input.via,
      dose: input.dose.trim(),
      carencia_dias: input.carenciaDias,
      produto_id: input.produtoId,
    })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível salvar o medicamento." };
  }

  if (!data || data.length === 0) {
    return { ok: false, message: "Medicamento não encontrado." };
  }

  return { ok: true };
}
