/**
 * Protocolo sanitário de referência (gado de corte — perfil RJ).
 * Adaptado ao schema MVP: idade_minima_dias + intervalo_dias único por vacina.
 *
 * Limitações conscientes:
 * - Primovacinação (reforço 30d) não tem intervalo separado da manutenção anual;
 *   usamos intervalo de manutenção (365d) e documentamos o reforço nas observações.
 * - Brucelose: sistema ainda não filtra por sexo — observar “só fêmeas”.
 * - Estação de monta / declaração de rebanho ficam fora do calendário de vacina.
 */

export type VacinaPadraoRj = {
  nome: string;
  intervalo_dias: number | null;
  observacoes: string;
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
    idade_minima_dias: 90,
    obrigatoria: true,
    ordem: 0,
    observacoes:
      "Iniciar ~3 meses. Primovacinados: 1ª dose + reforço 30 dias. Matrizes/touros: reforçar 30–60 dias antes da estação de monta (controle operacional).",
  },
  {
    nome: "Brucelose (B19 ou RB51)",
    intervalo_dias: null,
    idade_minima_dias: 90,
    obrigatoria: true,
    ordem: 1,
    observacoes:
      "Dose única em fêmeas de 3 a 8 meses. Obrigatória por vet. habilitado. Machos nunca devem ser vacinados. (MVP: filtrar sexo manualmente no lote.)",
  },
  {
    nome: "Clostridioses",
    intervalo_dias: 365,
    idade_minima_dias: 120,
    obrigatoria: true,
    ordem: 2,
    observacoes:
      "1ª dose ~4 meses. Primovacinados: reforço 30 dias após a 1ª. Manutenção anual (ou semestral se histórico alto de morte súbita).",
  },
  {
    nome: "Raiva dos Herbívoros",
    intervalo_dias: 365,
    idade_minima_dias: 120,
    obrigatoria: true,
    ordem: 3,
    observacoes:
      "1ª dose ~4 meses. Primovacinados: reforço 30 dias. Revacinação anual recomendada no RJ até o abate/embarque.",
  },
  {
    nome: "Leptospirose",
    intervalo_dias: 365,
    idade_minima_dias: 365,
    obrigatoria: false,
    ordem: 4,
    observacoes:
      "Reprodução: matrizes e touros — revacinar anualmente, idealmente 30–60 dias antes da estação de monta. Opcional no MVP de engorda.",
  },
];
