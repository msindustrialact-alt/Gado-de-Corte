"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package, PackagePlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { desativarProduto } from "@/app/(app)/estoque/actions";
import { EntradaEstoqueFormulario } from "@/components/estoque/entrada-estoque-formulario";
import { ProdutoFormulario } from "@/components/estoque/produto-formulario";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { Button } from "@/components/ui/button";
import { DialogOuSheet } from "@/components/ui/dialog-ou-sheet";
import { formatarDecimal, formatarInteiro, formatarMoeda } from "@/lib/formatacao";
import {
  LABELS_CATEGORIA,
  type ProdutoItem,
} from "@/lib/estoque";

export function EstoqueTela({ produtos }: { produtos: ProdutoItem[] }) {
  const router = useRouter();
  const [novoAberto, setNovoAberto] = useState(false);
  const [entradaAberto, setEntradaAberto] = useState(false);
  const [produtoEntradaId, setProdutoEntradaId] = useState<string | undefined>();
  const [pendente, startTransition] = useTransition();

  function abrirEntrada(produtoId?: string) {
    setProdutoEntradaId(produtoId);
    setEntradaAberto(true);
  }

  function desativar(produto: ProdutoItem) {
    startTransition(async () => {
      const resultado = await desativarProduto(produto.id);

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível desativar.");
        return;
      }

      toast.success(resultado.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Estoque</h1>
          <p className="mt-1 text-sm text-texto-suave">
            {produtos.length === 0
              ? "Cadastre insumos e medicamentos"
              : `${formatarInteiro(produtos.length)} produto${produtos.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-[10px] px-4"
            onClick={() => abrirEntrada()}
            disabled={produtos.length === 0}
          >
            <PackagePlus />
            Entrada
          </Button>
          <Button
            type="button"
            className="h-10 rounded-[10px] px-4"
            onClick={() => setNovoAberto(true)}
          >
            <Plus />
            Novo produto
          </Button>
        </div>
      </header>

      {produtos.length === 0 ? (
        <EstadoVazio
          icone={Package}
          titulo="Nenhum produto no estoque"
          descricao="Cadastre sal, ração, medicamentos e registre a primeira entrada."
          acao={
            <Button
              type="button"
              className="h-10 rounded-[10px] px-4"
              onClick={() => setNovoAberto(true)}
            >
              <Plus />
              Novo produto
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {produtos.map((produto) => (
            <article
              key={produto.id}
              className="flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-texto">
                    {produto.nome}
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-texto-suave">
                    {LABELS_CATEGORIA[produto.categoria]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-texto-suave">
                  Saldo{" "}
                  <span className="font-medium text-texto">
                    {formatarDecimal(produto.estoque_atual, produto.estoque_atual % 1 === 0 ? 0 : 2)}{" "}
                    {produto.unidade}
                  </span>
                  {" · "}
                  Custo médio {formatarMoeda(produto.custo_medio)}/{produto.unidade}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-[10px] px-3"
                  onClick={() => abrirEntrada(produto.id)}
                >
                  Entrada
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-[10px] px-3 text-texto-suave"
                  disabled={pendente}
                  onClick={() => desativar(produto)}
                >
                  Desativar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <DialogOuSheet
        aberto={novoAberto}
        onAbertoChange={setNovoAberto}
        titulo="Novo produto"
        descricao="O produto fica disponível para entradas e lançamentos nos lotes."
      >
        <ProdutoFormulario
          onCancelar={() => setNovoAberto(false)}
          onSalvo={(id) => {
            setNovoAberto(false);
            router.refresh();
            if (id) {
              setTimeout(() => abrirEntrada(id), 0);
            }
          }}
        />
      </DialogOuSheet>

      <DialogOuSheet
        aberto={entradaAberto}
        onAbertoChange={setEntradaAberto}
        titulo="Entrada de estoque"
        descricao="Atualiza o saldo e o custo médio ponderado do produto."
      >
        <EntradaEstoqueFormulario
          key={produtoEntradaId ?? "entrada"}
          produtos={produtos}
          produtoIdInicial={produtoEntradaId}
          onCancelar={() => setEntradaAberto(false)}
          onSalvo={() => {
            setEntradaAberto(false);
            router.refresh();
          }}
        />
      </DialogOuSheet>
    </div>
  );
}
