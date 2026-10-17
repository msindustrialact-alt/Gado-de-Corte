"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  aplicarCustosPeriodoAction,
  buscarCustosPeriodoAction,
} from "@/app/(app)/pesagens/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LinhaCustoPeriodo } from "@/lib/custos-periodo/calculo";
import { formatarData, formatarDecimal, formatarMoeda } from "@/lib/formatacao";

const ROTULOS = {
  alimentacao: "Suplementação",
  sanidade: "Medicamentos",
  outro: "Outros",
} as const;

export function CustosPeriodoDialog({
  pesagemId,
  desabilitado,
  onAplicado,
}: {
  pesagemId: string;
  desabilitado: boolean;
  onAplicado: (total: number) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [linhas, setLinhas] = useState<LinhaCustoPeriodo[]>([]);
  const [dataAnterior, setDataAnterior] = useState<string | null>(null);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [pendente, iniciar] = useTransition();

  function abrir() {
    setAberto(true);
    iniciar(async () => {
      const resultado = await buscarCustosPeriodoAction(pesagemId);

      if (!resultado.ok) {
        toast.error(resultado.message);
        setAberto(false);
        return;
      }

      setLinhas(resultado.linhas);
      setDataAnterior(resultado.dataAnterior);
      setMarcados(
        resultado.linhas
          .filter((linha) => linha.grupo === "periodo")
          .map((linha) => linha.id),
      );
    });
  }

  function alternar(id: string) {
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    );
  }

  function aplicar() {
    iniciar(async () => {
      const resultado = await aplicarCustosPeriodoAction(pesagemId, marcados);

      if (!resultado.ok) {
        toast.error(resultado.message);
        return;
      }

      onAplicado(resultado.total);
      toast.success("Custo do período preenchido.");
      setAberto(false);
    });
  }

  const escolhidas = linhas.filter((linha) => marcados.includes(linha.id));
  const total = escolhidas.reduce((soma, linha) => soma + linha.custo_total, 0);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-[10px]"
        disabled={desabilitado}
        onClick={abrir}
      >
        Buscar custos do período
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Custos do período</DialogTitle>
            <DialogDescription>
              {dataAnterior
                ? `Depois de ${formatarData(dataAnterior)} até esta pesagem. O que começou antes vem desmarcado.`
                : "Primeira pesagem deste lote: tudo lançado até esta data."}
            </DialogDescription>
          </DialogHeader>
          {pendente && linhas.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-texto-suave">
              <Loader2 className="size-4 animate-spin" />
              Buscando lançamentos
            </p>
          ) : linhas.length === 0 ? (
            <p className="text-sm text-texto-suave">
              Nenhum lançamento de estoque neste intervalo.
            </p>
          ) : (
            <ul className="space-y-2">
              {linhas.map((linha) => {
                const marcado = marcados.includes(linha.id);
                return (
                  <li key={linha.id}>
                    <button
                      type="button"
                      onClick={() => alternar(linha.id)}
                      className="flex w-full items-start gap-3 rounded-[10px] border border-border px-3 py-2 text-left"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-border text-[11px]">
                        {marcado ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-texto">
                          {linha.produto_nome}
                        </span>
                        <span className="block text-xs text-texto-suave">
                          {formatarData(linha.data_inicio)}
                          {" · "}
                          {ROTULOS[linha.categoria]}
                          {" · "}
                          {formatarDecimal(linha.quantidade, 2)} {linha.unidade}
                          {linha.grupo === "anterior" ? " · começou antes" : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium text-texto">
                        {formatarMoeda(linha.custo_total)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="space-y-1 text-sm">
            {(["alimentacao", "sanidade", "outro"] as const).map((categoria) => {
              const subtotal = escolhidas
                .filter((linha) => linha.categoria === categoria)
                .reduce((soma, linha) => soma + linha.custo_total, 0);

              if (subtotal === 0) {
                return null;
              }

              return (
                <p key={categoria} className="flex justify-between text-texto-suave">
                  <span>{ROTULOS[categoria]}</span>
                  <span>{formatarMoeda(subtotal)}</span>
                </p>
              );
            })}
            <p className="flex justify-between font-semibold text-texto">
              <span>Total</span>
              <span>{formatarMoeda(total)}</span>
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Fechar
            </Button>
            <Button type="button" onClick={aplicar} disabled={pendente}>
              Usar este total
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
