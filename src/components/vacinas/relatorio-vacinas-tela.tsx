"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";

import { StatusVacinaBadge } from "@/components/vacinas/vacina-badges";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatarData, formatarInteiro } from "@/lib/formatacao";
import { LABELS_STATUS_VACINA, type StatusVacinaAnimal } from "@/lib/vacinas";
import type { RelatorioVacinas } from "@/lib/vacinas/data";
import {
  filtrarLinhasRelatorio,
  gerarPdfRelatorioVacinas,
} from "@/lib/vacinas/relatorio-pdf";
import { cn } from "@/lib/utils";

type StatusFiltro = "" | "em_dia" | "incompleto" | "atrasado";

export function RelatorioVacinasTela({ dados }: { dados: RelatorioVacinas }) {
  const [loteId, setLoteId] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("");
  const [vacinaId, setVacinaId] = useState("");
  const [vacinaModo, setVacinaModo] = useState<"com" | "sem">("com");

  const vacinaNome =
    dados.vacinas.find((v) => v.id === vacinaId)?.nome ?? "";

  const linhas = useMemo(() => {
    let filtradas = filtrarLinhasRelatorio(dados.linhas, {
      loteId,
      status: status as StatusVacinaAnimal | "",
      vacinaId,
      vacinaNome: vacinaModo === "com" ? vacinaNome : "",
    });

    if (vacinaId && vacinaModo === "sem" && vacinaNome) {
      filtradas = dados.linhas.filter((linha) => {
        if (loteId && linha.lote_id !== loteId) return false;
        if (status && linha.status !== status) return false;
        return !linha.vacinas_feitas.includes(vacinaNome);
      });
    }

    return filtradas;
  }, [dados.linhas, loteId, status, vacinaId, vacinaModo, vacinaNome]);

  const kpis = useMemo(
    () => ({
      total: linhas.length,
      realizado: linhas.filter((l) => l.status === "em_dia").length,
      pendente: linhas.filter((l) => l.status === "incompleto").length,
      atrasado: linhas.filter((l) => l.status === "atrasado").length,
    }),
    [linhas],
  );

  function resumoFiltros() {
    const partes: string[] = [];
    if (loteId) {
      const lote = dados.lotes.find((l) => l.id === loteId);
      if (lote) partes.push(`Lote ${lote.nome}`);
    }
    if (status) partes.push(LABELS_STATUS_VACINA[status]);
    if (vacinaNome) {
      partes.push(
        vacinaModo === "com"
          ? `com ${vacinaNome}`
          : `sem ${vacinaNome}`,
      );
    }
    return partes.join(" · ") || "Todos os animais ativos";
  }

  function baixarPdf() {
    gerarPdfRelatorioVacinas({
      fazendaNome: dados.fazenda_nome,
      geradoEm: dados.gerado_em,
      linhas,
      filtrosResumo: resumoFiltros(),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/sanidade/vacinas"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-9 rounded-[10px] px-2",
          )}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <Button
          type="button"
          className="h-10 rounded-[10px] px-4"
          onClick={baixarPdf}
          disabled={linhas.length === 0}
        >
          <FileDown className="size-4" />
          Baixar PDF
        </Button>
      </div>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Filtros</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs text-texto-suave">
            Lote
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto"
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
            >
              <option value="">Todos</option>
              {dados.lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-texto-suave">
            Status
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFiltro)}
            >
              <option value="">Todos</option>
              <option value="em_dia">Realizado</option>
              <option value="incompleto">Pendente</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </label>

          <label className="block text-xs text-texto-suave">
            Vacina
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto"
              value={vacinaId}
              onChange={(e) => setVacinaId(e.target.value)}
            >
              <option value="">Todas</option>
              {dados.vacinas.map((vacina) => (
                <option key={vacina.id} value={vacina.id}>
                  {vacina.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-texto-suave">
            Cobertura da vacina
            <select
              className="mt-1 h-10 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto"
              value={vacinaModo}
              onChange={(e) => setVacinaModo(e.target.value as "com" | "sem")}
              disabled={!vacinaId}
            >
              <option value="com">Já tomou</option>
              <option value="sem">Ainda não tomou</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Kpi rotulo="No filtro" valor={kpis.total} />
        <Kpi rotulo="Realizado" valor={kpis.realizado} />
        <Kpi rotulo="Pendente" valor={kpis.pendente} />
        <Kpi rotulo="Atrasado" valor={kpis.atrasado} />
      </div>

      <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-texto">Animais</h2>
          <p className="text-xs text-texto-suave">{resumoFiltros()}</p>
        </div>

        {linhas.length === 0 ? (
          <p className="p-4 text-sm text-texto-suave">
            Nenhum animal com esses filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-texto-suave">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Brinco</th>
                  <th className="px-3 py-2.5 font-medium">Nome</th>
                  <th className="px-3 py-2.5 font-medium">Lote</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Última vacina</th>
                  <th className="px-3 py-2.5 font-medium">Data</th>
                  <th className="px-3 py-2.5 font-medium">Vacinas feitas</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr
                    key={linha.animal_id}
                    className="border-t border-border/80 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/animais/${linha.animal_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {linha.brinco}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-texto">
                      {linha.nome ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-texto">{linha.lote_nome}</td>
                    <td className="px-3 py-2.5">
                      <StatusVacinaBadge status={linha.status} />
                    </td>
                    <td className="px-3 py-2.5 text-texto">
                      {linha.ultima_vacina_nome ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-texto-suave">
                      {formatarData(linha.ultima_data)}
                    </td>
                    <td className="px-3 py-2.5 text-texto-suave">
                      {linha.vacinas_feitas.length > 0
                        ? linha.vacinas_feitas.join(" · ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="rounded-[12px] border border-border bg-card px-3 py-3 shadow-card">
      <p className="text-xs text-texto-suave">{rotulo}</p>
      <p className="mt-1 text-xl font-semibold text-texto">
        {formatarInteiro(valor)}
      </p>
    </div>
  );
}
