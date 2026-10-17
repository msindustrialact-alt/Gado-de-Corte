import { hojeISO } from "@/lib/animais";
import { dataLiberacao } from "@/lib/medicacoes/tipos";
import {
  fecharVenda,
  type FormaVendaAbate,
  type LinhaDesconto,
  type LinhaDespesa,
} from "@/lib/receitas/calculo";
import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";

export type AnimalReceita = {
  id: string;
  brinco: string;
  nome: string | null;
  loteId: string | null;
  loteNome: string | null;
  pesoAtual: number | null;
  dataUltimaPesagem: string | null;
  carencias: { medicamento: string; liberacao: string }[];
};

export type LoteReceita = { id: string; nome: string };

export type VendaAbateResumo = {
  id: string;
  data: string;
  compradorNome: string;
  frigorifico: string | null;
  qtdAnimais: number;
  pesoVivoTotal: number;
  valorLiquido: number;
};

export type VendaAbateDetalhe = VendaAbateResumo & {
  compradorDocumento: string | null;
  cidade: string | null;
  observacoes: string | null;
  forma: FormaVendaAbate;
  rendimentoPct: number | null;
  arrobasVivas: number;
  arrobasPagas: number;
  diferencaArrobas: number;
  valorArroba: number;
  valorBruto: number;
  despesasTotal: number;
  cienciaCarencia: boolean;
  animais: {
    id: string;
    animalId: string;
    brinco: string;
    loteNome: string | null;
    pesoKg: number;
    carenciaAte: string | null;
  }[];
  descontos: { descricao: string; arrobas: number }[];
  despesas: { descricao: string; valor: number }[];
};

export type NovaVendaAbate = {
  data: string;
  compradorNome: string;
  compradorDocumento: string;
  frigorifico: string;
  cidade: string;
  observacoes: string;
  forma: FormaVendaAbate;
  rendimentoPct: number | null;
  descontoArrobas: number | null;
  linhasDesconto: LinhaDesconto[];
  arrobasPagas: number | null;
  valorArroba: number;
  despesas: LinhaDespesa[];
  cienciaCarencia: boolean;
  animais: { animalId: string; pesoKg: number }[];
};

type Db = {
  from: (tabela: string) => {
    select: (colunas: string) => DbFiltro;
    insert: (valor: unknown) => unknown;
  };
  rpc: (nome: string, args: unknown) => Promise<{ data: string | null; error: { message: string } | null }>;
};

type DbFiltro = {
  eq: (coluna: string, valor: string) => DbFiltro;
  in: (coluna: string, valores: string[]) => DbFiltro;
  is: (coluna: string, valor: null) => DbFiltro;
  order: (coluna: string, opcoes: { ascending: boolean }) => DbFiltro;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
  then: PromiseLike<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>["then"];
};

function numero(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function numeroOuNulo(valor: unknown): number | null {
  if (valor == null || valor === "") {
    return null;
  }

  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

export async function getAnimaisReceita(): Promise<{
  animais: AnimalReceita[];
  lotes: LoteReceita[];
}> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { animais: [], lotes: [] };
  }

  const supabase = await createClient();
  const [{ data: animais, error }, { data: lotes }, { data: aplicacoes }] = await Promise.all([
    supabase
      .from("animais")
      .select("id, brinco, nome, lote_id, peso_atual, data_ultima_pesagem")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null)
      .order("brinco"),
    supabase
      .from("lotes")
      .select("id, nome")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null)
      .order("nome"),
    supabase
      .from("medicacao_aplicacoes")
      .select("animal_id, data, carencia_dias, medicamento:medicamentos ( nome )")
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null)
      .gt("carencia_dias", 0),
  ]);

  if (error) {
    console.error(error);
    return { animais: [], lotes: [] };
  }

  const nomes = new Map((lotes ?? []).map((lote) => [lote.id, lote.nome ?? "Lote"]));
  const carencias = new Map<string, AnimalReceita["carencias"]>();

  for (const aplicacao of aplicacoes ?? []) {
    if (!aplicacao.animal_id || !aplicacao.data || !aplicacao.carencia_dias) {
      continue;
    }

    const medicamento = Array.isArray(aplicacao.medicamento)
      ? aplicacao.medicamento[0]
      : aplicacao.medicamento;
    const lista = carencias.get(aplicacao.animal_id) ?? [];
    lista.push({
      medicamento: medicamento?.nome ?? "Medicamento",
      liberacao: dataLiberacao(aplicacao.data, aplicacao.carencia_dias),
    });
    carencias.set(aplicacao.animal_id, lista);
  }

  return {
    lotes: (lotes ?? []).flatMap((lote) =>
      lote.id ? [{ id: lote.id, nome: lote.nome ?? "Lote" }] : [],
    ),
    animais: (animais ?? []).map((animal) => ({
      id: animal.id,
      brinco: animal.brinco,
      nome: animal.nome,
      loteId: animal.lote_id,
      loteNome: animal.lote_id ? (nomes.get(animal.lote_id) ?? null) : null,
      pesoAtual: animal.peso_atual,
      dataUltimaPesagem: animal.data_ultima_pesagem,
      carencias: carencias.get(animal.id) ?? [],
    })),
  };
}

export async function getVendasAbate(): Promise<VendaAbateResumo[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("vendas_abate")
    .select("id, data, comprador_nome, frigorifico, qtd_animais, peso_vivo_total, valor_liquido")
    .eq("fazenda_id", fazenda.id)
    .order("data", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((linha: Record<string, unknown>) => ({
    id: String(linha.id),
    data: String(linha.data),
    compradorNome: String(linha.comprador_nome),
    frigorifico: linha.frigorifico ? String(linha.frigorifico) : null,
    qtdAnimais: numero(linha.qtd_animais),
    pesoVivoTotal: numero(linha.peso_vivo_total),
    valorLiquido: numero(linha.valor_liquido),
  }));
}

export async function getVendaAbate(id: string): Promise<VendaAbateDetalhe | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [{ data: venda, error }, { data: animais }, { data: descontos }, { data: despesas }] =
    await Promise.all([
      db
        .from("vendas_abate")
        .select("*")
        .eq("id", id)
        .eq("fazenda_id", fazenda.id)
        .maybeSingle(),
      db
        .from("venda_abate_animais")
        .select("id, animal_id, brinco, lote_nome, peso_kg, carencia_ate")
        .eq("venda_id", id)
        .eq("fazenda_id", fazenda.id)
        .order("brinco"),
      db
        .from("venda_abate_descontos")
        .select("descricao, arrobas")
        .eq("venda_id", id)
        .eq("fazenda_id", fazenda.id),
      db
        .from("venda_abate_despesas")
        .select("descricao, valor")
        .eq("venda_id", id)
        .eq("fazenda_id", fazenda.id),
    ]);

  if (error || !venda) {
    if (error) {
      console.error(error);
    }
    return null;
  }

  const forma = venda.forma as FormaVendaAbate;

  return {
    id: venda.id,
    data: venda.data,
    compradorNome: venda.comprador_nome,
    compradorDocumento: venda.comprador_documento,
    frigorifico: venda.frigorifico,
    cidade: venda.cidade,
    observacoes: venda.observacoes,
    forma,
    qtdAnimais: numero(venda.qtd_animais),
    pesoVivoTotal: numero(venda.peso_vivo_total),
    rendimentoPct: numeroOuNulo(venda.rendimento_pct),
    arrobasVivas: numero(venda.arrobas_vivas),
    arrobasPagas: numero(venda.arrobas_pagas),
    diferencaArrobas: numero(venda.diferenca_arrobas),
    valorArroba: numero(venda.valor_arroba),
    valorBruto: numero(venda.valor_bruto),
    despesasTotal: numero(venda.despesas_total),
    valorLiquido: numero(venda.valor_liquido),
    cienciaCarencia: Boolean(venda.ciencia_carencia),
    animais: (animais ?? []).map((linha: Record<string, unknown>) => ({
      id: String(linha.id),
      animalId: String(linha.animal_id),
      brinco: String(linha.brinco),
      loteNome: linha.lote_nome ? String(linha.lote_nome) : null,
      pesoKg: numero(linha.peso_kg),
      carenciaAte: linha.carencia_ate ? String(linha.carencia_ate) : null,
    })),
    descontos: (descontos ?? []).map((linha: Record<string, unknown>) => ({
      descricao: String(linha.descricao),
      arrobas: numero(linha.arrobas),
    })),
    despesas: (despesas ?? []).map((linha: Record<string, unknown>) => ({
      descricao: String(linha.descricao),
      valor: numero(linha.valor),
    })),
  };
}

export async function getVendaAbateDoAnimal(
  animalId: string,
): Promise<{ id: string; data: string; compradorNome: string } | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("venda_abate_animais")
    .select("venda:vendas_abate ( id, data, comprador_nome )")
    .eq("animal_id", animalId)
    .eq("fazenda_id", fazenda.id)
    .maybeSingle();

  if (error || !data?.venda) {
    return null;
  }

  const venda = Array.isArray(data.venda) ? data.venda[0] : data.venda;

  if (!venda?.id) {
    return null;
  }

  return {
    id: String(venda.id),
    data: String(venda.data),
    compradorNome: String(venda.comprador_nome),
  };
}

export async function registrarVendaAbate(
  entrada: NovaVendaAbate,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (entrada.data > hojeISO()) {
    return { ok: false, message: "A data da saída não pode ser futura." };
  }

  if (entrada.compradorNome.trim().length < 2) {
    return { ok: false, message: "Informe o nome do comprador." };
  }

  const fechamento = fecharVenda({
    pesosKg: entrada.animais.map((animal) => animal.pesoKg),
    forma: entrada.forma,
    rendimentoPct: entrada.rendimentoPct,
    descontoArrobas: entrada.descontoArrobas,
    linhasDesconto: entrada.linhasDesconto,
    arrobasPagas: entrada.arrobasPagas,
    valorArroba: entrada.valorArroba,
    despesas: entrada.despesas,
  });

  if (!fechamento.ok) {
    return fechamento;
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data, error } = await (supabase as unknown as Db).rpc("registrar_venda_abate", {
    p_venda: {
      data: entrada.data,
      comprador_nome: entrada.compradorNome.trim(),
      comprador_documento: entrada.compradorDocumento.trim() || null,
      frigorifico: entrada.frigorifico.trim() || null,
      cidade: entrada.cidade.trim() || null,
      observacoes: entrada.observacoes.trim() || null,
      forma: entrada.forma,
      rendimento_pct: entrada.forma === "rendimento" ? entrada.rendimentoPct : null,
      desconto_arrobas: entrada.forma === "desconto" ? entrada.descontoArrobas : null,
      arrobas_pagas: entrada.forma === "arrobas_pagas" ? entrada.arrobasPagas : null,
      valor_arroba: entrada.valorArroba,
      ciencia_carencia: entrada.cienciaCarencia,
      animais: entrada.animais.map((animal) => ({
        animal_id: animal.animalId,
        peso: animal.pesoKg,
      })),
      descontos: entrada.forma === "desconto" ? entrada.linhasDesconto : [],
      despesas: entrada.despesas,
    },
  });

  if (error || !data) {
    console.error(error);
    const texto = error?.message ?? "";
    const conhecido = [
      "Informe a data da saída",
      "A data da saída não pode ser futura",
      "Escolha a forma de fechamento",
      "Informe o nome do comprador",
      "Informe o valor da @",
      "Marque ao menos um animal",
      "Cada animal precisa de um peso maior que zero",
      "Animal repetido na venda",
      "Algum animal não está ativo nesta fazenda",
      "Algum animal já está em outra venda",
      "Confirme que está ciente da carência",
      "O rendimento é maior que 0 e no máximo 80%",
      "Cada linha de desconto precisa de nome e arrobas maiores que zero",
      "O desconto total tem que ser a soma das linhas",
      "Informe o desconto de @",
      "O desconto não pode passar as @ do peso vivo",
      "Informe as @ pagas",
      "Cada despesa precisa de nome e valor zero ou mais",
      "Não foi possível baixar todos os animais",
    ].find((mensagem) => texto.includes(mensagem));

    return {
      ok: false,
      message: conhecido ?? "Não foi possível gravar a receita.",
    };
  }

  return { ok: true, id: data };
}
