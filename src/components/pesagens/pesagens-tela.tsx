"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDollarSign, Plus, Search, Timer, TrendingUp, Weight } from "lucide-react";

import { CardResumo } from "@/components/layout/card-resumo";
import { PesagensTabela } from "@/components/pesagens/pesagens-tabela";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatarInteiro } from "@/lib/formatacao";
import {
  filtrarPesagens,
  formatCustoArroba,
  formatGmd,
  OPCOES_FILTRO_STATUS_PESAGEM,
  type FiltroStatusPesagem,
  type PesagemResumo,
} from "@/lib/pesagens";

export function PesagensTela({
  pesagens,
  indicadores,
}: {
  pesagens: PesagemResumo[];
  indicadores: {
    pesagensMes: number;
    gmdMedio: number | null;
    custoArroba: number | null;
    lotesAtrasados: number;
  };
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatusPesagem>("todos");

  const filtradas = useMemo(
    () => filtrarPesagens(pesagens, busca, status),
    [pesagens, busca, status],
  );

  const subtitulo =
    pesagens.length === 1
      ? "1 sessão registrada"
      : `${formatarInteiro(pesagens.length)} sessões registradas`;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Pesagens</h1>
          <p className="mt-1 text-sm text-texto-suave">{subtitulo}</p>
        </div>
        <Button
          type="button"
          className="h-10 rounded-[10px] px-4"
          onClick={() => router.push("/pesagens/nova")}
        >
          <Plus />
          Nova pesagem
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumo
          rotulo="Sessões neste mês"
          valor={formatarInteiro(indicadores.pesagensMes)}
          icone={<Weight className="size-6" />}
        />
        <CardResumo
          rotulo="GMD médio"
          valor={formatGmd(indicadores.gmdMedio)}
          icone={<TrendingUp className="size-6" />}
        />
        <CardResumo
          rotulo="Custo da @ produzida"
          valor={formatCustoArroba(indicadores.custoArroba)}
          icone={<CircleDollarSign className="size-6" />}
        />
        <CardResumo
          rotulo="Lotes atrasados"
          valor={formatarInteiro(indicadores.lotesAtrasados)}
          icone={<Timer className="size-6" />}
        />
      </div>

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
              placeholder="Buscar por lote"
              className="h-10 rounded-[10px] border-border bg-bg-app pr-3 pl-10 shadow-none"
            />
          </label>
          <label className="flex min-w-[12rem] flex-col gap-1">
            <span className="sr-only">Status</span>
            <select
              value={status}
              onChange={(evento) =>
                setStatus(evento.target.value as FiltroStatusPesagem)
              }
              className="h-10 rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {OPCOES_FILTRO_STATUS_PESAGEM.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <PesagensTabela
        pesagens={filtradas}
        totalCadastradas={pesagens.length}
        onNova={() => router.push("/pesagens/nova")}
      />
    </div>
  );
}
