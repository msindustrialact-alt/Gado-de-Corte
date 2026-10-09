"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { cadastrarProduto } from "@/app/(app)/estoque/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OPCOES_CATEGORIA, UNIDADES_COMUNS, type CategoriaProduto } from "@/lib/estoque";
import {
  schemaProduto,
  valoresPadraoProduto,
  type ProdutoFormInput,
} from "@/lib/estoque/schema";

function aplicarErros(
  setError: (campo: keyof ProdutoFormInput, erro: { message: string }) => void,
  fieldErrors?: Record<string, string[]>,
) {
  if (!fieldErrors) {
    return;
  }

  for (const [campo, mensagens] of Object.entries(fieldErrors)) {
    const mensagem = mensagens[0];

    if (mensagem) {
      setError(campo as keyof ProdutoFormInput, { message: mensagem });
    }
  }
}

export function ProdutoFormulario({
  categoriaPadrao = "alimentacao",
  onCancelar,
  onSalvo,
}: {
  categoriaPadrao?: CategoriaProduto;
  onCancelar: () => void;
  onSalvo: (id?: string) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormInput>({
    resolver: zodResolver(schemaProduto),
    defaultValues: valoresPadraoProduto(categoriaPadrao),
  });

  async function onSubmit(dados: ProdutoFormInput) {
    const resultado = await cadastrarProduto(dados);

    if (!resultado.ok) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível cadastrar.");
      return;
    }

    toast.success(resultado.message);
    onSalvo(resultado.id);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="produto-nome" className="mb-1.5 text-sm text-texto">
          Nome
        </Label>
        <input
          id="produto-nome"
          autoComplete="off"
          className={CLASSE_CAMPO}
          aria-invalid={errors.nome ? true : undefined}
          placeholder="Ex: Sal mineral 30kg"
          {...register("nome")}
        />
        {errors.nome ? (
          <p className="mt-1 text-sm text-perigo">{errors.nome.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="produto-categoria" className="mb-1.5 text-sm text-texto">
            Categoria
          </Label>
          <select
            id="produto-categoria"
            className={CLASSE_CAMPO}
            {...register("categoria")}
          >
            {OPCOES_CATEGORIA.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="produto-unidade" className="mb-1.5 text-sm text-texto">
            Unidade
          </Label>
          <input
            id="produto-unidade"
            list="unidades-produto"
            className={CLASSE_CAMPO}
            aria-invalid={errors.unidade ? true : undefined}
            {...register("unidade")}
          />
          <datalist id="unidades-produto">
            {UNIDADES_COMUNS.map((unidade) => (
              <option key={unidade} value={unidade} />
            ))}
          </datalist>
          {errors.unidade ? (
            <p className="mt-1 text-sm text-perigo">{errors.unidade.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="produto-obs" className="mb-1.5 text-sm text-texto">
          Observações
        </Label>
        <Textarea
          id="produto-obs"
          rows={2}
          className="min-h-[72px] rounded-[10px] border-border"
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
        <Button type="submit" className="h-10 rounded-[10px]" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          Cadastrar
        </Button>
      </div>
    </form>
  );
}
