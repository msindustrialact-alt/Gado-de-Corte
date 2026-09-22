import type { Enums } from "@/types/database";

export type StatusPiquete = Enums<"status_piquete">;

export type PiqueteResumo = {
  id: string;
  nome: string;
  area_ha: number | null;
  tipo_pastagem: string | null;
  status: StatusPiquete;
  observacoes: string | null;
  capacidade_ua: number | null;
  qtd_animais: number;
  ua_atual: number;
  lotacao_ua_ha: number | null;
};

export type AnimalDoPiquete = {
  id: string;
  brinco: string;
  categoria: string | null;
  peso_atual: number | null;
  lote: { id: string; nome: string } | null;
};

export const STATUS_PIQUETE: StatusPiquete[] = [
  "ativo",
  "em_descanso",
  "em_reforma",
  "inativo",
];

export const LABELS_STATUS_PIQUETE: Record<StatusPiquete, string> = {
  ativo: "Ativo",
  em_descanso: "Em descanso",
  em_reforma: "Em reforma",
  inativo: "Inativo",
};

export const OPCOES_STATUS_PIQUETE = STATUS_PIQUETE.map((valor) => ({
  valor,
  rotulo: LABELS_STATUS_PIQUETE[valor],
}));

export const SUGESTOES_PASTAGEM = [
  "Brachiaria brizantha (Marandu)",
  "Brachiaria decumbens",
  "Brachiaria ruziziensis",
  "Mombaça",
  "Tanzânia",
  "Tifton 85",
  "Estrela",
  "Piatã",
  "Xaraés",
  "Capim-elefante",
] as const;

export function resumoPiquetes(piquetes: PiqueteResumo[]): {
  total: number;
  areaTotal: number;
  lotacaoMedia: number | null;
} {
  const areaTotal = piquetes.reduce((soma, item) => soma + (item.area_ha ?? 0), 0);
  const uaTotal = piquetes.reduce((soma, item) => soma + item.ua_atual, 0);

  return {
    total: piquetes.length,
    areaTotal,
    lotacaoMedia: areaTotal > 0 ? uaTotal / areaTotal : null,
  };
}
