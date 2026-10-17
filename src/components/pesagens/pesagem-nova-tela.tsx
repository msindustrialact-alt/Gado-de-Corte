"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { criarPesagem } from "@/app/(app)/pesagens/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { CampoMoeda } from "@/components/animais/campo-moeda";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LoteResumo } from "@/lib/lotes";
import {
  OPCOES_CONDICAO_PESAGEM,
  TEXTO_DICA_JEJUM,
} from "@/lib/pesagens";
import {
  schemaNovaPesagem,
  valoresPadraoNovaPesagem,
  type NovaPesagemInput,
} from "@/lib/pesagens/schema";
import { cn } from "@/lib/utils";
import Link from "next/link";

function aplicarErros(
  setError: (campo: keyof NovaPesagemInput, erro: { message: string }) => void,
  fieldErrors?: Record<string, string[]>,
) {
  if (!fieldErrors) {
    return;
  }

  for (const [campo, mensagens] of Object.entries(fieldErrors)) {
    const mensagem = mensagens[0];

    if (mensagem) {
      setError(campo as keyof NovaPesagemInput, { message: mensagem });
    }
  }
}

export function PesagemNovaTela({
  lotes,
  loteId,
}: {
  lotes: LoteResumo[];
  loteId: string;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovaPesagemInput>({
    resolver: zodResolver(schemaNovaPesagem),
    defaultValues: valoresPadraoNovaPesagem(loteId),
  });

  const loteSelecionado = lotes.find((lote) => lote.id === watch("lote_id"));

  async function onSubmit(dados: NovaPesagemInput) {
    const resultado = await criarPesagem(dados);

    if (!resultado.ok || !resultado.id) {
      aplicarErros(setError, resultado.fieldErrors);
      toast.error(resultado.message ?? "Não foi possível iniciar a pesagem.");
      return;
    }

    toast.success(resultado.message ?? "Pesagem iniciada.");
    router.push(`/pesagens/${resultado.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <header>
        <p className="text-xs font-medium tracking-[0.18em] text-texto-suave uppercase">
          Sessão na balança
        </p>
        <h1 className="mt-1 text-2xl font-bold text-texto">Nova pesagem</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Escolha o lote que veio ao curral. Os pesos entram na tela seguinte,
          animal a animal.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-[12px] border border-border bg-card p-4 shadow-card md:p-5"
      >
        <div>
          <Label htmlFor="lote_id" className="mb-1.5 text-sm text-texto">
            Lote
          </Label>
          <select
            id="lote_id"
            className={CLASSE_CAMPO}
            aria-invalid={errors.lote_id ? true : undefined}
            {...register("lote_id")}
          >
            <option value="">Selecione o lote</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.nome}
                {lote.qtd_animais > 0 ? ` · ${lote.qtd_animais} animais` : ""}
              </option>
            ))}
          </select>
          {errors.lote_id ? (
            <p className="mt-1 text-sm text-perigo">{errors.lote_id.message}</p>
          ) : null}
          {loteSelecionado ? (
            <p className="mt-1.5 text-xs text-texto-suave">
              Peso médio atual:{" "}
              {loteSelecionado.peso_medio != null
                ? `${loteSelecionado.peso_medio.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kg`
                : "sem peso"}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="data" className="mb-1.5 text-sm text-texto">
            Data da pesagem
          </Label>
          <input
            id="data"
            type="date"
            className={CLASSE_CAMPO}
            aria-invalid={errors.data ? true : undefined}
            {...register("data")}
          />
          {errors.data ? (
            <p className="mt-1 text-sm text-perigo">{errors.data.message}</p>
          ) : null}
        </div>

        <CampoMoeda
          id="custo_alimentacao"
          rotulo="Custo do período (opcional)"
          valor={watch("custo_alimentacao")}
          erro={errors.custo_alimentacao?.message}
          onChange={(valor) =>
            setValue("custo_alimentacao", valor, { shouldDirty: true })
          }
        />
        <p className="-mt-2 text-xs text-texto-suave">
          Na sessão dá para buscar suplementação, medicamentos e outros entre as pesagens.
        </p>

        <div>
          <Label htmlFor="condicao_pesagem" className="mb-1.5 text-sm text-texto">
            Condição da pesagem (opcional)
          </Label>
          <select
            id="condicao_pesagem"
            className={CLASSE_CAMPO}
            {...register("condicao_pesagem")}
          >
            {OPCOES_CONDICAO_PESAGEM.map((opcao) => (
              <option key={opcao.valor || "vazio"} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-texto-suave">{TEXTO_DICA_JEJUM}</p>
        </div>

        <div>
          <Label htmlFor="observacoes" className="mb-1.5 text-sm text-texto">
            Observações
          </Label>
          <Textarea
            id="observacoes"
            rows={3}
            placeholder="Chuva, mudança de dieta, manejo..."
            className="min-h-24 rounded-[10px] border-border"
            {...register("observacoes")}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Link
            href="/pesagens"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-[10px] px-4",
            )}
          >
            Cancelar
          </Link>
          <Button type="submit" className="h-10 rounded-[10px] px-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Ir para a balança
          </Button>
        </div>
      </form>
    </div>
  );
}
