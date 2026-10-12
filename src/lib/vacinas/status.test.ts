import { describe, expect, it } from "vitest";

import { avaliarStatusAnimal } from "@/lib/vacinas";

const protocolo = [
  {
    vacina_id: "clo",
    vacina_nome: "Clostridioses",
    obrigatoria: false,
    idade_minima_dias: null,
    intervalo_dias: 365,
  },
  {
    vacina_id: "rai",
    vacina_nome: "Raiva",
    obrigatoria: false,
    idade_minima_dias: null,
    intervalo_dias: 365,
  },
  {
    vacina_id: "ibr",
    vacina_nome: "IBR / BVD",
    obrigatoria: false,
    idade_minima_dias: null,
    intervalo_dias: 365,
  },
];

describe("avaliarStatusAnimal", () => {
  it("sem realizacoes → pendente", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      itensProtocolo: protocolo,
      realizacoes: [],
    });
    expect(r.status).toBe("incompleto");
    expect(r.faltantes).toHaveLength(0);
  });

  it("aplicou 2 vacinas → realizado (não exige as demais)", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      itensProtocolo: protocolo,
      realizacoes: [
        { vacina_id: "clo", data: "2026-10-11" },
        { vacina_id: "rai", data: "2026-10-11" },
      ],
    });
    expect(r.status).toBe("em_dia");
    expect(r.faltantes).toHaveLength(0);
  });

  it("aplicou e intervalo vencido → atrasado", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      itensProtocolo: protocolo,
      realizacoes: [{ vacina_id: "clo", data: "2025-01-01" }],
    });
    expect(r.status).toBe("atrasado");
    expect(r.faltantes[0]?.motivo).toBe("intervalo_vencido");
  });

  it("dose única sem intervalo → realizado", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      itensProtocolo: [
        {
          vacina_id: "bru",
          vacina_nome: "Brucelose",
          obrigatoria: false,
          idade_minima_dias: null,
          intervalo_dias: null,
        },
      ],
      realizacoes: [{ vacina_id: "bru", data: "2026-01-01" }],
    });
    expect(r.status).toBe("em_dia");
  });

  it("protocolo vazio com aplicação → realizado", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      itensProtocolo: [],
      realizacoes: [{ vacina_id: "x", data: "2026-10-01" }],
    });
    expect(r.status).toBe("em_dia");
  });
});
