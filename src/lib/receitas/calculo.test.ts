import { describe, expect, it } from "vitest";

import { exigeCienciaCarencia, fecharVenda } from "@/lib/receitas/calculo";

const base = {
  pesosKg: [1000],
  forma: "rendimento" as const,
  rendimentoPct: 54,
  descontoArrobas: null,
  linhasDesconto: [],
  arrobasPagas: null,
  valorArroba: 300,
  despesas: [],
};

describe("fecharVenda", () => {
  it("paga 36 @ em 1000 kg a 54% e mostra acréscimo", () => {
    const fechamento = fecharVenda(base);

    expect(fechamento.ok).toBe(true);
    if (!fechamento.ok) {
      return;
    }

    expect(fechamento.arrobasPagas).toBe(36);
    expect(fechamento.arrobasVivas).toBe(33.333);
    expect(fechamento.diferencaArrobas).toBeCloseTo(-2.667, 3);
    expect(fechamento.valorBruto).toBe(10800);
  });

  it("iguala @ pagas e @ viva com rendimento de 50%", () => {
    const fechamento = fecharVenda({ ...base, rendimentoPct: 50 });

    expect(fechamento.ok).toBe(true);
    if (!fechamento.ok) {
      return;
    }

    expect(fechamento.arrobasPagas).toBe(fechamento.arrobasVivas);
    expect(fechamento.diferencaArrobas).toBe(0);
  });

  it("soma o desconto das linhas e recusa @ paga negativa", () => {
    const fechamento = fecharVenda({
      ...base,
      forma: "desconto",
      rendimentoPct: null,
      linhasDesconto: [
        { descricao: "Quebra", arrobas: 1.5 },
        { descricao: "Toalete", arrobas: 0.5 },
      ],
    });

    expect(fechamento.ok).toBe(true);
    if (!fechamento.ok) {
      return;
    }

    expect(fechamento.arrobasVivas).toBe(33.333);
    expect(fechamento.arrobasPagas).toBe(31.333);
    expect(fechamento.diferencaArrobas).toBe(2);

    const estouro = fecharVenda({
      ...base,
      forma: "desconto",
      rendimentoPct: null,
      descontoArrobas: 40,
    });

    expect(estouro.ok).toBe(false);
  });

  it("guarda diferença negativa quando as @ pagas passam a @ viva", () => {
    const fechamento = fecharVenda({
      ...base,
      forma: "arrobas_pagas",
      rendimentoPct: null,
      arrobasPagas: 40,
    });

    expect(fechamento.ok).toBe(true);
    if (!fechamento.ok) {
      return;
    }

    expect(fechamento.arrobasPagas).toBe(40);
    expect(fechamento.diferencaArrobas).toBeCloseTo(-6.667, 3);
  });

  it("desconta despesas e permite líquido negativo", () => {
    const fechamento = fecharVenda({
      ...base,
      forma: "arrobas_pagas",
      rendimentoPct: null,
      arrobasPagas: 1,
      valorArroba: 10,
      despesas: [
        { descricao: "Frete", valor: 100 },
        { descricao: "GTA", valor: 50 },
      ],
    });

    expect(fechamento.ok).toBe(true);
    if (!fechamento.ok) {
      return;
    }

    expect(fechamento.valorBruto).toBe(10);
    expect(fechamento.despesasTotal).toBe(150);
    expect(fechamento.valorLiquido).toBe(-140);
  });
});

describe("exigeCienciaCarencia", () => {
  it("não pede ciência quando a liberação é no dia da venda", () => {
    expect(exigeCienciaCarencia(["2026-10-14", null], "2026-10-14")).toBe(false);
  });

  it("pede ciência quando a liberação é no dia seguinte", () => {
    expect(exigeCienciaCarencia(["2026-10-15"], "2026-10-14")).toBe(true);
  });
});
