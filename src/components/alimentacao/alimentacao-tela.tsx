"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Wheat } from "lucide-react";

import { LancamentoLoteFormulario } from "@/components/alimentacao/lancamento-lote-formulario";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { Button, buttonVariants } from "@/components/ui/button";
import { DialogOuSheet } from "@/components/ui/dialog-ou-sheet";
import {
  formatarData,
  formatarDecimal,
  formatarInteiro,
  formatarMoeda,
} from "@/lib/formatacao";
import {
  LABELS_CATEGORIA,
  type LancamentoLoteItem,
  type LoteOpcaoEstoque,
  type ProdutoItem,
} from "@/lib/estoque";
import { cn } from "@/lib/utils";

export function AlimentacaoTela({
  lancamentos,
  lotes,
  produtos,
}: {
  lancamentos: LancamentoLoteItem[];
  lotes: LoteOpcaoEstoque[];
  produtos: ProdutoItem[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  const podeLancar = lotes.length > 0 && produtos.length > 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Alimentação</h1>
          <p className="mt-1 text-sm text-texto-suave">
            Lance insumos por lote — o custo entra na lucratividade e o estoque
            baixa automaticamente
          </p>
        </div>
        <Button
          type="button"
          className="h-10 rounded-[10px] px-4"
          onClick={() => setAberto(true)}
          disabled={!podeLancar}
        >
          <Plus />
          Novo lançamento
        </Button>
      </header>

      {!podeLancar ? (
        <EstadoVazio
          icone={Wheat}
          titulo="Pronto para lançar?"
          descricao={
            produtos.length === 0
              ? "Cadastre um produto e registre entrada no Estoque antes de lançar no lote."
              : "Nenhum lote ativo com animais para ratear o custo."
          }
          acao={
            produtos.length === 0 ? (
              <Link
                href="/estoque"
                className={cn(buttonVariants(), "h-10 rounded-[10px] px-4")}
              >
                Ir para Estoque
              </Link>
            ) : undefined
          }
        />
      ) : null}

      {lancamentos.length === 0 && podeLancar ? (
        <EstadoVazio
          icone={Wheat}
          titulo="Nenhum lançamento ainda"
          descricao="Ex.: 1 saco de sal no Lote 04 — o sistema divide o custo pelas cabeças e baixa o estoque."
          acao={
            <Button
              type="button"
              className="h-10 rounded-[10px] px-4"
              onClick={() => setAberto(true)}
            >
              <Plus />
              Novo lançamento
            </Button>
          }
        />
      ) : null}

      {lancamentos.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-suave">
            {formatarInteiro(lancamentos.length)} lançamento
            {lancamentos.length === 1 ? "" : "s"} recente
            {lancamentos.length === 1 ? "" : "s"}
          </p>
          {lancamentos.map((item) => (
            <article
              key={item.id}
              className="rounded-[12px] border border-border bg-card p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-texto">
                    {item.produto_nome} → {item.lote_nome}
                  </h2>
                  <p className="mt-0.5 text-sm text-texto-suave">
                    {formatarDecimal(item.quantidade, item.quantidade % 1 === 0 ? 0 : 2)}{" "}
                    {item.unidade}
                    {" · "}
                    {formatarData(item.data_inicio)}
                    {item.data_fim ? ` a ${formatarData(item.data_fim)}` : null}
                    {" · "}
                    {LABELS_CATEGORIA[item.categoria]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-texto">
                    {formatarMoeda(item.custo_total)}
                  </p>
                  <p className="text-xs text-texto-suave">
                    {formatarMoeda(item.custo_por_cabeca)}/cab. ·{" "}
                    {item.qtd_cabecas_snapshot} cab.
                  </p>
                </div>
              </div>
              {item.observacoes ? (
                <p className="mt-2 text-sm text-texto-suave">{item.observacoes}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <DialogOuSheet
        aberto={aberto}
        onAbertoChange={setAberto}
        titulo="Lançar uso no lote"
        descricao="O valor usa o custo médio do estoque e baixa a quantidade automaticamente."
      >
        <LancamentoLoteFormulario
          lotes={lotes}
          produtos={produtos}
          onCancelar={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false);
            router.refresh();
          }}
        />
      </DialogOuSheet>
    </div>
  );
}
