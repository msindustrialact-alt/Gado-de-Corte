"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  aplicarVacinaLoteAction,
  listarAnimaisDoLoteAction,
} from "@/app/(app)/sanidade/vacinas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hojeISO } from "@/lib/animais";
import type { AnimalVacinaRow, ProtocoloComItens, Vacina } from "@/lib/vacinas/data";
import type { LoteResumo } from "@/lib/lotes";
import { cn } from "@/lib/utils";

export function AplicarLoteTela({
  lotes,
  loteIdInicial,
  vacinas,
  protocolo,
  animaisIniciais,
}: {
  lotes: LoteResumo[];
  loteIdInicial: string;
  vacinas: Vacina[];
  protocolo: ProtocoloComItens | null;
  animaisIniciais: AnimalVacinaRow[];
}) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const [loteId, setLoteId] = useState(loteIdInicial || lotes[0]?.id || "");
  const [data, setData] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [vacinaIds, setVacinaIds] = useState<string[]>(
    protocolo?.itens.map((i) => i.vacina_id) ?? [],
  );
  const [animais, setAnimais] = useState(animaisIniciais);
  const [animalIds, setAnimalIds] = useState(
    animaisIniciais.map((a) => a.id),
  );

  useEffect(() => {
    if (!loteId) {
      return;
    }

    let cancelado = false;
    startTransition(async () => {
      const lista = await listarAnimaisDoLoteAction(loteId);
      if (cancelado) return;
      setAnimais(lista);
      setAnimalIds(lista.map((a) => a.id));
    });

    return () => {
      cancelado = true;
    };
  }, [loteId]);

  const vacinasAtivas = useMemo(
    () => vacinas.filter((v) => v.ativa),
    [vacinas],
  );

  function toggleVacina(id: string) {
    setVacinaIds((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  function toggleAnimal(id: string) {
    setAnimalIds((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  function enviar() {
    startTransition(async () => {
      const resultado = await aplicarVacinaLoteAction({
        lote_id: loteId,
        data,
        vacina_ids: vacinaIds,
        animal_ids: animalIds,
        observacoes,
      });

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível registrar.");
        return;
      }

      toast.success(resultado.message ?? "Vacinação registrada.");
      router.push("/sanidade/vacinas");
      router.refresh();
    });
  }

  const podeEnviar =
    !pendente && !!loteId && vacinaIds.length > 0 && animalIds.length > 0;

  return (
    <div className="space-y-4 pb-36 md:pb-0">
      <section className="grid gap-3 rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4 md:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs text-texto-suave">Lote</span>
          <select
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm md:h-10"
          >
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs text-texto-suave">
            Data de realização
          </span>
          <Input
            type="date"
            value={data}
            max={hojeISO()}
            onChange={(e) => setData(e.target.value)}
            className="h-11 md:h-10"
          />
        </label>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <h2 className="text-sm font-semibold text-texto">Vacinas</h2>
        <p className="mt-0.5 text-xs text-texto-suave">
          Toque para escolher quais aplicar nesta sessão.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {vacinasAtivas.map((vacina) => {
            const ativa = vacinaIds.includes(vacina.id);
            return (
              <button
                key={vacina.id}
                type="button"
                onClick={() => toggleVacina(vacina.id)}
                className={cn(
                  "min-h-11 rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors",
                  ativa
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-texto",
                )}
              >
                {vacina.nome}
                {vacina.intervalo_dias != null ? (
                  <span className="mt-0.5 block text-[11px] font-normal text-texto-suave">
                    reforço {vacina.intervalo_dias}d
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-texto">
            Animais ({animalIds.length}/{animais.length})
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-[10px]"
              onClick={() => setAnimalIds(animais.map((a) => a.id))}
            >
              Todos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-[10px]"
              onClick={() => setAnimalIds([])}
            >
              Limpar
            </Button>
          </div>
        </div>
        <ul className="mt-3 max-h-[min(50vh,360px)] space-y-1.5 overflow-y-auto">
          {animais.map((animal) => {
            const marcado = animalIds.includes(animal.id);
            return (
              <li key={animal.id}>
                <button
                  type="button"
                  onClick={() => toggleAnimal(animal.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left text-sm",
                    marcado
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border text-[11px]",
                      marcado
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {marcado ? "✓" : ""}
                  </span>
                  <span className="min-w-0">
                    <span className="font-semibold text-texto">
                      {animal.brinco}
                    </span>
                    {animal.nome ? (
                      <span className="ml-2 text-texto-suave">
                        {animal.nome}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <label className="block rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <span className="mb-1 block text-xs text-texto-suave">Observações</span>
        <Input
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="h-11 md:h-10"
        />
      </label>

      <div className="hidden gap-2 md:flex">
        <Button type="button" onClick={enviar} disabled={!podeEnviar}>
          Registrar vacinação
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/sanidade/vacinas")}
        >
          Cancelar
        </Button>
      </div>

      <div className="fixed inset-x-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden bottom-[calc(5.25rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-[10px]"
            onClick={() => router.push("/sanidade/vacinas")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-11 flex-[1.4] rounded-[10px]"
            onClick={enviar}
            disabled={!podeEnviar}
          >
            Registrar
          </Button>
        </div>
      </div>
    </div>
  );
}
