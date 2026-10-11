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

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-[12px] border border-border bg-card p-4 shadow-card md:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs text-texto-suave">Lote</span>
          <select
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            className="h-10 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm"
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
            className="h-10"
          />
        </label>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Vacinas</h2>
        <div className="mt-3 space-y-2">
          {vacinasAtivas.map((vacina) => (
            <label key={vacina.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={vacinaIds.includes(vacina.id)}
                onChange={() => toggleVacina(vacina.id)}
              />
              {vacina.nome}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-texto">
            Animais ({animalIds.length}/{animais.length})
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAnimalIds(animais.map((a) => a.id))}
            >
              Todos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAnimalIds([])}
            >
              Limpar
            </Button>
          </div>
        </div>
        <ul className="mt-3 max-h-[320px] space-y-1 overflow-y-auto">
          {animais.map((animal) => (
            <li key={animal.id}>
              <label className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={animalIds.includes(animal.id)}
                  onChange={() => toggleAnimal(animal.id)}
                />
                <span className="font-medium">{animal.brinco}</span>
                {animal.nome ? (
                  <span className="text-texto-suave">{animal.nome}</span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <label className="block rounded-[12px] border border-border bg-card p-4 shadow-card">
        <span className="mb-1 block text-xs text-texto-suave">Observações</span>
        <Input
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="h-10"
        />
      </label>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={enviar}
          disabled={
            pendente || !loteId || vacinaIds.length === 0 || animalIds.length === 0
          }
        >
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
    </div>
  );
}
