"use client";

import { useRouter } from "next/navigation";
import { Weight } from "lucide-react";

import { EstadoVazio } from "@/components/layout/estado-vazio";
import { ObjetivoBadge } from "@/components/lotes/lote-badges";
import { PesagemAcoes } from "@/components/pesagens/pesagem-acoes";
import { StatusPesagemBadge } from "@/components/pesagens/pesagem-badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPeso } from "@/lib/animais";
import { formatarData } from "@/lib/formatacao";
import {
  formatArroba,
  formatCobertura,
  formatCustoArroba,
  formatGmd,
  formatUniformidade,
  kgParaArroba,
  TEXTO_TOOLTIP_ARROBA,
  UNIFORMIDADE_CV_ALERTA,
  type PesagemResumo,
} from "@/lib/pesagens";
import { cn } from "@/lib/utils";

export function PesagensTabela({
  pesagens,
  totalCadastradas,
  onNova,
}: {
  pesagens: PesagemResumo[];
  totalCadastradas: number;
  onNova: () => void;
}) {
  const router = useRouter();

  if (pesagens.length === 0) {
    return (
      <EstadoVazio
        icone={Weight}
        titulo={
          totalCadastradas === 0
            ? "Nenhuma pesagem registrada"
            : "Nenhuma pesagem encontrada"
        }
        descricao={
          totalCadastradas === 0
            ? "Traga o lote para a balança e registre a primeira sessão. O ganho por dia aparece na hora."
            : "Ajuste a busca ou o filtro de status para ver as sessões."
        }
        acao={
          totalCadastradas === 0 ? (
            <button
              type="button"
              onClick={onNova}
              className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Nova pesagem
            </button>
          ) : null
        }
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[12px] border border-border bg-card shadow-card md:block">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Data</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cobertura</TableHead>
              <TableHead>Peso médio</TableHead>
              <TableHead>Uniformidade</TableHead>
              <TableHead>GMD</TableHead>
              <TableHead title={TEXTO_TOOLTIP_ARROBA}>Custo @ est.</TableHead>
              <TableHead className="w-12 pr-3">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pesagens.map((pesagem) => (
              <TableRow
                key={pesagem.id}
                tabIndex={0}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => router.push(`/pesagens/${pesagem.id}`)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    router.push(`/pesagens/${pesagem.id}`);
                  }
                }}
              >
                <TableCell className="pl-4 font-semibold tabular-nums text-texto">
                  {formatarData(pesagem.data)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-texto">{pesagem.lote_nome}</span>
                    <ObjetivoBadge objetivo={pesagem.lote_objetivo} />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusPesagemBadge status={pesagem.status} />
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatCobertura(
                    pesagem.qtd_pesados,
                    pesagem.qtd_animais_lote,
                    pesagem.cobertura_percentual,
                  )}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  <span className="block">{formatPeso(pesagem.peso_medio)}</span>
                  <span className="text-xs text-texto-suave" title={TEXTO_TOOLTIP_ARROBA}>
                    {pesagem.peso_medio != null
                      ? formatArroba(pesagem.peso_medio)
                      : "—"}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "tabular-nums text-texto",
                    pesagem.uniformidade_cv != null &&
                      pesagem.uniformidade_cv > UNIFORMIDADE_CV_ALERTA &&
                      "font-semibold text-alerta",
                  )}
                >
                  {formatUniformidade(pesagem.uniformidade_cv)}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatGmd(pesagem.gmd_medio)}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {custoDaSessao(pesagem)}
                </TableCell>
                <TableCell className="pr-3">
                  <PesagemAcoes pesagem={pesagem} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {pesagens.map((pesagem) => (
          <article
            key={pesagem.id}
            className="relative rounded-[12px] border border-border bg-card p-4 shadow-card"
          >
            <button
              type="button"
              className="w-full pr-8 text-left"
              onClick={() => router.push(`/pesagens/${pesagem.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-texto">{pesagem.lote_nome}</p>
                  <p className="text-sm text-texto-suave">{formatarData(pesagem.data)}</p>
                </div>
                <StatusPesagemBadge status={pesagem.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-texto-suave">Cobertura</dt>
                  <dd className="tabular-nums">
                    {formatCobertura(
                      pesagem.qtd_pesados,
                      pesagem.qtd_animais_lote,
                      pesagem.cobertura_percentual,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Peso médio</dt>
                  <dd className="tabular-nums">
                    {formatPeso(pesagem.peso_medio)}
                    {pesagem.peso_medio != null ? (
                      <span className="block text-xs text-texto-suave">
                        {formatArroba(pesagem.peso_medio)}
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Uniformidade</dt>
                  <dd
                    className={cn(
                      "tabular-nums",
                      pesagem.uniformidade_cv != null &&
                        pesagem.uniformidade_cv > UNIFORMIDADE_CV_ALERTA &&
                        "font-semibold text-alerta",
                    )}
                  >
                    {formatUniformidade(pesagem.uniformidade_cv)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">GMD</dt>
                  <dd className="tabular-nums">{formatGmd(pesagem.gmd_medio)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Custo @ est.</dt>
                  <dd className="tabular-nums">{custoDaSessao(pesagem)}</dd>
                </div>
              </dl>
            </button>
            <div className="absolute top-3 right-2">
              <PesagemAcoes pesagem={pesagem} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function custoDaSessao(pesagem: PesagemResumo): string {
  if (pesagem.custo_por_arroba != null) {
    return formatCustoArroba(pesagem.custo_por_arroba);
  }

  if (pesagem.custo_alimentacao == null || pesagem.ganho_total_kg == null) {
    return "—";
  }

  if (pesagem.ganho_total_kg <= 0) {
    return "—";
  }

  return formatCustoArroba(pesagem.custo_alimentacao / kgParaArroba(pesagem.ganho_total_kg));
}
