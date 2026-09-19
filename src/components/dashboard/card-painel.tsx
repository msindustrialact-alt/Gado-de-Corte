import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CardPainel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[12px] border border-border bg-card p-[18px] shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}
