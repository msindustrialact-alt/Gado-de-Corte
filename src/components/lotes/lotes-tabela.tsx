"use client";

import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";

import { LoteAcoes } from "@/components/lotes/lote-acoes";
import { ObjetivoBadge, StatusLoteBadge } from "@/components/lotes/lote-badges";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPeso } from "@/lib/animais";
import { formatarData, formatarInteiro } from "@/lib/formatacao";
import type { LoteResumo } from "@/lib/lotes";

export function LotesTabela({
  lotes,
  totalCadastrados,
  onEditar,
  onNovo,
}: {
  lotes: LoteResumo[];
  totalCadastrados: number;
  onEditar: (lote: LoteResumo) => void;
  onNovo: () => void;
}) {
  const router = useRouter();

  if (lotes.length === 0) {
    return (
      <EstadoVazio
        icone={Layers}
        titulo={
          totalCadastrados === 0
            ? "Nenhum lote cadastrado"
            : "Nenhum lote encontrado"
        }
        descricao={
          totalCadastrados === 0
            ? "Crie o primeiro lote para organizar o rebanho."
            : "Ajuste a busca ou o filtro de status para ver os lotes cadastrados."
        }
        acao={
          totalCadastrados === 0 ? (
            <button
              type="button"
              onClick={onNovo}
              className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Novo lote
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
              <TableHead className="pl-4">Nome</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de formação</TableHead>
              <TableHead>Nº de animais</TableHead>
              <TableHead>Peso médio</TableHead>
              <TableHead className="w-12 pr-3">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.map((lote) => (
              <TableRow
                key={lote.id}
                tabIndex={0}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => router.push(`/lotes/${lote.id}`)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    router.push(`/lotes/${lote.id}`);
                  }
                }}
              >
                <TableCell className="pl-4 font-semibold text-texto">
                  {lote.nome}
                </TableCell>
                <TableCell>
                  <ObjetivoBadge objetivo={lote.objetivo} />
                </TableCell>
                <TableCell>
                  <StatusLoteBadge status={lote.status} />
                </TableCell>
                <TableCell className="text-texto">
                  {formatarData(lote.data_formacao)}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatarInteiro(lote.qtd_animais)}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatPeso(lote.peso_medio)}
                </TableCell>
                <TableCell className="pr-3">
                  <LoteAcoes lote={lote} onEditar={onEditar} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {lotes.map((lote) => (
          <article
            key={lote.id}
            className="relative rounded-[12px] border border-border bg-card p-4 shadow-card"
          >
            <button
              type="button"
              className="w-full pr-8 text-left"
              onClick={() => router.push(`/lotes/${lote.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-texto">{lote.nome}</p>
                <StatusLoteBadge status={lote.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <div>
                  <dt className="text-xs text-texto-suave">Objetivo</dt>
                  <dd>
                    <ObjetivoBadge objetivo={lote.objetivo} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Formação</dt>
                  <dd className="text-texto">{formatarData(lote.data_formacao)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Animais</dt>
                  <dd className="tabular-nums text-texto">
                    {formatarInteiro(lote.qtd_animais)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Peso médio</dt>
                  <dd className="tabular-nums text-texto">
                    {formatPeso(lote.peso_medio)}
                  </dd>
                </div>
              </dl>
            </button>
            <div className="absolute top-3 right-2">
              <LoteAcoes lote={lote} onEditar={onEditar} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
