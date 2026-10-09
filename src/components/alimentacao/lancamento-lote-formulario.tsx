"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { lancarUsoNoLote } from "@/app/(app)/alimentacao/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatarDecimal, formatarMoeda } from "@/lib/formatacao";
import type { LoteOpcaoEstoque, ProdutoItem } from "@/lib/estoque";
import {
  schemaLancamentoLote,
  valoresPadraoLancamento,
  type LancamentoLoteFormInput,
} from "@/lib/estoque/schema";
import { parseNumeroPt } from "@/lib/animais";

function aplicarErros(
  setError: (
    campo: keyof LancamentoLoteFormInput,
    erro: { message: string },
  ) => void,
  fieldErrors?: Record<string, string[]>,
) {
  if (!fieldErrors) {
    return;
  }

  for (const [campo, mensagens] of Object.entries(fieldErrors)) {
    const mensagem = mensagens[0];

    if (mensagem) {
      setError(campo as keyof LancamentoLoteFormInput, { message: mensagem });
    }
  }
}

export function LancamentoLoteFormulario({
  lotes,
  produtos,
  loteIdInicial,
  onCancelar,
  onSalvo,
}: {
  lotes: LoteOpcaoEstoque[];
  produtos: ProdutoItem[];
  loteIdInicial?: string;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LancamentoLoteFormInput>({
    resolver: zodResolver(schemaLancamentoLote),
    defaultValues: valoresPadraoLancamento(
      loteIdInicial ?? lotes[0]?.id ?? "",
    ),
  });

  const loteId = useWatch({ control, name: "lote_id" });
  const produtoId = useWatch({ control, name: "produto_id" });
  const quantidade = useWatch({ control, name: "quantidade" });

  const lote = lotes.find((item) => item.id === loteId);
  const produto = produtos.find((item) => item.id === produtoId);
  const qtdNum = parseNumeroPt(quantidade ?? "") ?? 0;
  const custoEstimado =
    produto && qtdNum > 0 ? qtdNum * produto.custo_medio : null;
  const porCabeca =
    custoEstimado != null && lote && lote.qtd_animais > 0
      ? custoEstimado / lote.qtd_animais
      : null;

  async function onSubmit(dados: LancamentoLoteFormInput) {
    const resultado = await lancarUsoNoLote(dados);

    if (!resultado.ok) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível lançar.");
      return;
    }

    toast.success(resultado.message);
    onSalvo();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="lanc-lote" className="mb-1.5 text-sm text-texto">
          Lote
        </Label>
        <select
          id="lanc-lote"
          className={CLASSE_CAMPO}
          aria-invalid={errors.lote_id ? true : undefined}
          {...register("lote_id")}
        >
          {lotes.length === 0 ? (
            <option value="">Nenhum lote com animais</option>
          ) : (
            lotes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome} ({item.qtd_animais} cab.)
              </option>
            ))
          )}
        </select>
        {errors.lote_id ? (
          <p className="mt-1 text-sm text-perigo">{errors.lote_id.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="lanc-produto" className="mb-1.5 text-sm text-texto">
          Produto
        </Label>
        <select
          id="lanc-produto"
          className={CLASSE_CAMPO}
          aria-invalid={errors.produto_id ? true : undefined}
          {...register("produto_id")}
        >
          <option value="">Selecione...</option>
          {produtos.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome} — {formatarDecimal(item.estoque_atual, 0)}{" "}
              {item.unidade} · {formatarMoeda(item.custo_medio)}/{item.unidade}
            </option>
          ))}
        </select>
        {errors.produto_id ? (
          <p className="mt-1 text-sm text-perigo">{errors.produto_id.message}</p>
        ) : null}
        {produtos.length === 0 ? (
          <p className="mt-1 text-xs text-texto-suave">
            Cadastre um produto e registre entrada em Estoque primeiro.
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="lanc-qtd" className="mb-1.5 text-sm text-texto">
          Quantidade{produto ? ` (${produto.unidade})` : ""}
        </Label>
        <input
          id="lanc-qtd"
          inputMode="decimal"
          className={CLASSE_CAMPO}
          aria-invalid={errors.quantidade ? true : undefined}
          placeholder="Ex: 1"
          {...register("quantidade")}
        />
        {errors.quantidade ? (
          <p className="mt-1 text-sm text-perigo">{errors.quantidade.message}</p>
        ) : null}
        {produto && qtdNum > produto.estoque_atual ? (
          <p className="mt-1 text-sm text-perigo">
            Estoque disponível: {formatarDecimal(produto.estoque_atual, 2)}{" "}
            {produto.unidade}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lanc-inicio" className="mb-1.5 text-sm text-texto">
            Início do período
          </Label>
          <input
            id="lanc-inicio"
            type="date"
            className={CLASSE_CAMPO}
            aria-invalid={errors.data_inicio ? true : undefined}
            {...register("data_inicio")}
          />
          {errors.data_inicio ? (
            <p className="mt-1 text-sm text-perigo">{errors.data_inicio.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="lanc-fim" className="mb-1.5 text-sm text-texto">
            Fim (opcional)
          </Label>
          <input
            id="lanc-fim"
            type="date"
            className={CLASSE_CAMPO}
            aria-invalid={errors.data_fim ? true : undefined}
            {...register("data_fim")}
          />
          {errors.data_fim ? (
            <p className="mt-1 text-sm text-perigo">{errors.data_fim.message}</p>
          ) : null}
        </div>
      </div>

      {custoEstimado != null ? (
        <p className="rounded-[10px] border border-border bg-muted/50 px-3 py-2 text-sm text-texto-suave">
          Custo estimado{" "}
          <span className="font-medium text-texto">
            {formatarMoeda(custoEstimado)}
          </span>
          {porCabeca != null
            ? ` · ${formatarMoeda(porCabeca)}/cabeça (${lote?.qtd_animais} cab.)`
            : null}
          . Baixa automática do estoque ao confirmar.
        </p>
      ) : null}

      <div>
        <Label htmlFor="lanc-obs" className="mb-1.5 text-sm text-texto">
          Observações
        </Label>
        <Textarea
          id="lanc-obs"
          rows={2}
          className="min-h-[72px] rounded-[10px] border-border"
          placeholder="Ex: 1 saco de sal no cocho do Lote 04"
          {...register("observacoes")}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-[10px]"
          onClick={onCancelar}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="h-10 rounded-[10px]"
          disabled={
            isSubmitting || lotes.length === 0 || produtos.length === 0
          }
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          Lançar e baixar estoque
        </Button>
      </div>
    </form>
  );
}
