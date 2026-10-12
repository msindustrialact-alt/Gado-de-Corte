import Link from "next/link";
import { Syringe } from "lucide-react";

import { CardResumo } from "@/components/layout/card-resumo";
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
      {!status.protocolo ? (
        <div className="rounded-[12px] border border-alerta/30 bg-alerta/10 p-4 text-sm text-texto">
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

      <div className="flex flex-wrap gap-2">
        <Link
          href="/sanidade/vacinas/aplicar"
          className={cn(buttonVariants(), "h-10 rounded-[10px] px-4")}
        >
          <Syringe />
          Aplicar no lote
        </Link>
        <Link
          href="/sanidade/vacinas/protocolo"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-[10px] px-4",
          )}
        >
          Protocolo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        <CardResumo
          rotulo="Em dia"
          valor={formatarInteiro(status.kpis.em_dia)}
          icone={<Syringe />}
        />
        <CardResumo
          rotulo="Incompleto"
          valor={formatarInteiro(status.kpis.incompleto)}
          icone={<Syringe />}
        />
        <CardResumo
          rotulo="Atrasado"
          valor={formatarInteiro(status.kpis.atrasado)}
          icone={<Syringe />}
        />
        <CardResumo
          rotulo="Sessões no mês"
          valor={formatarInteiro(status.kpis.sessoes_mes)}
          icone={<Syringe />}
        />
      </div>
      {status.kpis.indefinido > 0 ? (
        <p className="text-xs text-texto-suave">
          {formatarInteiro(status.kpis.indefinido)} animal(is) com status
          indefinido (cadastre a data de nascimento para refinar a idade
          mínima).
        </p>
      ) : null}

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Lotes</h2>
        <div className="mt-3 space-y-2">
          {status.porLote.length === 0 ? (
            <p className="text-sm text-texto-suave">Nenhum lote ativo.</p>
          ) : (
            status.porLote.map((lote) => (
              <div
                key={lote.lote_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-texto">{lote.lote_nome}</p>
                  <p className="text-xs text-texto-suave">
                    {lote.qtd_em_dia} em dia · {lote.qtd_incompleto} incompleto ·{" "}
                    {lote.qtd_atrasado} atrasado
                    {lote.qtd_indefinido > 0
                      ? ` · ${lote.qtd_indefinido} indefinido`
                      : ""}
                    {lote.qtd_total > 0
                      ? ` · ${lote.qtd_total} animais`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusVacinaBadge
                    status={
                      lote.status === "em_dia"
                        ? "em_dia"
                        : lote.qtd_atrasado > 0
                          ? "atrasado"
                          : "incompleto"
                    }
                  />
                  <Link
                    href={`/sanidade/vacinas/aplicar?lote=${lote.lote_id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Aplicar
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Últimas sessões</h2>
        <ul className="mt-3 space-y-2">
          {sessoes.length === 0 ? (
            <li className="text-sm text-texto-suave">Nenhuma vacinação registrada.</li>
          ) : (
            sessoes.map((sessao) => (
              <li
                key={sessao.id}
                className="flex justify-between gap-2 text-sm text-texto"
              >
                <span>
                  {sessao.lote_nome} · {sessao.qtd_aplicados ?? 0} animais
                </span>
                <span className="text-texto-suave">
                  {formatarData(sessao.data)}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
