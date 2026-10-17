export type FormaVendaAbate = "rendimento" | "desconto" | "arrobas_pagas";

export type LinhaDesconto = {
  descricao: string;
  arrobas: number;
};

export type LinhaDespesa = {
  descricao: string;
  valor: number;
};

export type EntradaFechamento = {
  pesosKg: number[];
  forma: FormaVendaAbate;
  rendimentoPct: number | null;
  descontoArrobas: number | null;
  linhasDesconto: LinhaDesconto[];
  arrobasPagas: number | null;
  valorArroba: number;
  despesas: LinhaDespesa[];
};

export type FechamentoPronto = {
  ok: true;
  qtd: number;
  pesoVivoTotal: number;
  arrobasVivas: number;
  arrobasPagas: number;
  diferencaArrobas: number;
  descontoUsado: number | null;
  valorBruto: number;
  despesasTotal: number;
  valorLiquido: number;
};

export type FechamentoVenda = FechamentoPronto | { ok: false; message: string };

function milhar(valor: number): number {
  return Math.round(valor * 1000);
}

function deMilhar(valor: number): number {
  return valor / 1000;
}

function centavos(valor: number): number {
  return Math.round(valor * 100);
}

function deCentavos(valor: number): number {
  return valor / 100;
}

function pesoVivoDe(pesosKg: number[]): { ok: true; peso: number; qtd: number } | { ok: false; message: string } {
  if (pesosKg.length === 0) {
    return { ok: false, message: "Marque ao menos um animal." };
  }

  let milhares = 0;

  for (const peso of pesosKg) {
    if (!Number.isFinite(peso) || peso <= 0) {
      return { ok: false, message: "Cada animal precisa de um peso maior que zero." };
    }

    milhares += milhar(peso);
  }

  return { ok: true, peso: deMilhar(milhares), qtd: pesosKg.length };
}

function despesasDe(linhas: LinhaDespesa[]): { ok: true; total: number } | { ok: false; message: string } {
  let total = 0;

  for (const linha of linhas) {
    if (!linha.descricao.trim()) {
      return { ok: false, message: "Informe o nome de cada despesa." };
    }

    if (!Number.isFinite(linha.valor) || linha.valor < 0) {
      return { ok: false, message: "A despesa não pode ser negativa." };
    }

    total += centavos(linha.valor);
  }

  return { ok: true, total: deCentavos(total) };
}

export function fecharVenda(entrada: EntradaFechamento): FechamentoVenda {
  const pesos = pesoVivoDe(entrada.pesosKg);

  if (!pesos.ok) {
    return pesos;
  }

  if (!Number.isFinite(entrada.valorArroba) || entrada.valorArroba < 0) {
    return { ok: false, message: "Informe o valor da @." };
  }

  const arrobasVivas = deMilhar(Math.round((pesos.peso * 1000) / 30));
  let arrobasPagas = 0;
  let descontoUsado: number | null = null;

  if (entrada.forma === "rendimento") {
    const rendimento = entrada.rendimentoPct;

    if (rendimento == null || !Number.isFinite(rendimento) || rendimento <= 0 || rendimento > 80) {
      return { ok: false, message: "O rendimento é maior que 0 e no máximo 80%." };
    }

    arrobasPagas = deMilhar(Math.round((pesos.peso * rendimento * 10) / 15));
  } else if (entrada.forma === "desconto") {
    if (entrada.linhasDesconto.length > 0) {
      let descontoMilhar = 0;

      for (const linha of entrada.linhasDesconto) {
        if (!linha.descricao.trim()) {
          return { ok: false, message: "Informe o nome de cada desconto." };
        }

        if (!Number.isFinite(linha.arrobas) || linha.arrobas <= 0) {
          return { ok: false, message: "Cada linha de desconto precisa de arrobas maiores que zero." };
        }

        descontoMilhar += milhar(linha.arrobas);
      }

      descontoUsado = deMilhar(descontoMilhar);

      if (
        entrada.descontoArrobas != null &&
        milhar(entrada.descontoArrobas) !== descontoMilhar
      ) {
        return { ok: false, message: "O desconto total tem que ser a soma das linhas." };
      }
    } else if (entrada.descontoArrobas == null || !Number.isFinite(entrada.descontoArrobas) || entrada.descontoArrobas < 0) {
      return { ok: false, message: "Informe o desconto de @." };
    } else {
      descontoUsado = deMilhar(milhar(entrada.descontoArrobas));
    }

    const pagasMilhar = milhar(arrobasVivas) - milhar(descontoUsado);

    if (pagasMilhar < 0) {
      return { ok: false, message: "O desconto não pode passar as @ do peso vivo." };
    }

    arrobasPagas = deMilhar(pagasMilhar);
  } else if (entrada.forma === "arrobas_pagas") {
    if (entrada.arrobasPagas == null || !Number.isFinite(entrada.arrobasPagas) || entrada.arrobasPagas < 0) {
      return { ok: false, message: "Informe as @ pagas." };
    }

    arrobasPagas = deMilhar(milhar(entrada.arrobasPagas));
  } else {
    return { ok: false, message: "Escolha a forma de fechamento." };
  }

  const despesas = despesasDe(entrada.despesas);

  if (!despesas.ok) {
    return despesas;
  }

  const diferencaArrobas = deMilhar(milhar(arrobasVivas) - milhar(arrobasPagas));
  const valorBruto = deCentavos(Math.round((milhar(arrobasPagas) * centavos(entrada.valorArroba)) / 1000));
  const valorLiquido = deCentavos(centavos(valorBruto) - centavos(despesas.total));

  return {
    ok: true,
    qtd: pesos.qtd,
    pesoVivoTotal: pesos.peso,
    arrobasVivas,
    arrobasPagas,
    diferencaArrobas,
    descontoUsado,
    valorBruto,
    despesasTotal: despesas.total,
    valorLiquido,
  };
}

export function exigeCienciaCarencia(
  liberacoes: (string | null)[],
  dataVenda: string,
): boolean {
  return liberacoes.some((data) => data != null && data > dataVenda);
}

export function rotuloDiferenca(diferencaArrobas: number): "acréscimo" | "desconto" | "nenhuma" {
  if (diferencaArrobas < 0) {
    return "acréscimo";
  }

  if (diferencaArrobas > 0) {
    return "desconto";
  }

  return "nenhuma";
}
