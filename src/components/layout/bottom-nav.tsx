"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Layers, Weight, type LucideIcon } from "lucide-react";

import { rotaEstaAtiva } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const ITENS = [
  { titulo: "Início", href: "/dashboard", icone: House },
  { titulo: "Pesagem", href: "/pesagens", icone: Weight },
  { titulo: "Lotes", href: "/lotes", icone: Layers },
] as const satisfies ReadonlyArray<{
  titulo: string;
  href: string;
  icone: LucideIcon;
}>;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ações rápidas"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/92 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-[64px] max-w-lg grid-cols-3 px-2">
        {ITENS.map((item) => {
          const ativo = rotaEstaAtiva(item.href, pathname);
          const Icone = item.icone;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                ativo ? "text-primary" : "text-texto-suave active:text-texto",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-all duration-200",
                  ativo
                    ? "bg-primary/12 shadow-[inset_0_0_0_1px_rgba(29,106,61,0.12)]"
                    : "bg-transparent group-active:bg-muted/70",
                )}
              >
                <Icone
                  className={cn(
                    "size-[22px] transition-transform duration-200",
                    ativo && "scale-105",
                  )}
                  strokeWidth={ativo ? 2.4 : 2}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  "text-[11px] leading-none tracking-wide",
                  ativo ? "font-semibold" : "font-medium",
                )}
              >
                {item.titulo}
              </span>
              {ativo ? (
                <span
                  className="absolute top-1.5 h-1 w-1 rounded-full bg-primary"
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" aria-hidden />
    </nav>
  );
}
