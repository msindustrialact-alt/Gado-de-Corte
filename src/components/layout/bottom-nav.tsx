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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div
        className={cn(
          "pointer-events-auto relative mx-auto max-w-md overflow-hidden rounded-[28px]",
          "border border-white/55 bg-white/45 shadow-[0_10px_40px_rgba(15,23,42,0.14),0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.75)]",
          "backdrop-blur-2xl backdrop-saturate-150",
          "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[28px] after:bg-gradient-to-b after:from-white/35 after:via-transparent after:to-black/[0.03]",
        )}
      >
        <div className="relative z-10 grid h-[64px] grid-cols-3 gap-1 px-2 py-1.5">
          {ITENS.map((item) => {
            const ativo = rotaEstaAtiva(item.href, pathname);
            const Icone = item.icone;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-300 ease-out",
                  ativo ? "text-primary" : "text-texto-suave/90 active:scale-95 active:text-texto",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-1 inset-y-1 -z-10 rounded-2xl transition-all duration-300 ease-out",
                    ativo
                      ? "bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(29,106,61,0.12)] ring-1 ring-white/60"
                      : "bg-transparent",
                  )}
                  aria-hidden
                />
                <Icone
                  className={cn(
                    "size-[22px] transition-transform duration-300",
                    ativo && "scale-105 drop-shadow-sm",
                  )}
                  strokeWidth={ativo ? 2.45 : 2}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-[10px] leading-none tracking-wide transition-opacity duration-300",
                    ativo ? "font-semibold opacity-100" : "font-medium opacity-80",
                  )}
                >
                  {item.titulo}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
