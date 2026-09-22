"use client";

import { Wheat } from "lucide-react";

import { PiqueteAcoes } from "@/components/pastagens/piquete-acoes";
import {
  BarraOcupacao,
  formatarHa,
  formatarUa,
  StatusPiqueteBadge,
} from "@/components/pastagens/piquete-badges";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarInteiro } from "@/lib/formatacao";
import type { PiqueteResumo } from "@/lib/pastagens";

export function PastagensTabela({
  piquetes,
  onEditar,
  onDetalhe,
  onNovo,
}: {
  piquetes: PiqueteResumo[];
  onEditar: (piquete: PiqueteResumo) => void;
  onDetalhe: (piquete: PiqueteResumo) => void;
  onNovo: () => void;
}) {
  if (piquetes.length === 0) {
    return (
      <EstadoVazio
        icone={Wheat}
        titulo="Nenhum piquete cadastrado"
        descricao="Cadastre o primeiro piquete para controlar a ocupação das pastagens."
        acao={
          <button
            type="button"
            onClick={onNovo}
            className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Novo piquete
          </button>
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
              <TableHead>Área</TableHead>
              <TableHead>Tipo de pastagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Animais</TableHead>
              <TableHead>UA atual</TableHead>
              <TableHead>Lotação</TableHead>
              <TableHead>Ocupação</TableHead>
              <TableHead className="w-12 pr-3">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {piquetes.map((piquete) => (
              <TableRow
                key={piquete.id}
                tabIndex={0}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => onDetalhe(piquete)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    onDetalhe(piquete);
                  }
                }}
              >
                <TableCell className="pl-4 font-semibold text-texto">
                  {piquete.nome}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatarHa(piquete.area_ha)}
                </TableCell>
                <TableCell className="text-texto">
                  {piquete.tipo_pastagem ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusPiqueteBadge status={piquete.status} />
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatarInteiro(piquete.qtd_animais)}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {formatarUa(piquete.ua_atual)}
                </TableCell>
                <TableCell className="tabular-nums text-texto">
                  {piquete.lotacao_ua_ha == null
                    ? "—"
                    : `${formatarUa(piquete.lotacao_ua_ha)} UA/ha`}
                </TableCell>
                <TableCell>
                  <BarraOcupacao
                    uaAtual={piquete.ua_atual}
                    capacidade={piquete.capacidade_ua}
                  />
                </TableCell>
                <TableCell className="pr-3">
                  <PiqueteAcoes
                    piquete={piquete}
                    onEditar={onEditar}
                    onDetalhe={onDetalhe}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {piquetes.map((piquete) => (
          <article
            key={piquete.id}
            className="relative rounded-[12px] border border-border bg-card p-4 shadow-card"
          >
            <button
              type="button"
              className="w-full pr-8 text-left"
              onClick={() => onDetalhe(piquete)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-texto">{piquete.nome}</p>
                <StatusPiqueteBadge status={piquete.status} />
              </div>
              <p className="mt-1 text-sm text-texto-suave">
                {piquete.tipo_pastagem ?? "Sem tipo informado"}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <div>
                  <dt className="text-xs text-texto-suave">Área</dt>
                  <dd className="text-texto">{formatarHa(piquete.area_ha)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Animais</dt>
                  <dd className="tabular-nums text-texto">
                    {formatarInteiro(piquete.qtd_animais)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">UA atual</dt>
                  <dd className="tabular-nums text-texto">
                    {formatarUa(piquete.ua_atual)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-texto-suave">Lotação</dt>
                  <dd className="tabular-nums text-texto">
                    {piquete.lotacao_ua_ha == null
                      ? "—"
                      : `${formatarUa(piquete.lotacao_ua_ha)} UA/ha`}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <BarraOcupacao
                  uaAtual={piquete.ua_atual}
                  capacidade={piquete.capacidade_ua}
                />
              </div>
            </button>
            <div className="absolute top-3 right-2">
              <PiqueteAcoes
                piquete={piquete}
                onEditar={onEditar}
                onDetalhe={onDetalhe}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
