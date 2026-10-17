import { describe, expect, it } from "vitest";

import {
  classificarLancamentos,
  custoArrobaPonderado,
  ratearMl,
  repartirCategorias,
  type LancamentoPeriodo,
} from "@/lib/custos-periodo/calculo";

function linha(
  parcial: Partial<LancamentoPeriodo> & Pick<LancamentoPeriodo, "id" | "data_inicio">,
): LancamentoPeriodo {
  return {
    data_fim: null,
    categoria: "alimentacao",
    custo_total: 10,
    produto_nome: "Sal",
    quantidade: 1,
    unidade: "kg",
    ...parcial,
  };
}

describe("classificarLancamentos", () => {
  it("inclui do dia seguinte à pesagem anterior até o dia desta", () => {
    const linhas = classificarLancamentos(
      [
        linha({ id: "antes", data_inicio: "2026-10-01", data_fim: "2026-10-01" }),
        linha({ id: "no-dia", data_inicio: "2026-10-05" }),
        linha({ id: "dentro", data_inicio: "2026-10-06" }),
        linha({ id: "hoje", data_inicio: "2026-10-12" }),
        linha({ id: "depois", data_inicio: "2026-10-13" }),
      ],
      "2026-10-12",
      "2026-10-05",
    );

    expect(linhas.filter((item) => item.grupo === "periodo").map((item) => item.id)).toEqual([
      "dentro",
      "hoje",
    ]);
  });

  it("na primeira pesagem entra tudo até a data", () => {
    const linhas = classificarLancamentos(
      [
        linha({ id: "velho", data_inicio: "2026-09-01" }),
        linha({ id: "hoje", data_inicio: "2026-10-12" }),
        linha({ id: "depois", data_inicio: "2026-10-13" }),
      ],
      "2026-10-12",
      null,
    );

    expect(linhas.map((item) => item.id)).toEqual(["velho", "hoje"]);
    expect(linhas.every((item) => item.grupo === "periodo")).toBe(true);
  });

  it("lançamento que começou antes fica no grupo anterior", () => {
    const linhas = classificarLancamentos(
      [
        linha({ id: "cruza", data_inicio: "2026-10-01", data_fim: "2026-10-20" }),
        linha({ id: "aberto", data_inicio: "2026-10-05", data_fim: null }),
        linha({ id: "encerrado", data_inicio: "2026-09-01", data_fim: "2026-10-05" }),
      ],
      "2026-10-12",
      "2026-10-05",
    );

    expect(linhas.find((item) => item.id === "cruza")?.grupo).toBe("anterior");
    expect(linhas.find((item) => item.id === "aberto")?.grupo).toBe("anterior");
    expect(linhas.find((item) => item.id === "encerrado")).toBeUndefined();
  });
});

describe("custoArrobaPonderado", () => {
  it("pesa pela arroba produzida, não pela média das pesagens", () => {
    const valor = custoArrobaPonderado([
      { custo: 800, ganhoKg: 60 },
      { custo: 3200, ganhoKg: 1200 },
    ]);

    expect(valor).toBeCloseTo(4000 / 42, 6);
  });

  it("ignora pesagem sem custo ou sem ganho", () => {
    expect(
      custoArrobaPonderado([
        { custo: null, ganhoKg: 60 },
        { custo: 300, ganhoKg: 0 },
        { custo: 300, ganhoKg: 30 },
      ]),
    ).toBeCloseTo(300, 6);
  });
});

describe("repartirCategorias", () => {
  it("pesagem antiga sem foto conta tudo como suplementação", () => {
    expect(repartirCategorias(120, [])).toEqual({
      alimentacao: 120,
      sanidade: 0,
      outro: 0,
    });
  });

  it("reparte o valor editado na proporção das fotos", () => {
    expect(
      repartirCategorias(200, [
        { categoria: "alimentacao", valor: 75 },
        { categoria: "sanidade", valor: 25 },
      ]),
    ).toEqual({
      alimentacao: 150,
      sanidade: 50,
      outro: 0,
    });
  });
});

describe("ratearMl", () => {
  it("divide pelos animais tratados e o sem lote não recebe lote", () => {
    const partes = ratearMl(100, 1, [
      { loteId: "a", cabecas: 4 },
      { loteId: "b", cabecas: 4 },
      { loteId: null, cabecas: 2 },
    ]);

    expect(partes).toEqual([
      { loteId: "a", cabecas: 4, ml: 40, custo: 40 },
      { loteId: "b", cabecas: 4, ml: 40, custo: 40 },
      { loteId: null, cabecas: 2, ml: 20, custo: 20 },
    ]);
  });

  it("a última parte absorve o centavo e o milésimo", () => {
    const partes = ratearMl(10, 0.1, [
      { loteId: "a", cabecas: 1 },
      { loteId: "b", cabecas: 1 },
      { loteId: "c", cabecas: 1 },
    ]);

    expect(partes.map((parte) => parte.ml)).toEqual([3.333, 3.333, 3.334]);
    expect(partes.map((parte) => parte.custo)).toEqual([0.33, 0.33, 0.34]);
    expect(partes.reduce((total, parte) => total + parte.custo, 0)).toBeCloseTo(1, 2);
  });
});
