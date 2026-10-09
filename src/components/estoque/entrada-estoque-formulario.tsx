"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { registrarEntradaEstoque } from "@/app/(app)/estoque/actions";
import {
  CampoMoeda,
  formatarMoedaValor,
} from "@/components/animais/campo-moeda";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatarDecimal, formatarMoeda } from "@/lib/formatacao";
import type { ProdutoItem } from "@/lib/estoque";
import {
  schemaEntradaEstoque,
  valoresPadraoEntrada,
  type EntradaEstoqueFormInput,
} from "@/lib/estoque/schema";
import { parseNumeroPt } from "@/lib/animais";

function aplicarErros(
  setError: (
    campo: keyof EntradaEstoqueFormInput,
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
      setError(campo as keyof EntradaEstoqueFormInput, { message: mensagem });
    }
  }
}

export function EntradaEstoqueFormulario({
  produtos,
  produtoIdInicial,
  onCancelar,
  onSalvo,
}: {
  produtos: ProdutoItem[];
  produtoIdInicial?: string;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EntradaEstoqueFormInput>({
    resolver: zodResolver(schemaEntradaEstoque),
    defaultValues: valoresPadraoEntrada(produtoIdInicial ?? produtos[0]?.id ?? ""),
  });

  const produtoId = useWatch({ control, name: "produto_id" });
  const quantidade = useWatch({ control, name: "quantidade" });
  const custoUnitario = useWatch({ control, name: "custo_unitario" });

  const produto = produtos.find((item) => item.id === produtoId);
  const qtdNum = parseNumeroPt(quantidade ?? "") ?? 0;
  const custoNum = parseNumeroPt(custoUnitario ?? "") ?? 0;
  const total = qtdNum > 0 && custoNum >= 0 ? qtdNum * custoNum : null;

  async function onSubmit(dados: EntradaEstoqueFormInput) {
    const resultado = await registrarEntradaEstoque(dados);

    if (!resultado.ok) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível registrar a entrada.");
      return;
    }

    toast.success(resultado.message);
    onSalvo();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="entrada-produto" className="mb-1.5 text-sm text-texto">
          Produto
        </Label>
        <select
          id="entrada-produto"
          className={CLASSE_CAMPO}
          aria-invalid={errors.produto_id ? true : undefined}
          {...register("produto_id")}
        >
          {produtos.length === 0 ? (
            <option value="">Cadastre um produto primeiro</option>
          ) : (
            produtos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome} ({formatarDecimal(item.estoque_atual, 0)} {item.unidade})
              </option>
            ))
          )}
        </select>
        {errors.produto_id ? (
          <p className="mt-1 text-sm text-perigo">{errors.produto_id.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="entrada-qtd" className="mb-1.5 text-sm text-texto">
            Quantidade{produto ? ` (${produto.unidade})` : ""}
          </Label>
          <input
            id="entrada-qtd"
            inputMode="decimal"
            className={CLASSE_CAMPO}
            aria-invalid={errors.quantidade ? true : undefined}
            placeholder="Ex: 1"
            {...register("quantidade")}
          />
          {errors.quantidade ? (
            <p className="mt-1 text-sm text-perigo">{errors.quantidade.message}</p>
          ) : null}
        </div>
        <CampoMoeda
          id="entrada-custo"
          rotulo="Custo unitário"
          valor={custoUnitario}
          erro={errors.custo_unitario?.message}
          onChange={(valor) =>
            setValue("custo_unitario", valor || formatarMoedaValor(0), {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />
        <input type="hidden" {...register("custo_unitario")} />
      </div>

      <div>
        <Label htmlFor="entrada-data" className="mb-1.5 text-sm text-texto">
          Data
        </Label>
        <input
          id="entrada-data"
          type="date"
          className={CLASSE_CAMPO}
          aria-invalid={errors.data ? true : undefined}
          {...register("data")}
        />
        {errors.data ? (
          <p className="mt-1 text-sm text-perigo">{errors.data.message}</p>
        ) : null}
      </div>

      {total != null ? (
        <p className="text-sm text-texto-suave">
          Total da entrada:{" "}
          <span className="font-medium text-texto">{formatarMoeda(total)}</span>
        </p>
      ) : null}

      <div>
        <Label htmlFor="entrada-obs" className="mb-1.5 text-sm text-texto">
          Observações
        </Label>
        <Textarea
          id="entrada-obs"
          rows={2}
          className="min-h-[72px] rounded-[10px] border-border"
          placeholder="Nota fiscal, fornecedor..."
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
          disabled={isSubmitting || produtos.length === 0}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          Registrar entrada
        </Button>
      </div>
    </form>
  );
}
