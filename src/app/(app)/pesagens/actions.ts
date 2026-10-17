"use server";

import { revalidatePath } from "next/cache";

import {
  ehViolacaoUnica,
  falhaValidacao,
  vazioParaNulo,
  type ResultadoAcao,
} from "@/lib/acao";
import {
  consultarCustosPeriodo,
  gravarCustosPeriodo,
} from "@/lib/custos-periodo/data";
import type { LinhaCustoPeriodo } from "@/lib/custos-periodo/calculo";
import { getFazendaAtiva } from "@/lib/fazenda";
import {
  desempenhoDaLinha,
  parsePesoCampo,
  pesoParaCampo,
  resumoSessaoLive,
} from "@/lib/pesagens";
import { getPesagemPorLoteData, getSessaoPesagem } from "@/lib/pesagens/data";
import {
  condicaoDeCampo,
  custoDeCampo,
  schemaNovaPesagem,
  schemaSalvarSessao,
} from "@/lib/pesagens/schema";
import { createClient } from "@/lib/supabase/server";

function revalidarPesagens(ids?: { pesagem?: string; lote?: string; animais?: string[] }) {
  revalidatePath("/pesagens");
  revalidatePath("/dashboard");
  revalidatePath("/animais");
  revalidatePath("/lotes");
  revalidatePath("/lucratividade");

  if (ids?.pesagem) {
    revalidatePath(`/pesagens/${ids.pesagem}`);
  }

  if (ids?.lote) {
    revalidatePath(`/lotes/${ids.lote}`);
  }

  for (const animalId of ids?.animais ?? []) {
    revalidatePath(`/animais/${animalId}`);
  }
}

function traduzirErro(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}): ResultadoAcao {
  if (error.code === "23514") {
    return { ok: false, message: "A data da pesagem não pode ser futura." };
  }

  return {
    ok: false,
    message: "Não foi possível salvar a pesagem. Tente de novo.",
  };
}

async function atualizarEstatisticas(pesagemId: string, fazendaId: string) {
  const sessao = await getSessaoPesagem(pesagemId);

  if (!sessao) {
    return;
  }

  const pesos = Object.fromEntries(
    sessao.animais.map((animal) => [animal.id, pesoParaCampo(animal.peso_salvo_kg)]),
  );
  const resumo = resumoSessaoLive(
    sessao.animais,
    pesos,
    sessao.cabecalho.data,
    sessao.cabecalho.custo_alimentacao,
    sessao.cabecalho.condicao_pesagem,
    sessao.cabecalho.qtd_lote,
  );
  const supabase = await createClient();

  await supabase
    .from("pesagens")
    .update({
      gmd_medio: resumo.gmd_medio,
      ganho_total_kg: resumo.ganho_total_kg,
      peso_medio: resumo.peso_medio,
      uniformidade_cv:
        resumo.uniformidade_cv != null
          ? Math.round(resumo.uniformidade_cv * 100) / 100
          : null,
      qtd_animais_lote: resumo.qtd_animais_lote,
      qtd_pesados: resumo.pesados,
      cobertura_percentual:
        resumo.cobertura_percentual != null
          ? Math.round(resumo.cobertura_percentual * 100) / 100
          : null,
    })
    .eq("id", pesagemId)
    .eq("fazenda_id", fazendaId);
}

export async function criarPesagem(dados: unknown): Promise<ResultadoAcao> {
  const parsed = schemaNovaPesagem.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const existente = await getPesagemPorLoteData(parsed.data.lote_id, parsed.data.data);

  if (existente) {
    return {
      ok: true,
      id: existente.id,
      message: "Esta pesagem já existia. Abrimos o registro do dia.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lote } = await supabase
    .from("lotes")
    .select("id, status")
    .eq("id", parsed.data.lote_id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!lote) {
    return {
      ok: false,
      message: "Lote não encontrado.",
      fieldErrors: { lote_id: ["Lote não encontrado"] },
    };
  }

  const { data, error } = await supabase
    .from("pesagens")
    .insert({
      fazenda_id: fazenda.id,
      lote_id: parsed.data.lote_id,
      data: parsed.data.data,
      status: "rascunho",
      custo_alimentacao: custoDeCampo(parsed.data.custo_alimentacao),
      condicao_pesagem: condicaoDeCampo(parsed.data.condicao_pesagem),
      observacoes: vazioParaNulo(parsed.data.observacoes),
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (ehViolacaoUnica(error ?? {}, "uq_pesagens_lote_data")) {
      const outra = await getPesagemPorLoteData(parsed.data.lote_id, parsed.data.data);

      if (outra) {
        return {
          ok: true,
          id: outra.id,
          message: "Esta pesagem já existia. Abrimos o registro do dia.",
        };
      }
    }

    console.error(error);
    return traduzirErro(error ?? {});
  }

  revalidarPesagens({ pesagem: data.id, lote: parsed.data.lote_id });
  return { ok: true, id: data.id, message: "Pesagem iniciada." };
}

async function persistirSessao(
  id: string,
  dados: unknown,
  concluir: boolean,
): Promise<ResultadoAcao> {
  const parsed = schemaSalvarSessao.safeParse(dados);

  if (!parsed.success) {
    return falhaValidacao(parsed.error);
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("pesagens")
    .select("id, lote_id, status, deleted_at, data, condicao_pesagem")
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!atual) {
    return { ok: false, message: "Pesagem não encontrada." };
  }

  if (atual.status === "concluida") {
    return {
      ok: false,
      message: "Reabra a pesagem para alterar os pesos.",
    };
  }

  const sessao = await getSessaoPesagem(id);
  const condicao = condicaoDeCampo(parsed.data.condicao_pesagem);

  const validos = parsed.data.itens.flatMap((item) => {
    const peso = parsePesoCampo(item.peso);

    if (peso == null) {
      return [];
    }

    const animal = sessao?.animais.find((a) => a.id === item.animal_id);
    const desempenho = animal
      ? desempenhoDaLinha(item.peso, animal, atual.data, condicao)
      : null;

    return [
      {
        animal_id: item.animal_id,
        peso_kg: peso,
        confiabilidade: desempenho?.confiabilidade ?? "sem_referencia",
      },
    ];
  });

  if (concluir && validos.length === 0) {
    return { ok: false, message: "Informe o peso de pelo menos um animal para concluir." };
  }

  const { data: existentes, error: erroExistentes } = await supabase
    .from("pesagem_itens")
    .select("id, animal_id")
    .eq("fazenda_id", fazenda.id)
    .eq("pesagem_id", id);

  if (erroExistentes) {
    console.error(erroExistentes);
    return { ok: false, message: "Não foi possível salvar os pesos." };
  }

  const idsValidos = new Set(validos.map((item) => item.animal_id));
  const remover = (existentes ?? [])
    .filter((item) => !idsValidos.has(item.animal_id))
    .map((item) => item.id);

  if (remover.length > 0) {
    const { error: erroDelete } = await supabase
      .from("pesagem_itens")
      .delete()
      .eq("fazenda_id", fazenda.id)
      .eq("pesagem_id", id)
      .in("id", remover);

    if (erroDelete) {
      console.error(erroDelete);
      return { ok: false, message: "Não foi possível atualizar os pesos." };
    }
  }

  if (validos.length > 0) {
    const { error: erroUpsert } = await supabase.from("pesagem_itens").upsert(
      validos.map((item) => ({
        fazenda_id: fazenda.id,
        pesagem_id: id,
        animal_id: item.animal_id,
        peso_kg: item.peso_kg,
        confiabilidade: item.confiabilidade,
      })),
      { onConflict: "pesagem_id,animal_id" },
    );

    if (erroUpsert) {
      console.error(erroUpsert);
      return { ok: false, message: "Não foi possível salvar os pesos. Confira os valores." };
    }
  }

  const { error: erroCabecalho } = await supabase
    .from("pesagens")
    .update({
      custo_alimentacao: custoDeCampo(parsed.data.custo_alimentacao),
      condicao_pesagem: condicao,
      observacoes: vazioParaNulo(parsed.data.observacoes),
      status: concluir ? "concluida" : "rascunho",
    })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null);

  if (erroCabecalho) {
    console.error(erroCabecalho);
    return traduzirErro(erroCabecalho);
  }

  await atualizarEstatisticas(id, fazenda.id);

  const animais = validos.map((item) => item.animal_id);
  revalidarPesagens({ pesagem: id, lote: atual.lote_id, animais });

  return {
    ok: true,
    id,
    message: concluir ? "Pesagem concluída." : "Pesagem salva.",
  };
}

export async function salvarPesagem(id: string, dados: unknown): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Pesagem inválida." };
  }

  return persistirSessao(id, dados, false);
}

export async function concluirPesagem(id: string, dados: unknown): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Pesagem inválida." };
  }

  return persistirSessao(id, dados, true);
}

export async function reabrirPesagem(id: string): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Pesagem inválida." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pesagens")
    .update({ status: "rascunho" })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id, lote_id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível reabrir a pesagem." };
  }

  if (!data) {
    return { ok: false, message: "Pesagem não encontrada." };
  }

  const sessao = await getSessaoPesagem(id);
  revalidarPesagens({
    pesagem: id,
    lote: data.lote_id,
    animais: sessao?.animais.map((animal) => animal.id),
  });

  return { ok: true, message: "Pesagem reaberta para edição." };
}

export async function arquivarPesagem(id: string): Promise<ResultadoAcao> {
  if (!id) {
    return { ok: false, message: "Pesagem inválida." };
  }

  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return { ok: false, message: "Não foi possível identificar a fazenda." };
  }

  const supabase = await createClient();
  const sessao = await getSessaoPesagem(id);
  const { data, error } = await supabase
    .from("pesagens")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .select("id, lote_id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { ok: false, message: "Não foi possível arquivar a pesagem." };
  }

  if (!data) {
    return { ok: false, message: "Pesagem não encontrada." };
  }

  revalidarPesagens({
    pesagem: id,
    lote: data.lote_id,
    animais: sessao?.animais.map((animal) => animal.id),
  });

  return { ok: true, message: "Pesagem arquivada." };
}

export async function buscarCustosPeriodoAction(pesagemId: string): Promise<
  | {
      ok: true;
      dataPesagem: string;
      dataAnterior: string | null;
      linhas: LinhaCustoPeriodo[];
    }
  | { ok: false; message: string }
> {
  const consulta = await consultarCustosPeriodo(pesagemId);

  if (!consulta) {
    return { ok: false, message: "Pesagem não encontrada." };
  }

  return {
    ok: true,
    dataPesagem: consulta.dataPesagem,
    dataAnterior: consulta.dataAnterior,
    linhas: consulta.linhas,
  };
}

export async function aplicarCustosPeriodoAction(
  pesagemId: string,
  lancamentoIds: string[],
): Promise<{ ok: true; total: number } | { ok: false; message: string }> {
  const resultado = await gravarCustosPeriodo(pesagemId, lancamentoIds);

  if (resultado.ok) {
    const fazenda = await getFazendaAtiva();
    const sessao = await getSessaoPesagem(pesagemId);

    if (fazenda) {
      await atualizarEstatisticas(pesagemId, fazenda.id);
    }

    revalidarPesagens({
      pesagem: pesagemId,
      lote: sessao?.cabecalho.lote_id,
    });
  }

  return resultado;
}
