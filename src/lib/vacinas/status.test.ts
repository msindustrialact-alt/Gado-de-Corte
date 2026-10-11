import { describe, expect, it } from "vitest";

import { avaliarStatusAnimal } from "@/lib/vacinas";

const protocolo2 = [
  {
    vacina_id: "v1",
    vacina_nome: "Aftosa",
    obrigatoria: true,
    idade_minima_dias: null,
    intervalo_dias: null,
  },
  {
    vacina_id: "v2",
    vacina_nome: "Raiva",
    obrigatoria: true,
    idade_minima_dias: null,
    intervalo_dias: null,
  },
];

describe("avaliarStatusAnimal", () => {
  it("sem realizacoes → incompleto com 2 faltantes", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: protocolo2,
      realizacoes: [],
    });
    expect(r.status).toBe("incompleto");
    expect(r.faltantes).toHaveLength(2);
  });

  it("1 de 2 aplicadas → incompleto com 1 faltante", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: protocolo2,
      realizacoes: [{ vacina_id: "v1", data: "2026-09-01" }],
    });
    expect(r.status).toBe("incompleto");
    expect(r.faltantes.map((f) => f.vacina_id)).toEqual(["v2"]);
  });

  it("ambas sem intervalo → em_dia", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: protocolo2,
      realizacoes: [
        { vacina_id: "v1", data: "2026-09-01" },
        { vacina_id: "v2", data: "2026-09-01" },
      ],
    });
    expect(r.status).toBe("em_dia");
    expect(r.faltantes).toHaveLength(0);
  });

  it("intervalo vencido → atrasado", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: [
        {
          vacina_id: "v1",
          vacina_nome: "Aftosa",
          obrigatoria: true,
          idade_minima_dias: null,
          intervalo_dias: 180,
        },
      ],
      realizacoes: [{ vacina_id: "v1", data: "2026-01-01" }],
    });
    expect(r.status).toBe("atrasado");
    expect(r.faltantes[0]?.motivo).toBe("intervalo_vencido");
  });

  it("idade minima sem nascimento → indefinido", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: null,
      itensProtocolo: [
        {
          vacina_id: "v1",
          vacina_nome: "Brucelose",
          obrigatoria: true,
          idade_minima_dias: 90,
          intervalo_dias: null,
        },
      ],
      realizacoes: [],
    });
    expect(r.status).toBe("indefinido");
  });

  it("protocolo vazio → sem_protocolo", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: [],
      realizacoes: [],
    });
    expect(r.status).toBe("sem_protocolo");
  });
});
