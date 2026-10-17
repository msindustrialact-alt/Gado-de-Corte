import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatarData, formatarDecimal, formatarMoeda } from "@/lib/formatacao";
import { rotuloDiferenca, type FormaVendaAbate } from "@/lib/receitas/calculo";
import type { VendaAbateDetalhe } from "@/lib/receitas/data";
import { cn } from "@/lib/utils";

const FORMAS: Record<FormaVendaAbate, string> = {
  rendimento: "Rendimento da carcaça",
  desconto: "Desconto de arrobas",
  arrobas_pagas: "Arrobas pagas",
};

export function ReceitaDetalhe({ venda }: { venda: VendaAbateDetalhe }) {
  const diferenca = rotuloDiferenca(venda.diferencaArrobas);
  const arrobasDif = Math.abs(venda.diferencaArrobas);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">{venda.compradorNome}</h1>
          <p className="mt-1 text-sm text-texto-suave">
            {formatarData(venda.data)}
            {venda.frigorifico ? ` · ${venda.frigorifico}` : ""}
            {venda.cidade ? ` · ${venda.cidade}` : ""}
          </p>
        </div>
        <Link
          href="/financeiro/receitas"
          className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-[10px] px-4")}
        >
          Voltar
        </Link>
      </header>

      <section className="grid gap-3 rounded-[12px] border border-border bg-card p-4 shadow-card sm:grid-cols-2">
        <Campo rotulo="Documento" valor={venda.compradorDocumento ?? "—"} />
        <Campo rotulo="Forma" valor={FORMAS[venda.forma]} />
        {venda.rendimentoPct != null ? (
          <Campo rotulo="Rendimento" valor={`${formatarDecimal(venda.rendimentoPct, 2)}%`} />
        ) : null}
        <Campo rotulo="Animais" valor={String(venda.qtdAnimais)} />
        <Campo rotulo="Peso vivo" valor={`${formatarDecimal(venda.pesoVivoTotal, 1)} kg`} />
        <Campo rotulo="@ viva" valor={formatarDecimal(venda.arrobasVivas, 3)} />
        <Campo rotulo="@ pagas" valor={formatarDecimal(venda.arrobasPagas, 3)} />
        <Campo
          rotulo="Diferença"
          valor={
            diferenca === "nenhuma"
              ? "Nenhuma"
              : `${formatarDecimal(arrobasDif, 3)} @ de ${diferenca}`
          }
        />
        <Campo rotulo="Valor da @" valor={formatarMoeda(venda.valorArroba)} />
        <Campo rotulo="Valor bruto" valor={formatarMoeda(venda.valorBruto)} />
        <Campo rotulo="Despesas" valor={formatarMoeda(venda.despesasTotal)} />
        <Campo rotulo="Valor líquido" valor={formatarMoeda(venda.valorLiquido)} />
        {venda.cienciaCarencia ? <Campo rotulo="Carência" valor="Ciência confirmada" /> : null}
      </section>

      {venda.descontos.length > 0 ? (
        <Lista
          titulo="Descontos de @"
          linhas={venda.descontos.map((linha) => ({
            nome: linha.descricao,
            valor: `${formatarDecimal(linha.arrobas, 3)} @`,
          }))}
        />
      ) : null}
      {venda.despesas.length > 0 ? (
        <Lista
          titulo="Outras despesas"
          linhas={venda.despesas.map((linha) => ({
            nome: linha.descricao,
            valor: formatarMoeda(linha.valor),
          }))}
        />
      ) : null}

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Animais</h2>
        <ul className="mt-3 space-y-2">
          {venda.animais.map((animal) => (
            <li key={animal.id} className="flex items-start justify-between gap-3 text-sm">
              <span>
                <Link href={`/animais/${animal.animalId}`} className="font-medium text-texto">
                  {animal.brinco}
                </Link>
                <span className="block text-xs text-texto-suave">
                  {animal.loteNome ?? "Sem lote"}
                  {animal.carenciaAte
                    ? ` · carência até ${formatarData(animal.carenciaAte)}`
                    : ""}
                </span>
              </span>
              <span className="text-texto">{formatarDecimal(animal.pesoKg, 1)} kg</span>
            </li>
          ))}
        </ul>
      </section>

      {venda.observacoes ? (
        <p className="text-sm text-texto-suave">{venda.observacoes}</p>
      ) : null}
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p>
      <span className="block text-xs text-texto-suave">{rotulo}</span>
      <span className="text-sm font-medium text-texto">{valor}</span>
    </p>
  );
}

function Lista({
  titulo,
  linhas,
}: {
  titulo: string;
  linhas: { nome: string; valor: string }[];
}) {
  return (
    <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
      <h2 className="text-sm font-semibold text-texto">{titulo}</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {linhas.map((linha) => (
          <li key={`${linha.nome}-${linha.valor}`} className="flex justify-between gap-3">
            <span className="text-texto">{linha.nome}</span>
            <span className="text-texto-suave">{linha.valor}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
