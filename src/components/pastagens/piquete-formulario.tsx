"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { atualizarPiquete, criarPiquete } from "@/app/(app)/pastagens/actions";
import { CampoNumero } from "@/components/animais/campo-numero";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { TipoPastagemCombobox } from "@/components/pastagens/tipo-pastagem-combobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OPCOES_STATUS_PIQUETE, type PiqueteResumo } from "@/lib/pastagens";
import {
  schemaPiquete,
  VALORES_PADRAO_PIQUETE,
  type PiqueteFormInput,
} from "@/lib/pastagens/schema";
import { cn } from "@/lib/utils";

function numeroCampo(valor: number | null | undefined): string {
  if (valor == null) {
    return "";
  }

  if (Math.abs(valor - Math.round(valor)) < 0.005) {
    return String(Math.round(valor));
  }

  return String(valor).replace(".", ",");
}

function aplicarErros(
  setError: (campo: keyof PiqueteFormInput, erro: { message: string }) => void,
  fieldErrors?: Record<string, string[]>,
) {
  if (!fieldErrors) {
    return;
  }

  for (const [campo, mensagens] of Object.entries(fieldErrors)) {
    const mensagem = mensagens[0];

    if (mensagem) {
      setError(campo as keyof PiqueteFormInput, { message: mensagem });
    }
  }
}

export function PiqueteFormulario({
  piquete,
  onCancelar,
  onSalvo,
}: {
  piquete?: PiqueteResumo | null;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const edicao = Boolean(piquete);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PiqueteFormInput>({
    resolver: zodResolver(schemaPiquete),
    defaultValues: piquete
      ? {
          nome: piquete.nome,
          area_ha: numeroCampo(piquete.area_ha),
          tipo_pastagem: piquete.tipo_pastagem ?? "",
          capacidade_ua: numeroCampo(piquete.capacidade_ua),
          status: piquete.status,
          observacoes: piquete.observacoes ?? "",
        }
      : VALORES_PADRAO_PIQUETE,
  });

  async function onSubmit(dados: PiqueteFormInput) {
    const resultado =
      edicao && piquete
        ? await atualizarPiquete(piquete.id, dados)
        : await criarPiquete(dados);

    if (!resultado.ok) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível salvar o piquete.");
      return;
    }

    toast.success(
      resultado.message ?? (edicao ? "Piquete atualizado." : "Piquete criado."),
    );
    onSalvo();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="piquete-nome" className="mb-1.5 text-sm text-texto">
          Nome
        </Label>
        <input
          id="piquete-nome"
          autoComplete="off"
          aria-invalid={errors.nome ? true : undefined}
          className={CLASSE_CAMPO}
          {...register("nome")}
        />
        {errors.nome ? (
          <p className="mt-1 text-sm text-perigo">{errors.nome.message}</p>
        ) : null}
      </div>

      <CampoNumero
        id="piquete-area"
        rotulo="Área"
        sufixo="ha"
        valor={watch("area_ha")}
        erro={errors.area_ha?.message}
        onChange={(valor) =>
          setValue("area_ha", valor, { shouldDirty: true, shouldValidate: true })
        }
      />

      <TipoPastagemCombobox
        id="piquete-tipo"
        valor={watch("tipo_pastagem")}
        erro={errors.tipo_pastagem?.message}
        onChange={(valor) =>
          setValue("tipo_pastagem", valor, { shouldDirty: true })
        }
      />

      <CampoNumero
        id="piquete-capacidade"
        rotulo="Capacidade"
        sufixo="UA"
        valor={watch("capacidade_ua")}
        erro={errors.capacidade_ua?.message}
        onChange={(valor) =>
          setValue("capacidade_ua", valor, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />

      <div>
        <Label htmlFor="piquete-status" className="mb-1.5 text-sm text-texto">
          Status
        </Label>
        <select
          id="piquete-status"
          aria-invalid={errors.status ? true : undefined}
          className={cn(CLASSE_CAMPO, "bg-card")}
          {...register("status")}
        >
          {OPCOES_STATUS_PIQUETE.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        {errors.status ? (
          <p className="mt-1 text-sm text-perigo">{errors.status.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="piquete-obs" className="mb-1.5 text-sm text-texto">
          Observações
        </Label>
        <Textarea
          id="piquete-obs"
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
          {edicao ? "Salvar" : "Criar piquete"}
        </Button>
      </div>
    </form>
  );
}
