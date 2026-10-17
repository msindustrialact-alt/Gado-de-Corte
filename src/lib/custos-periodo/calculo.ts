import { kgParaArroba } from "@/lib/pesagens";

export type CategoriaCusto = "alimentacao" | "sanidade" | "outro";

export type LancamentoPeriodo = {
  id: string;
  data_inicio: string;
  data_fim: string | null;
  categoria: CategoriaCusto;
  custo_total: number;
  produto_nome: string;
  quantidade: number;
  unidade: string;
};

export type LinhaCustoPeriodo = LancamentoPeriodo & {
  grupo: "periodo" | "anterior";
};

export type ParteMl = {
  loteId: string | null;
  cabecas: number;
  ml: number;
  custo: number;
};

export type PesagemCusto = {
  data: string;
  loteId: string;
  custo: number | null;
  ganhoKg: number | null;
  fotos: { categoria: CategoriaCusto; valor: number }[];
};

const CATEGORIAS: CategoriaCusto[] = ["alimentacao", "sanidade", "outro"];

export function centavos(valor: number): number {
  return Math.round(valor * 100);
}

export function deCentavos(valor: number): number {
  return valor / 100;
}

export function milesimos(valor: number): number {
  return Math.round(valor * 1000);
}

export function deMilesimos(valor: number): number {
  return valor / 1000;
}

export function diaSeguinte(iso: string): string {
  const data = new Date(`${iso}T00:00:00`);
  data.setDate(data.getDate() + 1);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function classificarLancamentos(
  lancamentos: LancamentoPeriodo[],
  dataPesagem: string,
  dataPesagemAnterior: string | null,
): LinhaCustoPeriodo[] {
  const linhas: LinhaCustoPeriodo[] = [];

  for (const item of lancamentos) {
    if (item.data_inicio > dataPesagem) {
      continue;
    }

    if (dataPesagemAnterior == null) {
      linhas.push({ ...item, grupo: "periodo" });
      continue;
    }

    if (
      item.data_inicio > dataPesagemAnterior &&
      item.data_inicio <= dataPesagem
    ) {
      linhas.push({ ...item, grupo: "periodo" });
      continue;
    }

    const cruza =
      item.data_inicio <= dataPesagemAnterior &&
      (item.data_fim == null || item.data_fim >= diaSeguinte(dataPesagemAnterior));

    if (cruza) {
      linhas.push({ ...item, grupo: "anterior" });
    }
  }

  return linhas;
}

export function custoArrobaPonderado(
  pesagens: { custo: number | null; ganhoKg: number | null }[],
): number | null {
  let custoCent = 0;
  let arrobas = 0;

  for (const pesagem of pesagens) {
    if (pesagem.custo == null || pesagem.ganhoKg == null || pesagem.ganhoKg <= 0) {
      continue;
    }

    const ganhoArroba = kgParaArroba(pesagem.ganhoKg);

    if (ganhoArroba <= 0) {
      continue;
    }

    custoCent += centavos(pesagem.custo);
    arrobas += ganhoArroba;
  }

  if (arrobas <= 0) {
    return null;
  }

  return deCentavos(custoCent) / arrobas;
}

export function repartirCategorias(
  campo: number,
  fotos: { categoria: CategoriaCusto; valor: number }[],
): Record<CategoriaCusto, number> {
  const resultado: Record<CategoriaCusto, number> = {
    alimentacao: 0,
    sanidade: 0,
    outro: 0,
  };

  if (fotos.length === 0) {
    resultado.alimentacao = deCentavos(centavos(campo));
    return resultado;
  }

  const soma = fotos.reduce((total, foto) => total + centavos(foto.valor), 0);

  if (soma <= 0) {
    resultado.alimentacao = deCentavos(centavos(campo));
    return resultado;
  }

  const alvo = centavos(campo);

  if (soma === alvo) {
    for (const foto of fotos) {
      resultado[foto.categoria] += foto.valor;
    }

    return resultado;
  }

  let usado = 0;
  const presentes = CATEGORIAS.filter((categoria) =>
    fotos.some((foto) => foto.categoria === categoria),
  );

  presentes.forEach((categoria, indice) => {
    const parte = fotos
      .filter((foto) => foto.categoria === categoria)
      .reduce((total, foto) => total + centavos(foto.valor), 0);
    const valor =
      indice === presentes.length - 1
        ? alvo - usado
        : Math.round((alvo * parte) / soma);
    usado += valor;
    resultado[categoria] = deCentavos(valor);
  });

  return resultado;
}

export function somarCategorias(
  pesagens: PesagemCusto[],
): Record<CategoriaCusto, number> {
  const total: Record<CategoriaCusto, number> = {
    alimentacao: 0,
    sanidade: 0,
    outro: 0,
  };

  for (const pesagem of pesagens) {
    if (pesagem.custo == null) {
      continue;
    }

    const partes = repartirCategorias(pesagem.custo, pesagem.fotos);

    for (const categoria of CATEGORIAS) {
      total[categoria] = deCentavos(centavos(total[categoria] + partes[categoria]));
    }
  }

  return total;
}

export function ratearMl(
  mlTotal: number,
  custoUnitario: number,
  grupos: { loteId: string | null; cabecas: number }[],
): ParteMl[] {
  const validos = grupos.filter((grupo) => grupo.cabecas > 0);
  const cabecas = validos.reduce((total, grupo) => total + grupo.cabecas, 0);

  if (cabecas <= 0 || mlTotal <= 0) {
    return [];
  }

  let mlRestante = milesimos(mlTotal);
  let custoRestante = centavos(deMilesimos(mlRestante) * custoUnitario);

  return validos.map((grupo, indice) => {
    const ultimo = indice === validos.length - 1;
    const ml = ultimo
      ? mlRestante
      : Math.round((milesimos(mlTotal) * grupo.cabecas) / cabecas);
    const custo = ultimo
      ? custoRestante
      : Math.round((centavos(deMilesimos(milesimos(mlTotal)) * custoUnitario) * grupo.cabecas) / cabecas);

    mlRestante -= ml;
    custoRestante -= custo;

    return {
      loteId: grupo.loteId,
      cabecas: grupo.cabecas,
      ml: deMilesimos(ml),
      custo: deCentavos(custo),
    };
  });
}
