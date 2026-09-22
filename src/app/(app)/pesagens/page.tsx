import type { Metadata } from "next";

import { PesagensTela } from "@/components/pesagens/pesagens-tela";
import { getIndicadoresPesagem, getPesagens } from "@/lib/pesagens/data";

export const metadata: Metadata = {
  title: "Pesagens | Fazendas Joana e Cataguá",
};

export default async function PaginaPesagens() {
  const [pesagens, indicadores] = await Promise.all([
    getPesagens(),
    getIndicadoresPesagem(),
  ]);

  return (
    <PesagensTela
      pesagens={pesagens}
      indicadores={{
        pesagensMes: indicadores.pesagensMes,
        gmdMedio: indicadores.gmdMedio,
        custoArroba: indicadores.custoArroba,
        lotesAtrasados: indicadores.lotesAtrasados,
      }}
    />
  );
}
