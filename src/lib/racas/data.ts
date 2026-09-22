import { getFazendaAtiva } from "@/lib/fazenda";
import type { RacaItem } from "@/lib/racas";
import { createClient } from "@/lib/supabase/server";

export async function getRacas(): Promise<{
  padrao: RacaItem[];
  minhas: RacaItem[];
}> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  const supabase = await createClient();
  const [racasRes, usosRes] = await Promise.all([
    supabase
      .from("racas")
      .select("id, nome, ativa, fazenda_id")
      .or(`fazenda_id.is.null,fazenda_id.eq.${fazenda.id}`)
      .order("nome", { ascending: true }),
    supabase
      .from("animais")
      .select("raca_id")
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null)
      .not("raca_id", "is", null),
  ]);

  if (racasRes.error) {
    console.error(racasRes.error);
    throw new Error("Não foi possível carregar as raças.");
  }

  const contagem = new Map<string, number>();

  for (const linha of usosRes.data ?? []) {
    if (!linha.raca_id) {
      continue;
    }

    contagem.set(linha.raca_id, (contagem.get(linha.raca_id) ?? 0) + 1);
  }

  const padrao: RacaItem[] = [];
  const minhas: RacaItem[] = [];

  for (const raca of racasRes.data ?? []) {
    const item: RacaItem = {
      id: raca.id,
      nome: raca.nome,
      ativa: raca.ativa,
      fazenda_id: raca.fazenda_id,
      qtd_animais: contagem.get(raca.id) ?? 0,
    };

    if (raca.fazenda_id == null) {
      padrao.push(item);
    } else {
      minhas.push(item);
    }
  }

  return { padrao, minhas };
}

export async function contarAnimaisDaRaca(racaId: string): Promise<number> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return 0;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("animais")
    .select("id", { count: "exact", head: true })
    .eq("fazenda_id", fazenda.id)
    .eq("raca_id", racaId);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}
