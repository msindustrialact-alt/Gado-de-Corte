"use client";

import { Suspense } from "react";
import { Bell, Menu, Search } from "lucide-react";

import { BuscaCabecalho } from "@/components/layout/busca-cabecalho";
import type { DadosUsuario } from "@/components/layout/types";
import { MenuUsuario } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Cabecalho({
  usuario,
  onMenu,
}: {
  usuario: DadosUsuario;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-3 pt-[env(safe-area-inset-top)] md:gap-4 md:px-5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Menu de navegação"
        onClick={onMenu}
        className="size-10 shrink-0 text-texto hover:bg-muted"
      >
        <Menu className="size-5" />
      </Button>

      <Suspense fallback={<BuscaCabecalhoFallback />}>
        <BuscaCabecalho />
      </Suspense>

      <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notificações, 3 não lidas"
          className="relative size-10 text-texto hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-perigo px-1 text-[10px] font-semibold leading-none text-card">
            3
          </span>
        </Button>

        <MenuUsuario usuario={usuario} />
      </div>
    </header>
  );
}

function BuscaCabecalhoFallback() {
  return (
    <div className="relative min-w-0 flex-1 max-w-[470px]">
      <Input
        type="search"
        disabled
        placeholder="Buscar animal, lote, brinco..."
        className="h-[42px] rounded-[10px] border border-[#E4E9E6] bg-[#F1F4F2] pr-12 pl-3.5 text-sm shadow-none placeholder:text-texto-suave"
      />
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-texto-suave">
        <Search className="size-4" aria-hidden />
      </span>
    </div>
  );
}
