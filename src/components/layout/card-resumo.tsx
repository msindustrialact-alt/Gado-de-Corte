import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CardResumo({
  rotulo,
  valor,
  icone,
  className,
}: {
  rotulo: string;
  valor: string;
  icone: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex h-auto min-h-[88px] flex-col items-start gap-1.5 rounded-[12px] border border-border bg-card px-2 py-2 shadow-card lg:min-h-[112px] lg:flex-row lg:items-center lg:gap-3 lg:px-3 lg:py-0",
        className,
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#DDF1E6] text-primary lg:size-12 lg:rounded-[12px] [&_svg]:size-[18px] lg:[&_svg]:size-6">
        {icone}
      </div>
      <div className="min-w-0 w-full">
        <p className="truncate text-[10px] leading-tight text-texto-suave lg:text-xs">
          {rotulo}
        </p>
        <p className="truncate text-[14px] leading-tight font-bold text-texto lg:text-xl">
          {valor}
        </p>
      </div>
    </article>
  );
}
