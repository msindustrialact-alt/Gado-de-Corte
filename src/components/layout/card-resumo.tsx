import type { ReactNode } from "react";

export function CardResumo({
  rotulo,
  valor,
  icone,
}: {
  rotulo: string;
  valor: string;
  icone: ReactNode;
}) {
  return (
    <article className="flex items-center gap-3 rounded-[12px] border border-border bg-card p-4 shadow-card">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[#DDF1E6] text-primary">
        {icone}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-texto-suave">{rotulo}</p>
        <p className="truncate text-xl font-bold text-texto">{valor}</p>
      </div>
    </article>
  );
}
