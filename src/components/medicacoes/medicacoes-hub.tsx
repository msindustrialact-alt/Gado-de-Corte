import Link from "next/link";
import { Pill } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { formatarData, formatarInteiro } from "@/lib/formatacao";
import {
  LABELS_VIA,
  textoCarencia,
  type SessaoMedicacao,
} from "@/lib/medicacoes/tipos";
import { cn } from "@/lib/utils";

export function MedicacoesHub({ sessoes }: { sessoes: SessaoMedicacao[] }) {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Medicações</h1>
          <p className="mt-1 text-sm text-texto-suave">
            Caderno do que foi aplicado. Não mexe no estoque.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href="/sanidade/medicacoes/cadastrar"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full rounded-[10px] px-4 sm:h-10 sm:w-auto",
            )}
          >
            Cadastrar medicamento
          </Link>
          <Link
            href="/sanidade/medicacoes/registrar"
            className={cn(
              buttonVariants(),
              "h-11 w-full rounded-[10px] px-4 sm:h-10 sm:w-auto",
            )}
          >
            <Pill />
            Registrar manejo
          </Link>
        </div>
      </header>

      {sessoes.length === 0 ? (
        <section className="rounded-[12px] border border-border bg-card px-4 py-10 text-center shadow-card">
          <p className="font-medium text-texto">Nenhuma medicação registrada.</p>
          <p className="mt-1 text-sm text-texto-suave">
            Cadastre o medicamento e depois registre o manejo.
          </p>
        </section>
      ) : (
        <ul className="space-y-2">
          {sessoes.map((sessao) => (
            <li
              key={sessao.id}
              className="rounded-[12px] border border-border bg-card px-4 py-3 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-texto">{sessao.medicamento_nome}</p>
                  <p className="mt-0.5 text-xs text-texto-suave">
                    {LABELS_VIA[sessao.via]}
                    {" · "}
                    {sessao.dose ?? "Dose não informada"}
                    {" · "}
                    {textoCarencia(sessao.carencia_dias)}
                    {" · "}
                    {sessao.lote_nome ?? "Sem lote"}
                  </p>
                  {sessao.observacoes ? (
                    <p className="mt-1 text-sm text-texto">{sessao.observacoes}</p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-texto">
                    {formatarData(sessao.data)}
                  </p>
                  <p className="text-xs text-texto-suave">
                    {formatarInteiro(sessao.qtd_aplicados ?? 0)} animais
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
