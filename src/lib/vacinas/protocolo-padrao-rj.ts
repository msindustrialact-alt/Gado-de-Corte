/**
 * Protocolo sanitário de referência (gado de corte — perfil RJ).
 * Status do animal: só por realização (aplicou = em dia naquela vacina).
 * Idade sugerida e reforço de 30d na primovacinação ficam nas observações.
 */

export type VacinaPadraoRj = {
  nome: string;
  intervalo_dias: number | null;
  observacoes: string;
  /** Não usado no status; gravado null no protocolo. */
  idade_minima_dias: number | null;
  obrigatoria: boolean;
  ordem: number;
};

export const NOME_PROTOCOLO_PADRAO_RJ =
  "Padrão Joana e Cataguá (RJ — cria/recria)";

export const VACINAS_PROTOCOLO_PADRAO_RJ: VacinaPadraoRj[] = [
  {
    nome: "IBR / BVD",
    intervalo_dias: 365,
    idade_minima_dias: null,
    obrigatoria: true,
    ordem: 0,
    observacoes:
      "Sugestão: iniciar ~3 meses. Primovacinados: 1ª dose + reforço 30 dias. Matrizes/touros: 30–60 dias antes da estação de monta. Status no sistema: só após registrar a aplicação.",
  },
  {
    nome: "Brucelose (B19 ou RB51)",
    intervalo_dias: null,
    idade_minima_dias: null,
    obrigatoria: true,
    ordem: 1,
    observacoes:
      "Sugestão: dose única em fêmeas de 3 a 8 meses. Vet. habilitado. Machos nunca. Status: só após registrar a aplicação (filtrar sexo no lote).",
  },
  {
    nome: "Clostridioses",
    intervalo_dias: 365,
    idade_minima_dias: null,
    obrigatoria: true,
    ordem: 2,
    observacoes:
      "Sugestão: 1ª dose ~4 meses; reforço 30 dias; depois anual (ou semestral se histórico alto). Status: só após registrar a aplicação.",
  },
  {
    nome: "Raiva dos Herbívoros",
    intervalo_dias: 365,
    idade_minima_dias: null,
    obrigatoria: true,
    ordem: 3,
    observacoes:
      "Sugestão: 1ª dose ~4 meses; reforço 30 dias; revacinação anual no RJ. Status: só após registrar a aplicação.",
  },
  {
    nome: "Leptospirose",
    intervalo_dias: 365,
    idade_minima_dias: null,
    obrigatoria: false,
    ordem: 4,
    observacoes:
      "Sugestão (reprodução): anual, 30–60 dias antes da estação de monta. Opcional na engorda. Status: só após registrar a aplicação.",
  },
];
