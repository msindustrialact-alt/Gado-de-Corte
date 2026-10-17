import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatarData, formatarDecimal, formatarInteiro, formatarMoeda } from "@/lib/formatacao";
import type { VendaAbateResumo } from "@/lib/receitas/data";
import { cn } from "@/lib/utils";

export function ReceitasLista({ vendas }: { vendas: VendaAbateResumo[] }) {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Receitas</h1>
          <p className="mt-1 text-sm text-texto-suave">
            Saída de animais para abate. A venda confirmada baixa o rebanho.
          </p>
        </div>
        <Link
          href="/financeiro/receitas/nova"
          className={cn(buttonVariants(), "h-11 rounded-[10px] px-4 sm:h-10")}
        >
          Nova receita
        </Link>
      </header>
      {vendas.length === 0 ? (
        <p className="rounded-[12px] border border-border bg-card px-4 py-10 text-center text-sm text-texto-suave shadow-card">
          Nenhuma receita de abate ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {vendas.map((venda) => (
            <li key={venda.id}>
              <Link
                href={`/financeiro/receitas/${venda.id}`}
                className="flex flex-col gap-1 rounded-[12px] border border-border bg-card px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-medium text-texto">
                    {venda.compradorNome}
                    {venda.frigorifico ? ` · ${venda.frigorifico}` : ""}
                  </span>
                  <span className="text-xs text-texto-suave">
                    {formatarData(venda.data)}
                    {" · "}
                    {formatarInteiro(venda.qtdAnimais)} animais
                    {" · "}
                    {formatarDecimal(venda.pesoVivoTotal, 1)} kg
                  </span>
                </span>
                <span className="font-semibold text-texto">
                  {formatarMoeda(venda.valorLiquido)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
