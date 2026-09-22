import { LABELS_CATEGORIA, type CategoriaAnimal } from "@/lib/animais";
import { getFazendaAtiva } from "@/lib/fazenda";
import type { AnimalDoPiquete, PiqueteResumo } from "@/lib/pastagens";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

function numeroOuZero(valor: number | string | null | undefined): number {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
}

function numeroOuNulo(valor: number | string | null | undefined): number | null {
  if (valor == null || valor === "") {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

type LinhaPiqueteResumo = Pick<
  Tables<"vw_piquetes_resumo">,
  | "id"
  | "nome"
  | "area_ha"
  | "tipo_pastagem"
  | "status"
  | "observacoes"
  | "capacidade_ua"
  | "qtd_animais"
  | "ua_atual"
  | "lotacao_ua_ha"
>;

function mapearPiquete(linha: LinhaPiqueteResumo): PiqueteResumo | null {
  if (!linha.id || !linha.nome || !linha.status) {
    return null;
  }

  return {
    id: linha.id,
    nome: linha.nome,
    area_ha: numeroOuNulo(linha.area_ha),
    tipo_pastagem: linha.tipo_pastagem,
    status: linha.status,
    observacoes: linha.observacoes,
    capacidade_ua: numeroOuNulo(linha.capacidade_ua),
    qtd_animais: numeroOuZero(linha.qtd_animais),
    ua_atual: numeroOuZero(linha.ua_atual),
    lotacao_ua_ha: numeroOuNulo(linha.lotacao_ua_ha),
  };
}

export async function getPiquetes(): Promise<PiqueteResumo[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_piquetes_resumo")
    .select(
      "id, nome, area_ha, tipo_pastagem, status, observacoes, capacidade_ua, qtd_animais, ua_atual, lotacao_ua_ha, fazenda_id, deleted_at",
    )
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar as pastagens.");
  }

  return (data ?? []).flatMap((linha) => {
    const piquete = mapearPiquete(linha);
    return piquete ? [piquete] : [];
  });
}

export async function getPiquetePorId(id: string): Promise<PiqueteResumo | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_piquetes_resumo")
    .select(
      "id, nome, area_ha, tipo_pastagem, status, observacoes, capacidade_ua, qtd_animais, ua_atual, lotacao_ua_ha, fazenda_id, deleted_at",
    )
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data ? mapearPiquete(data) : null;
}

export async function getAnimaisDoPiquete(piqueteId: string): Promise<AnimalDoPiquete[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animais")
    .select("id, brinco, categoria, peso_atual, lote:lotes!fk_animais_lote ( id, nome )")
    .eq("fazenda_id", fazenda.id)
    .eq("piquete_id", piqueteId)
    .eq("status", "ativo")
    .is("deleted_at", null)
    .order("brinco", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os animais do piquete.");
  }

  return (data ?? []).map((linha) => {
    const lote = Array.isArray(linha.lote) ? linha.lote[0] : linha.lote;

    return {
      id: linha.id,
      brinco: linha.brinco,
      categoria: linha.categoria
        ? LABELS_CATEGORIA[linha.categoria as CategoriaAnimal]
        : null,
      peso_atual: numeroOuNulo(linha.peso_atual),
      lote: lote ? { id: lote.id, nome: lote.nome } : null,
    };
  });
}

export async function contarAnimaisAtivosDoPiquete(piqueteId: string): Promise<number> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return 0;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("animais")
    .select("id", { count: "exact", head: true })
    .eq("fazenda_id", fazenda.id)
    .eq("piquete_id", piqueteId)
    .eq("status", "ativo")
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}

