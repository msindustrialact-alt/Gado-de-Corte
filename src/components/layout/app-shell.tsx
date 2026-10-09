"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Cabecalho } from "@/components/layout/header";
import { BarraLateral } from "@/components/layout/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { DadosUsuario } from "@/components/layout/types";

const CHAVE_SIDEBAR = "fazenda-joana:sidebar-recolhida";

export function AppShell({
  children,
  usuario,
}: {
  children: ReactNode;
  usuario: DadosUsuario;
}) {
  const [recolhida, setRecolhida] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);

  useEffect(() => {
    setRecolhida(localStorage.getItem(CHAVE_SIDEBAR) === "1");
  }, []);

  useEffect(() => {
    const consulta = window.matchMedia("(min-width: 1024px)");
    const aoMudar = () => {
      if (consulta.matches) {
        setMobileAberto(false);
      }
    };

    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  const persistir = useCallback((valor: boolean) => {
    setRecolhida(valor);
    localStorage.setItem(CHAVE_SIDEBAR, valor ? "1" : "0");
  }, []);

  const aoClicarMenu = useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      persistir(!recolhida);
      return;
    }

    setMobileAberto(true);
  }, [persistir, recolhida]);

  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-dvh bg-app pb-[env(safe-area-inset-bottom)]">
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar pt-[env(safe-area-inset-top)] transition-[width] duration-200 ease-out lg:flex",
            recolhida ? "w-[72px]" : "w-[224px]",
          )}
        >
          <BarraLateral
            recolhida={recolhida}
            onExpandir={() => persistir(false)}
          />
        </aside>

        <Sheet open={mobileAberto} onOpenChange={setMobileAberto}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="gap-0 p-0 pt-[env(safe-area-inset-top)] data-[side=left]:w-[min(224px,85vw)] data-[side=left]:sm:max-w-[224px]"
          >
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">
              Navegação principal do sistema das Fazendas Joana e Cataguá
            </SheetDescription>
            <BarraLateral
              recolhida={false}
              onNavigate={() => setMobileAberto(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Cabecalho usuario={usuario} onMenu={aoClicarMenu} />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
