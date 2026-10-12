"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { moverAnimaisParaLote } from "@/app/(app)/animais/actions";
import { AnimalCard } from "@/components/animais/animal-card";
import { AnimaisTabela } from "@/components/animais/animais-tabela";
import { Button } from "@/components/ui/button";
import type { AnimalListagem, FiltrosAnimais, OpcaoFiltro } from "@/lib/animais";

export function AnimaisSelecao({
  animais,
  filtros,
  idsFiltrados,
  lotes,
}: {
  animais: AnimalListagem[];
  filtros: FiltrosAnimais;
  idsFiltrados: string[];
  lotes: OpcaoFiltro[];
}) {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loteId, setLoteId] = useState("");
  const [pendente, iniciar] = useTransition();
  const filtroAtual = [
    filtros.q,
    filtros.status,
    filtros.sexo,
    filtros.categoria,
    filtros.racaId,
    filtros.loteId,
    filtros.piqueteId,
    filtros.propriedade,
  ].join("|");
  const filtroAnterior = useRef(filtroAtual);

  useEffect(() => {
    if (filtroAnterior.current === filtroAtual) {
      return;
    }

    filtroAnterior.current = filtroAtual;
    setSelecionados([]);
    setLoteId("");
  }, [filtroAtual]);
  const marcados = useMemo(() => new Set(selecionados), [selecionados]);
  const idsPagina = animais.map((animal) => animal.id);

  function alternar(id: string) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    );
  }

  function alternarPagina(marcar: boolean) {
    setSelecionados((atual) => {
      if (!marcar) {
        return atual.filter((id) => !idsPagina.includes(id));
      }

      return [...new Set([...atual, ...idsPagina])];
    });
  }

  function mover() {
    if (!loteId) {
      toast.error("Escolha o lote.");
      return;
    }

    iniciar(async () => {
      const destino = loteId === "sem-lote" ? "" : loteId;
      const resultado = await moverAnimaisParaLote(selecionados, destino);

      if (!resultado.ok) {
        toast.error(resultado.message);
        return;
      }

      const lote = lotes.find((item) => item.valor === loteId);
      const nomeDestino = loteId === "sem-lote" ? "Sem lote" : (lote?.rotulo ?? "o lote");
      toast.success(
        resultado.quantidade === 1
          ? `1 animal movido para ${nomeDestino}.`
          : `${resultado.quantidade} animais movidos para ${nomeDestino}.`,
      );
      setSelecionados([]);
      router.refresh();
    });
  }

  const faltaDoFiltro = idsFiltrados.some((id) => !marcados.has(id));

  return (
    <>
      <div className="hidden md:block">
        <AnimaisTabela
          animais={animais}
          filtros={filtros}
          selecao={{
            selecionados: marcados,
            onAlternar: alternar,
            onAlternarPagina: alternarPagina,
          }}
        />
      </div>
      <div className="flex flex-col gap-2 md:hidden">
        {animais.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            selecionado={marcados.has(animal.id)}
            onAlternarSelecao={alternar}
          />
        ))}
      </div>

      {selecionados.length > 0 ? (
        <div className="sticky bottom-24 z-30 rounded-[12px] border border-border bg-card p-3 shadow-card lg:bottom-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-texto">
                {selecionados.length === 1
                  ? "1 animal selecionado"
                  : `${selecionados.length} animais selecionados`}
              </p>
              {faltaDoFiltro && idsFiltrados.length > selecionados.length ? (
                <button
                  type="button"
                  className="mt-1 text-left text-xs font-medium text-primary hover:underline"
                  onClick={() => setSelecionados(idsFiltrados)}
                >
                  Selecionar os {idsFiltrados.length} deste filtro
                </button>
              ) : null}
            </div>
            <label className="flex min-w-0 flex-col gap-1 sm:w-56">
              <span className="text-xs font-medium text-texto-suave">Mover para</span>
              <select
                value={loteId}
                onChange={(evento) => setLoteId(evento.target.value)}
                className="h-9 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Escolha o lote</option>
                {lotes.map((lote) => (
                  <option key={lote.valor} value={lote.valor}>
                    {lote.rotulo}
                  </option>
                ))}
                <option value="sem-lote">Sem lote</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button type="button" disabled={pendente} onClick={mover}>
                {pendente ? <Loader2 className="animate-spin" /> : null}
                Mover
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pendente}
                onClick={() => setSelecionados([])}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
