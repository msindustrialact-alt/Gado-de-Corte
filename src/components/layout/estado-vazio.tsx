import { SearchX, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EstadoVazio({
  titulo,
  descricao,
  acao,
  icone: Icone = SearchX,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
  icone?: LucideIcon;
}) {
  return (
    <section className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#DDF1E6] text-primary">
        <Icone className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-texto">{titulo}</h2>
      <p className="mt-1 max-w-sm text-sm text-texto-suave">{descricao}</p>
      {acao ? <div className="mt-5">{acao}</div> : null}
    </section>
  );
}
