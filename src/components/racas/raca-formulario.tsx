"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  cadastrarRaca,
  renomearRaca,
} from "@/app/(app)/cadastros/racas/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { RacaItem } from "@/lib/racas";
import { schemaRaca, type RacaFormInput } from "@/lib/racas/schema";

function aplicarErros(
  setError: (campo: keyof RacaFormInput, erro: { message: string }) => void,
  fieldErrors?: Record<string, string[]>,
) {
  if (!fieldErrors) {
    return;
  }

  for (const [campo, mensagens] of Object.entries(fieldErrors)) {
    const mensagem = mensagens[0];

    if (mensagem) {
      setError(campo as keyof RacaFormInput, { message: mensagem });
    }
  }
}

export function RacaFormulario({
  raca,
  onCancelar,
  onSalvo,
}: {
  raca?: RacaItem | null;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const edicao = Boolean(raca);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RacaFormInput>({
    resolver: zodResolver(schemaRaca),
    defaultValues: { nome: raca?.nome ?? "" },
  });

  async function onSubmit(dados: RacaFormInput) {
    const resultado =
      edicao && raca
        ? await renomearRaca(raca.id, dados)
        : await cadastrarRaca(dados);

    if (!resultado.ok) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível salvar a raça.");
      return;
    }

    toast.success(resultado.message ?? (edicao ? "Raça atualizada." : "Raça cadastrada."));
    onSalvo();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="raca-nome" className="mb-1.5 text-sm text-texto">
          Nome
        </Label>
        <input
          id="raca-nome"
          autoComplete="off"
          aria-invalid={errors.nome ? true : undefined}
          className={CLASSE_CAMPO}
          {...register("nome")}
        />
        {errors.nome ? (
          <p className="mt-1 text-sm text-perigo">{errors.nome.message}</p>
        ) : null}
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
          {edicao ? "Salvar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
