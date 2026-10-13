"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  listarAnimaisMedicacao,
  registrarMedicacaoAction,
} from "@/app/(app)/sanidade/medicacoes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hojeISO } from "@/lib/animais";
import {
  LABELS_VIA,
  textoCarencia,
  type AnimalMedicacao,
  type Medicamento,
} from "@/lib/medicacoes/tipos";
import type { LoteResumo } from "@/lib/lotes";
import { cn } from "@/lib/utils";

export function RegistrarMedicacaoTela({
  medicamentos,
  lotes,
  loteInicial,
  animaisIniciais,
  animaisMarcados,
}: {
  medicamentos: Medicamento[];
  lotes: LoteResumo[];
  loteInicial: string;
  animaisIniciais: AnimalMedicacao[];
  animaisMarcados: string[];
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [medicamentoId, setMedicamentoId] = useState(medicamentos[0]?.id ?? "");
  const [dose, setDose] = useState(medicamentos[0]?.dose ?? "");
  const [loteId, setLoteId] = useState(loteInicial);
  const [data, setData] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [animais, setAnimais] = useState(animaisIniciais);
  const [animalIds, setAnimalIds] = useState(animaisMarcados);

  function trocarLote(proximo: string) {
    setLoteId(proximo);
    iniciar(async () => {
      const lista = await listarAnimaisMedicacao(proximo);
      setAnimais(lista);
      setAnimalIds(lista.map((animal) => animal.id));
    });
  }

  function alternar(id: string) {
    setAnimalIds((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    );
  }

  function enviar() {
    iniciar(async () => {
      const resultado = await registrarMedicacaoAction({
        medicamentoId,
        loteId,
        data,
        animalIds,
        observacoes,
        dose,
      });

      if (!resultado.ok) {
        toast.error(resultado.message);
        return;
      }

      const aviso =
        resultado.ignorados > 0
          ? ` ${resultado.ignorados} já tinham esse registro e ficaram de fora.`
          : "";
      toast.success(
        resultado.quantidade === 1
          ? `1 animal registrado.${aviso}`
          : `${resultado.quantidade} animais registrados.${aviso}`,
      );
      router.push("/sanidade/medicacoes");
      router.refresh();
    });
  }

  const selecionado = medicamentos.find((item) => item.id === medicamentoId);
  const podeEnviar = !pendente && !!medicamentoId && animalIds.length > 0;

  function trocarMedicamento(proximo: string) {
    setMedicamentoId(proximo);
    const item = medicamentos.find((medicamento) => medicamento.id === proximo);
    setDose(item?.dose ?? "");
  }

  return (
    <div className="space-y-4 pb-28 md:pb-0">
      <section className="grid gap-3 rounded-[12px] border border-border bg-card p-3 shadow-card sm:grid-cols-3 sm:p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texto-suave">Medicamento</span>
          <select
            value={medicamentoId}
            onChange={(evento) => trocarMedicamento(evento.target.value)}
            className="h-11 rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-10"
          >
            {medicamentos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome} · {LABELS_VIA[item.via]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texto-suave">Lote</span>
          <select
            value={loteId}
            onChange={(evento) => trocarLote(evento.target.value)}
            className="h-11 rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-10"
          >
            <option value="">Sem lote — todos os ativos</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texto-suave">Data</span>
          <Input
            type="date"
            value={data}
            max={hojeISO()}
            onChange={(evento) => setData(evento.target.value)}
            className="h-11 md:h-10"
          />
        </label>
      </section>

      {medicamentos.length === 0 ? (
        <p className="text-sm text-texto-suave">
          Cadastre um medicamento antes de registrar o manejo.
        </p>
      ) : (
        <section className="grid gap-3 rounded-[12px] border border-border bg-card p-3 shadow-card sm:grid-cols-[1.4fr_1fr] sm:p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-texto-suave">
              Dose deste manejo
            </span>
            <Input
              value={dose}
              onChange={(evento) => setDose(evento.target.value)}
              className="h-11 md:h-10"
              placeholder="Ex.: 1 ml para cada 50 kg"
            />
          </label>
          <div className="flex flex-col justify-center gap-1">
            <span className="text-xs font-medium text-texto-suave">
              Carência de abate
            </span>
            <p className="text-sm text-texto">
              {textoCarencia(selecionado?.carencia_dias ?? null)}
            </p>
          </div>
        </section>
      )}

      <section className="rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-texto">
            Animais no manejo ({animalIds.length}/{animais.length})
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-[10px]"
              onClick={() => setAnimalIds(animais.map((animal) => animal.id))}
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
        <p className="mt-1 text-xs text-texto-suave">
          Toque no brinco para tirar do manejo. Quem ficar desmarcado não entra no caderno.
        </p>
        <ul className="mt-3 max-h-[min(50vh,360px)] space-y-1.5 overflow-y-auto">
          {animais.length === 0 ? (
            <li className="py-6 text-center text-sm text-texto-suave">
              Nenhum animal ativo nesse grupo.
            </li>
          ) : (
            animais.map((animal) => {
              const marcado = animalIds.includes(animal.id);
              return (
                <li key={animal.id}>
                  <button
                    type="button"
                    onClick={() => alternar(animal.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left text-sm",
                      marcado
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card opacity-70",
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
                    <span className="font-semibold text-texto">{animal.brinco}</span>
                    {animal.nome ? (
                      <span className="text-texto-suave">{animal.nome}</span>
                    ) : null}
                    {marcado ? null : (
                      <span className="ml-auto text-xs text-texto-suave">Fora</span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <label className="block rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <span className="mb-1 block text-xs text-texto-suave">Observação</span>
        <Input
          value={observacoes}
          onChange={(evento) => setObservacoes(evento.target.value)}
          className="h-11 md:h-10"
          placeholder="Opcional"
        />
      </label>

      <div className="hidden gap-2 md:flex">
        <Button type="button" onClick={enviar} disabled={!podeEnviar}>
          {pendente ? <Loader2 className="animate-spin" /> : null}
          Registrar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/sanidade/medicacoes")}
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
            onClick={() => router.push("/sanidade/medicacoes")}
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
