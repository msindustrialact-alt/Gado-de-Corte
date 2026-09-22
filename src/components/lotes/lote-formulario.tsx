"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { atualizarLote, criarLote } from "@/app/(app)/lotes/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hojeISO } from "@/lib/animais";
import type { LoteResumo } from "@/lib/lotes";
import { OPCOES_OBJETIVO, OPCOES_STATUS_LOTE } from "@/lib/lotes";
import {
  schemaLote,
  valoresPadraoLote,
  type LoteFormInput,
} from "@/lib/lotes/schema";
import { cn } from "@/lib/utils";

function aplicarErros(
  setError: (campo: keyof LoteFormInput, erro: { message: string }) => void,
  fieldErrors?: Record<string, string[]>,
) {
  if (!fieldErrors) {
    return;
  }

  for (const [campo, mensagens] of Object.entries(fieldErrors)) {
    const mensagem = mensagens[0];

    if (mensagem) {
      setError(campo as keyof LoteFormInput, { message: mensagem });
    }
  }
}

export function LoteFormulario({
  lote,
  onCancelar,
  onSalvo,
}: {
  lote?: LoteResumo | null;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const edicao = Boolean(lote);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoteFormInput>({
    resolver: zodResolver(schemaLote),
    defaultValues: lote
      ? {
          nome: lote.nome,
          objetivo: lote.objetivo ?? "",
          data_formacao: lote.data_formacao?.slice(0, 10) ?? hojeISO(),
          status: lote.status,
          observacoes: lote.observacoes ?? "",
        }
      : valoresPadraoLote(),
  });

  async function onSubmit(dados: LoteFormInput) {
    const resultado = edicao && lote
      ? await atualizarLote(lote.id, dados)
      : await criarLote(dados);

    if (!resultado.ok) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível salvar o lote.");
      return;
    }

    toast.success(resultado.message ?? (edicao ? "Lote atualizado." : "Lote criado."));
    onSalvo();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="lote-nome" className="mb-1.5 text-sm text-texto">
          Nome
        </Label>
        <input
          id="lote-nome"
          autoComplete="off"
          aria-invalid={errors.nome ? true : undefined}
          className={CLASSE_CAMPO}
          {...register("nome")}
        />
        {errors.nome ? (
          <p className="mt-1 text-sm text-perigo">{errors.nome.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="lote-objetivo" className="mb-1.5 text-sm text-texto">
          Objetivo
        </Label>
        <select
          id="lote-objetivo"
          aria-invalid={errors.objetivo ? true : undefined}
          className={cn(CLASSE_CAMPO, "bg-card")}
          {...register("objetivo")}
        >
          <option value="">Não informado</option>
          {OPCOES_OBJETIVO.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        {errors.objetivo ? (
          <p className="mt-1 text-sm text-perigo">{errors.objetivo.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="lote-formacao" className="mb-1.5 text-sm text-texto">
          Data de formação
        </Label>
        <input
          id="lote-formacao"
          type="date"
          max={hojeISO()}
          aria-invalid={errors.data_formacao ? true : undefined}
          className={CLASSE_CAMPO}
          {...register("data_formacao")}
        />
        {errors.data_formacao ? (
          <p className="mt-1 text-sm text-perigo">
            {errors.data_formacao.message}
          </p>
        ) : null}
      </div>

      {edicao ? (
        <div>
          <Label htmlFor="lote-status" className="mb-1.5 text-sm text-texto">
            Status
          </Label>
          <select
            id="lote-status"
            aria-invalid={errors.status ? true : undefined}
            className={cn(CLASSE_CAMPO, "bg-card")}
            {...register("status")}
          >
            {OPCOES_STATUS_LOTE.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
          {errors.status ? (
            <p className="mt-1 text-sm text-perigo">{errors.status.message}</p>
          ) : null}
        </div>
      ) : (
        <input type="hidden" value="ativo" {...register("status")} />
      )}

      <div>
        <Label htmlFor="lote-obs" className="mb-1.5 text-sm text-texto">
          Observações
        </Label>
        <Textarea
          id="lote-obs"
          rows={3}
          className="rounded-[10px] border-border text-base shadow-none"
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
          {edicao ? "Salvar" : "Criar lote"}
        </Button>
      </div>
    </form>
  );
}
