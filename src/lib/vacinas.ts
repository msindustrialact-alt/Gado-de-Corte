export type StatusVacinaAnimal =
  | "em_dia"
  | "incompleto"
  | "atrasado"
  | "sem_protocolo"
  | "indefinido";

export type ItemProtocoloVacina = {
  vacina_id: string;
  vacina_nome: string;
  /** Campo legado; status não usa obrigatoriedade. */
  obrigatoria: boolean;
  idade_minima_dias: number | null;
  intervalo_dias: number | null;
};

export type RealizacaoVacina = {
  vacina_id: string;
  data: string;
};

export type VacinaFaltante = {
  vacina_id: string;
  vacina_nome: string;
  motivo: "nunca" | "intervalo_vencido";
  ultima_data: string | null;
  proxima_prevista: string | null;
};

export type AvaliacaoVacinaAnimal = {
  status: StatusVacinaAnimal;
  faltantes: VacinaFaltante[];
};

export const LABELS_STATUS_VACINA: Record<StatusVacinaAnimal, string> = {
  em_dia: "Realizado",
  incompleto: "Pendente",
  atrasado: "Atrasado",
  sem_protocolo: "Sem protocolo",
  indefinido: "Indefinido",
};

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function diasEntre(isoInicio: string, isoFim: string): number {
  const a = parseIso(isoInicio);
  const b = parseIso(isoFim);
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

export function adicionarDias(iso: string, dias: number): string {
  const data = parseIso(iso);
  data.setUTCDate(data.getUTCDate() + dias);
  const y = data.getUTCFullYear();
  const m = String(data.getUTCMonth() + 1).padStart(2, "0");
  const d = String(data.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function ultimaPorVacina(
  realizacoes: RealizacaoVacina[],
): Map<string, string> {
  const mapa = new Map<string, string>();

  for (const item of realizacoes) {
    const atual = mapa.get(item.vacina_id);
    if (!atual || item.data > atual) {
      mapa.set(item.vacina_id, item.data);
    }
  }

  return mapa;
}

/**
 * Status só pelo que foi aplicado (você escolhe a vacina):
 * - sem nenhuma aplicação → Pendente
 * - aplicações dentro do intervalo (se houver) → Realizado
 * - alguma aplicação fora do intervalo → Atrasado
 */
export function avaliarStatusAnimal(params: {
  hoje: string;
  dataNascimento?: string | null;
  itensProtocolo: ItemProtocoloVacina[];
  realizacoes: RealizacaoVacina[];
}): AvaliacaoVacinaAnimal {
  const ultimas = ultimaPorVacina(params.realizacoes);

  if (ultimas.size === 0) {
    return { status: "incompleto", faltantes: [] };
  }

  const metaPorVacina = new Map(
    params.itensProtocolo.map((item) => [
      item.vacina_id,
      {
        nome: item.vacina_nome,
        intervalo_dias: item.intervalo_dias,
      },
    ]),
  );

  const faltantes: VacinaFaltante[] = [];

  for (const [vacinaId, ultima] of ultimas) {
    const meta = metaPorVacina.get(vacinaId);
    const intervalo = meta?.intervalo_dias ?? null;
    if (intervalo == null) continue;

    const proxima = adicionarDias(ultima, intervalo);
    if (params.hoje > proxima) {
      faltantes.push({
        vacina_id: vacinaId,
        vacina_nome: meta?.nome ?? "Vacina",
        motivo: "intervalo_vencido",
        ultima_data: ultima,
        proxima_prevista: proxima,
      });
    }
  }

  if (faltantes.length > 0) {
    return { status: "atrasado", faltantes };
  }

  return { status: "em_dia", faltantes: [] };
}

export function agregarStatusLote(
  statusAnimais: StatusVacinaAnimal[],
): "em_dia" | "pendente" | "vazio" {
  if (statusAnimais.length === 0) {
    return "vazio";
  }

  const todosRealizados = statusAnimais.every((s) => s === "em_dia");
  return todosRealizados ? "em_dia" : "pendente";
}
