import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileDown,
  Syringe,
} from "lucide-react";

import { StatusVacinaBadge } from "@/components/vacinas/vacina-badges";
import { buttonVariants } from "@/components/ui/button";
import { formatarData, formatarInteiro } from "@/lib/formatacao";
import type { getStatusRebanho, SessaoResumo } from "@/lib/vacinas/data";
import { cn } from "@/lib/utils";

type Status = Awaited<ReturnType<typeof getStatusRebanho>>;

export function VacinasHub({
  status,
  sessoes,
}: {
  status: Status;
  sessoes: SessaoResumo[];
}) {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Vacinas</h1>
          <p className="mt-1 text-sm text-texto-suave">
            Calendário sanitário por data de realização.
          </p>
        </div>
        <Link
          href="/sanidade/vacinas/aplicar"
          className={cn(
            buttonVariants(),
            "h-11 w-full rounded-[10px] px-4 sm:h-10 sm:w-auto",
          )}
        >
          <Syringe />
          Aplicar no lote
        </Link>
      </header>

      {!status.protocolo ? (
        <div className="rounded-[12px] border border-alerta/30 bg-alerta/10 p-3 text-sm text-texto sm:p-4">
          Nenhum protocolo ativo.{" "}
          <Link
            href="/sanidade/vacinas/protocolo"
            className="font-semibold text-primary underline"
          >
            Cadastre o protocolo
          </Link>{" "}
          para controlar o calendário.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/sanidade/vacinas/relatorio"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 rounded-[10px] px-3 text-sm",
          )}
        >
          <FileDown className="size-4" />
          Relatório PDF
        </Link>
        <Link
          href="/sanidade/vacinas/protocolo"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 rounded-[10px] px-3 text-sm",
          )}
        >
          <ClipboardList className="size-4" />
          Protocolo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        <KpiVacina
          rotulo="Realizado"
          valor={formatarInteiro(status.kpis.em_dia)}
          icone={<Syringe className="size-[18px] lg:size-[30px]" strokeWidth={2.25} />}
        />
        <KpiVacina
          rotulo="Pendente"
          valor={formatarInteiro(status.kpis.incompleto)}
          icone={
            <CalendarDays className="size-[18px] lg:size-[30px]" strokeWidth={2.25} />
          }
        />
        <KpiVacina
          rotulo="Atrasado"
          valor={formatarInteiro(status.kpis.atrasado)}
          icone={<Syringe className="size-[18px] lg:size-[30px]" strokeWidth={2.25} />}
        />
        <KpiVacina
          rotulo="Sessões no mês"
          valor={formatarInteiro(status.kpis.sessoes_mes)}
          icone={
            <ClipboardList className="size-[18px] lg:size-[30px]" strokeWidth={2.25} />
          }
        />
      </div>

      <section className="rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <h2 className="text-sm font-semibold text-texto">Lotes</h2>
        <div className="mt-3 space-y-2">
          {status.porLote.length === 0 ? (
            <p className="text-sm text-texto-suave">Nenhum lote ativo.</p>
          ) : (
            status.porLote.map((lote) => (
              <div
                key={lote.lote_id}
                className="rounded-[12px] border border-border px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-texto">
                      {lote.lote_nome}
                    </p>
                    <p className="mt-0.5 text-xs text-texto-suave">
                      {lote.qtd_total} animais
                    </p>
                  </div>
                  <StatusVacinaBadge
                    status={
                      lote.status === "em_dia"
                        ? "em_dia"
                        : lote.qtd_atrasado > 0
                          ? "atrasado"
                          : "incompleto"
                    }
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                  {lote.qtd_em_dia} realizado · {lote.qtd_incompleto} pendente ·{" "}
                  {lote.qtd_atrasado} atrasado
                </p>
                <Link
                  href={`/sanidade/vacinas/aplicar?lote=${lote.lote_id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-3 h-9 w-full rounded-[10px] sm:w-auto",
                  )}
                >
                  Aplicar neste lote
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-3 shadow-card sm:p-4">
        <h2 className="text-sm font-semibold text-texto">Últimas sessões</h2>
        <ul className="mt-3 space-y-2">
          {sessoes.length === 0 ? (
            <li className="text-sm text-texto-suave">
              Nenhuma vacinação registrada.
            </li>
          ) : (
            sessoes.map((sessao) => (
              <li
                key={sessao.id}
                className="rounded-[10px] border border-border/80 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-sm font-medium text-texto">
                    {sessao.lote_nome}
                  </p>
                  <span className="shrink-0 text-xs text-texto-suave">
                    {formatarData(sessao.data)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-texto-suave">
                  {sessao.qtd_aplicados ?? 0} animais
                  {sessao.vacinas_nomes.length > 0
                    ? ` · ${sessao.vacinas_nomes.join(" · ")}`
                    : ""}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function KpiVacina({
  rotulo,
  valor,
  icone,
}: {
  rotulo: string;
  valor: string;
  icone: ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex h-auto min-h-[88px] flex-col items-start gap-1.5 rounded-[12px] border border-border bg-card px-2 py-2 shadow-card",
        "lg:h-[112px] lg:min-h-0 lg:flex-row lg:items-center lg:gap-2.5 lg:px-3 lg:py-0",
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#DDF1E6] text-[#1D6A3D] lg:size-12 lg:rounded-[12px]">
        {icone}
      </div>
      <div className="min-w-0 w-full">
        <p className="truncate text-[10px] leading-tight text-texto-suave lg:text-[12px]">
          {rotulo}
        </p>
        <p className="truncate text-[14px] leading-tight font-bold text-texto lg:text-[20px]">
          {valor}
        </p>
      </div>
    </article>
  );
}
