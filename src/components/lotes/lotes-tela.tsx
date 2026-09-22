"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { LoteFormulario } from "@/components/lotes/lote-formulario";
import { LotesTabela } from "@/components/lotes/lotes-tabela";
import { Button } from "@/components/ui/button";
import { DialogOuSheet } from "@/components/ui/dialog-ou-sheet";
import { Input } from "@/components/ui/input";
import { formatarInteiro } from "@/lib/formatacao";
import {
  filtrarLotes,
  OPCOES_FILTRO_STATUS_LOTE,
  type FiltroStatusLote,
  type LoteResumo,
} from "@/lib/lotes";

export function LotesTela({ lotes }: { lotes: LoteResumo[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatusLote>("ativo");
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<LoteResumo | null>(null);

  const filtrados = useMemo(
    () => filtrarLotes(lotes, busca, status),
    [lotes, busca, status],
  );

  const subtitulo =
    lotes.length === 1
      ? "1 lote cadastrado"
      : `${formatarInteiro(lotes.length)} lotes cadastrados`;

  function abrirNovo() {
    setEditando(null);
    setAberto(true);
  }

  function abrirEditar(lote: LoteResumo) {
    setEditando(lote);
    setAberto(true);
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Lotes</h1>
          <p className="mt-1 text-sm text-texto-suave">{subtitulo}</p>
        </div>
        <Button type="button" className="h-10 rounded-[10px] px-4" onClick={abrirNovo}>
          <Plus />
          Novo lote
        </Button>
      </header>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar lote</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-suave"
            />
            <Input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar por nome"
              className="h-10 rounded-[10px] border-border bg-bg-app pr-3 pl-10 shadow-none"
            />
          </label>
          <label className="flex min-w-[11rem] flex-col gap-1">
            <span className="sr-only">Status</span>
            <select
              value={status}
              onChange={(evento) =>
                setStatus(evento.target.value as FiltroStatusLote)
              }
              className="h-10 rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {OPCOES_FILTRO_STATUS_LOTE.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <LotesTabela
        lotes={filtrados}
        totalCadastrados={lotes.length}
        onEditar={abrirEditar}
        onNovo={abrirNovo}
      />

      <DialogOuSheet
        aberto={aberto}
        onAbertoChange={setAberto}
        titulo={editando ? "Editar lote" : "Novo lote"}
        descricao={
          editando
            ? "Atualize os dados do lote."
            : "Informe os dados para formar um novo lote."
        }
      >
        <LoteFormulario
          key={editando?.id ?? "novo"}
          lote={editando}
          onCancelar={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false);
            router.refresh();
          }}
        />
      </DialogOuSheet>
    </div>
  );
}
