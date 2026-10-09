import type { Metadata } from "next";

import { AlimentacaoTela } from "@/components/alimentacao/alimentacao-tela";
import {
  getLancamentosRecentes,
  getLotesComCabecas,
  getProdutos,
} from "@/lib/estoque/data";

export const metadata: Metadata = {
  title: "Alimentação | Fazendas Joana e Cataguá",
};

export default async function PaginaAlimentacao() {
  const [lancamentos, lotes, produtos] = await Promise.all([
    getLancamentosRecentes(),
    getLotesComCabecas(),
    getProdutos({ soAtivos: true, comEstoque: true }),
  ]);

  return (
    <AlimentacaoTela
      lancamentos={lancamentos}
      lotes={lotes}
      produtos={produtos}
    />
  );
}
