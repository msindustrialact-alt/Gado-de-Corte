export type StatusVacinaAnimal =
  | "em_dia"
  | "incompleto"
  | "atrasado"
  | "sem_protocolo"
  | "indefinido";

export type ItemProtocoloVacina = {
  vacina_id: string;
  vacina_nome: string;
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
  motivo: "nunca" | "intervalo_vencido" | "sem_nascimento";
  ultima_data: string | null;
  proxima_prevista: string | null;
};

export type AvaliacaoVacinaAnimal = {
  status: StatusVacinaAnimal;
  faltantes: VacinaFaltante[];
};

export const LABELS_STATUS_VACINA: Record<StatusVacinaAnimal, string> = {
  em_dia: "Em dia",
  incompleto: "Incompleto",
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

export function avaliarStatusAnimal(params: {
  hoje: string;
  dataNascimento: string | null;
  itensProtocolo: ItemProtocoloVacina[];
  realizacoes: RealizacaoVacina[];
}): AvaliacaoVacinaAnimal {
  const obrigatorias = params.itensProtocolo.filter((item) => item.obrigatoria);

  if (obrigatorias.length === 0) {
    return { status: "sem_protocolo", faltantes: [] };
  }

  const ultimas = ultimaPorVacina(params.realizacoes);
  const faltantes: VacinaFaltante[] = [];
  let temSemNascimento = false;
  let temNunca = false;
  let temIntervaloVencido = false;

  for (const item of obrigatorias) {
    const ultima = ultimas.get(item.vacina_id) ?? null;

    if (item.idade_minima_dias != null) {
      if (!params.dataNascimento) {
        // Sem nascimento: se já aplicou, segue pelo intervalo; se não, falta
        // com aviso (não bloqueia o animal inteiro como "indefinido" cego).
        if (!ultima) {
          temSemNascimento = true;
          temNunca = true;
          faltantes.push({
            vacina_id: item.vacina_id,
            vacina_nome: item.vacina_nome,
            motivo: "sem_nascimento",
            ultima_data: null,
            proxima_prevista: null,
          });
          continue;
        }
      } else {
        const idadeDias = diasEntre(params.dataNascimento, params.hoje);
        if (idadeDias < item.idade_minima_dias) {
          continue;
        }
      }
    }

    if (!ultima) {
      temNunca = true;
      faltantes.push({
        vacina_id: item.vacina_id,
        vacina_nome: item.vacina_nome,
        motivo: "nunca",
        ultima_data: null,
        proxima_prevista: null,
      });
      continue;
    }

    if (item.intervalo_dias != null) {
      const proxima = adicionarDias(ultima, item.intervalo_dias);
      if (params.hoje > proxima) {
        temIntervaloVencido = true;
        faltantes.push({
          vacina_id: item.vacina_id,
          vacina_nome: item.vacina_nome,
          motivo: "intervalo_vencido",
          ultima_data: ultima,
          proxima_prevista: proxima,
        });
      }
    }
  }

  // Incompleto é mais acionável que indefinido quando falta dose.
  if (temNunca) {
    return { status: "incompleto", faltantes };
  }

  if (temSemNascimento) {
    return { status: "indefinido", faltantes };
  }

  if (temIntervaloVencido) {
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

  const todosEmDia = statusAnimais.every((s) => s === "em_dia");
  return todosEmDia ? "em_dia" : "pendente";
}
