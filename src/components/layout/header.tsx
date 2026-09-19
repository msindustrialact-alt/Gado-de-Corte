"use client";

import { Bell, Menu, Search } from "lucide-react";

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
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-3 md:gap-4 md:px-5">
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

      <label className="relative min-w-0 flex-1 md:max-w-xl">
        <span className="sr-only">Buscar</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-suave"
        />
        <Input
          type="search"
          autoComplete="off"
          placeholder="Buscar animal, lote, brinco, pesagem..."
          className="h-10 rounded-full border-0 bg-app pr-4 pl-10 text-sm shadow-none placeholder:text-texto-suave focus-visible:ring-1"
        />
      </label>

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
