import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";
import { hojeISO } from "@/lib/animais";
import {
  avaliarStatusAnimal,
  type AvaliacaoVacinaAnimal,
  type ItemProtocoloVacina,
  type RealizacaoVacina,
  type StatusVacinaAnimal,
} from "@/lib/vacinas";
import type { AplicarLoteInput, ProtocoloInput, VacinaInput } from "@/lib/vacinas/schema";
import {
  NOME_PROTOCOLO_PADRAO_RJ,
  VACINAS_PROTOCOLO_PADRAO_RJ,
} from "@/lib/vacinas/protocolo-padrao-rj";
import { textoDoErro } from "@/lib/acao";
import { parseNumeroPt } from "@/lib/animais";

export type Vacina = {
  id: string;
  nome: string;
  intervalo_dias: number | null;
  ativa: boolean;
  observacoes: string | null;
};

export type ProtocoloComItens = {
  id: string;
  nome: string;
  ativo: boolean;
  itens: Array<{
    id: string;
    vacina_id: string;
    vacina_nome: string;
    intervalo_dias: number | null;
    obrigatoria: boolean;
    idade_minima_dias: number | null;
    ordem: number;
  }>;
};

export type AnimalVacinaRow = {
  id: string;
  brinco: string;
  nome: string | null;
  data_nascimento: string | null;
  lote_id: string | null;
};

export type SessaoResumo = {
  id: string;
  data: string;
  lote_id: string;
  lote_nome: string;
  qtd_animais_lote: number | null;
  qtd_aplicados: number | null;
};

type Resultado =
  | { ok: true; id?: string; message?: string }
  | { ok: false; message: string };

async function exigirFazenda() {
  const fazenda = await getFazendaAtiva();
  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }
  return fazenda;
}

export async function getVacinas(somenteAtivas = false): Promise<Vacina[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  let consulta = supabase
    .from("vacinas")
    .select("id, nome, intervalo_dias, ativa, observacoes")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("nome");

  if (somenteAtivas) {
    consulta = consulta.eq("ativa", true);
  }

  const { data, error } = await consulta;
  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar as vacinas.");
  }

  return (data ?? []) as Vacina[];
}

export async function upsertVacina(input: VacinaInput): Promise<Resultado> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const intervalo =
    input.intervalo_dias.trim() === ""
      ? null
      : parseNumeroPt(input.intervalo_dias);

  if (input.intervalo_dias.trim() && (intervalo == null || intervalo <= 0)) {
    return { ok: false, message: "Intervalo em dias inválido." };
  }

  const payload = {
    fazenda_id: fazenda.id,
    nome: input.nome.trim(),
    intervalo_dias: intervalo,
    observacoes: input.observacoes.trim() || null,
    ativa: input.ativa ?? true,
    deleted_at: null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("vacinas")
      .update(payload)
      .eq("id", input.id)
      .eq("fazenda_id", fazenda.id);
    if (error) {
      return { ok: false, message: textoDoErro(error) };
    }
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase
    .from("vacinas")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: textoDoErro(error) };
  }

  return { ok: true, id: data.id };
}

export async function arquivarVacina(id: string): Promise<Resultado> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const { error } = await supabase
    .from("vacinas")
    .update({
      ativa: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id);

  if (error) {
    return { ok: false, message: textoDoErro(error) };
  }
  return { ok: true };
}

export async function getProtocoloAtivo(): Promise<ProtocoloComItens | null> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  const { data: protocolo, error } = await supabase
    .from("protocolos_vacina")
    .select("id, nome, ativo")
    .eq("fazenda_id", fazenda.id)
    .eq("ativo", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar o protocolo.");
  }

  if (!protocolo) {
    return null;
  }

  const { data: itens, error: erroItens } = await supabase
    .from("protocolo_vacinas")
    .select(
      "id, vacina_id, obrigatoria, idade_minima_dias, ordem, vacina:vacinas ( id, nome, intervalo_dias )",
    )
    .eq("protocolo_id", protocolo.id)
    .is("deleted_at", null)
    .order("ordem");

  if (erroItens) {
    console.error(erroItens);
    throw new Error("Não foi possível carregar os itens do protocolo.");
  }

  return {
    id: protocolo.id,
    nome: protocolo.nome,
    ativo: protocolo.ativo,
    itens: (itens ?? []).map((item) => {
      const vacina = Array.isArray(item.vacina) ? item.vacina[0] : item.vacina;
      return {
        id: item.id,
        vacina_id: item.vacina_id,
        vacina_nome: vacina?.nome ?? "Vacina",
        intervalo_dias: vacina?.intervalo_dias ?? null,
        obrigatoria: item.obrigatoria,
        idade_minima_dias: item.idade_minima_dias,
        ordem: item.ordem,
      };
    }),
  };
}

export async function salvarProtocolo(input: ProtocoloInput): Promise<Resultado> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  let protocoloId = input.id || null;

  if (protocoloId) {
    const { error } = await supabase
      .from("protocolos_vacina")
      .update({
        nome: input.nome.trim(),
        ativo: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", protocoloId)
      .eq("fazenda_id", fazenda.id);

    if (error) {
      return { ok: false, message: textoDoErro(error) };
    }
  } else {
    await supabase
      .from("protocolos_vacina")
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .eq("fazenda_id", fazenda.id)
      .eq("ativo", true)
      .is("deleted_at", null);

    const { data, error } = await supabase
      .from("protocolos_vacina")
      .insert({
        fazenda_id: fazenda.id,
        nome: input.nome.trim(),
        ativo: true,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, message: textoDoErro(error) };
    }
    protocoloId = data.id;
  }

  const { data: existentes } = await supabase
    .from("protocolo_vacinas")
    .select("id")
    .eq("protocolo_id", protocoloId)
    .is("deleted_at", null);

  if ((existentes ?? []).length > 0) {
    await supabase
      .from("protocolo_vacinas")
      .update({ deleted_at: new Date().toISOString() })
      .eq("protocolo_id", protocoloId)
      .is("deleted_at", null);
  }

  const linhas = input.itens.map((item, indice) => {
    const idade =
      item.idade_minima_dias.trim() === ""
        ? null
        : parseNumeroPt(item.idade_minima_dias);

    return {
      protocolo_id: protocoloId!,
      vacina_id: item.vacina_id,
      obrigatoria: item.obrigatoria,
      idade_minima_dias: idade,
      ordem: item.ordem ?? indice,
      deleted_at: null,
    };
  });

  const { error: erroItens } = await supabase.from("protocolo_vacinas").insert(linhas);
  if (erroItens) {
    return { ok: false, message: textoDoErro(erroItens) };
  }

  return { ok: true, id: protocoloId ?? undefined };
}

/** Cria/atualiza catálogo + protocolo ativo com o padrão RJ. */
export async function aplicarProtocoloPadraoRj(): Promise<Resultado> {
  const existentes = await getVacinas(false);

  const aliasNome = (nome: string) => {
    const n = nome.trim().toLowerCase();
    if (n === "raiva" || n === "raiva dos herbívoros") {
      return "raiva";
    }
    if (n.includes("brucelose")) return "brucelose";
    if (n.includes("clostridio")) return "clostridioses";
    if (n.includes("ibr") || n.includes("bvd")) return "ibr_bvd";
    if (n.includes("lepto")) return "leptospirose";
    return n;
  };

  const porAlias = new Map<string, Vacina>();
  for (const vacina of existentes) {
    porAlias.set(aliasNome(vacina.nome), vacina);
  }

  const itens: ProtocoloInput["itens"] = [];

  for (const padrao of VACINAS_PROTOCOLO_PADRAO_RJ) {
    const chave = aliasNome(padrao.nome);
    const atual = porAlias.get(chave);

    const resultado = await upsertVacina({
      id: atual?.id ?? "",
      nome: padrao.nome,
      intervalo_dias:
        padrao.intervalo_dias != null ? String(padrao.intervalo_dias) : "",
      observacoes: padrao.observacoes,
      ativa: true,
    });

    if (!resultado.ok || !resultado.id) {
      return {
        ok: false,
        message: resultado.ok
          ? "Falha ao gravar vacina do protocolo."
          : resultado.message,
      };
    }

    porAlias.set(chave, {
      id: resultado.id,
      nome: padrao.nome,
      intervalo_dias: padrao.intervalo_dias,
      ativa: true,
      observacoes: padrao.observacoes,
    });

    itens.push({
      vacina_id: resultado.id,
      obrigatoria: padrao.obrigatoria,
      idade_minima_dias:
        padrao.idade_minima_dias != null
          ? String(padrao.idade_minima_dias)
          : "",
      ordem: padrao.ordem,
    });
  }

  const protocoloAtivo = await getProtocoloAtivo();

  return salvarProtocolo({
    id: protocoloAtivo?.id ?? "",
    nome: NOME_PROTOCOLO_PADRAO_RJ,
    itens,
  });
}

export async function getAnimaisAtivosDoLote(
  loteId: string,
): Promise<AnimalVacinaRow[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("animais")
    .select("id, brinco, nome, data_nascimento, lote_id")
    .eq("fazenda_id", fazenda.id)
    .eq("lote_id", loteId)
    .eq("status", "ativo")
    .is("deleted_at", null)
    .order("brinco");

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os animais do lote.");
  }

  return (data ?? []) as AnimalVacinaRow[];
}

export async function criarSessaoVacinacao(
  input: AplicarLoteInput,
): Promise<Resultado> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  const animais = await getAnimaisAtivosDoLote(input.lote_id);
  const idsValidos = new Set(animais.map((a) => a.id));
  const animalIds = input.animal_ids.filter((id) => idsValidos.has(id));

  if (animalIds.length === 0) {
    return { ok: false, message: "Nenhum animal válido selecionado." };
  }

  const { data: sessao, error } = await supabase
    .from("vacinacao_sessoes")
    .insert({
      fazenda_id: fazenda.id,
      lote_id: input.lote_id,
      data: input.data,
      qtd_animais_lote: animais.length,
      qtd_aplicados: animalIds.length,
      observacoes: input.observacoes.trim() || null,
    })
    .select("id")
    .single();

  if (error || !sessao) {
    return { ok: false, message: textoDoErro(error ?? { message: "Falha ao criar sessão." }) };
  }

  const aplicacoes = animalIds.flatMap((animalId) =>
    input.vacina_ids.map((vacinaId) => ({
      fazenda_id: fazenda.id,
      sessao_id: sessao.id,
      animal_id: animalId,
      vacina_id: vacinaId,
      lote_id: input.lote_id,
      data: input.data,
    })),
  );

  const { error: erroApp } = await supabase
    .from("vacinacao_aplicacoes")
    .insert(aplicacoes);

  if (erroApp) {
    await supabase
      .from("vacinacao_sessoes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", sessao.id);
    return { ok: false, message: textoDoErro(erroApp) };
  }

  return { ok: true, id: sessao.id, message: "Vacinação registrada." };
}

function itensDoProtocolo(protocolo: ProtocoloComItens | null): ItemProtocoloVacina[] {
  if (!protocolo) return [];
  return protocolo.itens.map((item) => ({
    vacina_id: item.vacina_id,
    vacina_nome: item.vacina_nome,
    obrigatoria: item.obrigatoria,
    idade_minima_dias: item.idade_minima_dias,
    intervalo_dias: item.intervalo_dias,
  }));
}

export async function getStatusRebanho() {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const protocolo = await getProtocoloAtivo();
  const itens = itensDoProtocolo(protocolo);
  const hoje = hojeISO();

  const [{ data: animais }, { data: realizacoes }, { data: lotes }] =
    await Promise.all([
      supabase
        .from("animais")
        .select("id, brinco, nome, data_nascimento, lote_id")
        .eq("fazenda_id", fazenda.id)
        .eq("status", "ativo")
        .is("deleted_at", null),
      supabase
        .from("vacinacao_aplicacoes")
        .select("animal_id, vacina_id, data")
        .eq("fazenda_id", fazenda.id)
        .is("deleted_at", null),
      supabase
        .from("lotes")
        .select("id, nome")
        .eq("fazenda_id", fazenda.id)
        .eq("status", "ativo")
        .is("deleted_at", null),
    ]);

  const porAnimalRealizacoes = new Map<string, RealizacaoVacina[]>();
  for (const linha of realizacoes ?? []) {
    const lista = porAnimalRealizacoes.get(linha.animal_id) ?? [];
    lista.push({ vacina_id: linha.vacina_id, data: linha.data });
    porAnimalRealizacoes.set(linha.animal_id, lista);
  }

  const nomesLote = new Map((lotes ?? []).map((l) => [l.id, l.nome]));

  const porAnimal = (animais ?? []).map((animal) => {
    const avaliacao = avaliarStatusAnimal({
      hoje,
      dataNascimento: animal.data_nascimento,
      itensProtocolo: itens,
      realizacoes: porAnimalRealizacoes.get(animal.id) ?? [],
    });

    return {
      animal_id: animal.id,
      brinco: animal.brinco,
      nome: animal.nome,
      lote_id: animal.lote_id,
      lote_nome: animal.lote_id ? (nomesLote.get(animal.lote_id) ?? "Lote") : "Sem lote",
      avaliacao,
    };
  });

  const contagem: Record<StatusVacinaAnimal, number> = {
    em_dia: 0,
    incompleto: 0,
    atrasado: 0,
    sem_protocolo: 0,
    indefinido: 0,
  };

  for (const item of porAnimal) {
    contagem[item.avaliacao.status] += 1;
  }

  const porLoteMap = new Map<
    string,
    {
      lote_id: string;
      lote_nome: string;
      qtd_em_dia: number;
      qtd_incompleto: number;
      qtd_atrasado: number;
      qtd_indefinido: number;
      qtd_total: number;
    }
  >();

  for (const item of porAnimal) {
    if (!item.lote_id) continue;
    const atual = porLoteMap.get(item.lote_id) ?? {
      lote_id: item.lote_id,
      lote_nome: item.lote_nome,
      qtd_em_dia: 0,
      qtd_incompleto: 0,
      qtd_atrasado: 0,
      qtd_indefinido: 0,
      qtd_total: 0,
    };
    atual.qtd_total += 1;
    if (item.avaliacao.status === "em_dia") atual.qtd_em_dia += 1;
    if (item.avaliacao.status === "incompleto") atual.qtd_incompleto += 1;
    if (item.avaliacao.status === "atrasado") atual.qtd_atrasado += 1;
    if (item.avaliacao.status === "indefinido") atual.qtd_indefinido += 1;
    porLoteMap.set(item.lote_id, atual);
  }

  const porLote = [...porLoteMap.values()].map((lote) => ({
    ...lote,
    status:
      lote.qtd_total > 0 && lote.qtd_em_dia === lote.qtd_total
        ? ("em_dia" as const)
        : ("pendente" as const),
  }));

  const inicioMes = `${hoje.slice(0, 7)}-01`;
  const { count: sessoesMes } = await supabase
    .from("vacinacao_sessoes")
    .select("id", { count: "exact", head: true })
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .gte("data", inicioMes);

  return {
    protocolo,
    porAnimal,
    porLote,
    kpis: {
      em_dia: contagem.em_dia,
      incompleto: contagem.incompleto,
      atrasado: contagem.atrasado,
      indefinido: contagem.indefinido,
      sessoes_mes: sessoesMes ?? 0,
    },
  };
}

export async function getAvaliacaoAnimal(
  animalId: string,
): Promise<AvaliacaoVacinaAnimal> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();
  const protocolo = await getProtocoloAtivo();

  const [{ data: animal }, { data: realizacoes }] = await Promise.all([
    supabase
      .from("animais")
      .select("id, data_nascimento")
      .eq("id", animalId)
      .eq("fazenda_id", fazenda.id)
      .maybeSingle(),
    supabase
      .from("vacinacao_aplicacoes")
      .select("vacina_id, data")
      .eq("fazenda_id", fazenda.id)
      .eq("animal_id", animalId)
      .is("deleted_at", null),
  ]);

  return avaliarStatusAnimal({
    hoje: hojeISO(),
    dataNascimento: animal?.data_nascimento ?? null,
    itensProtocolo: itensDoProtocolo(protocolo),
    realizacoes: (realizacoes ?? []) as RealizacaoVacina[],
  });
}

export async function getHistoricoAnimalVacinas(animalId: string) {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vacinacao_aplicacoes")
    .select("id, data, vacina_id, vacina:vacinas ( nome )")
    .eq("fazenda_id", fazenda.id)
    .eq("animal_id", animalId)
    .is("deleted_at", null)
    .order("data", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((linha) => {
    const vacina = Array.isArray(linha.vacina) ? linha.vacina[0] : linha.vacina;
    return {
      id: linha.id,
      data: linha.data,
      vacina_id: linha.vacina_id,
      vacina_nome: vacina?.nome ?? "Vacina",
    };
  });
}

export async function getSessoesRecentes(limit = 8): Promise<SessaoResumo[]> {
  const fazenda = await exigirFazenda();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vacinacao_sessoes")
    .select("id, data, lote_id, qtd_animais_lote, qtd_aplicados, lote:lotes ( nome )")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((linha) => {
    const lote = Array.isArray(linha.lote) ? linha.lote[0] : linha.lote;
    return {
      id: linha.id,
      data: linha.data,
      lote_id: linha.lote_id,
      lote_nome: lote?.nome ?? "Lote",
      qtd_animais_lote: linha.qtd_animais_lote,
      qtd_aplicados: linha.qtd_aplicados,
    };
  });
}

export async function getLotesComVacinaPendente() {
  const status = await getStatusRebanho();
  return status.porLote
    .filter((lote) => lote.status === "pendente")
    .map((lote) => ({
      lote_id: lote.lote_id,
      nome: lote.lote_nome,
      qtd_pendentes:
        lote.qtd_incompleto + lote.qtd_atrasado + lote.qtd_indefinido,
    }))
    .filter((lote) => lote.qtd_pendentes > 0);
}
