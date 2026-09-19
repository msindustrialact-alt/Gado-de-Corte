"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DadosUsuario } from "@/components/layout/types";
import { createClient } from "@/lib/supabase/client";

export function MenuUsuario({ usuario }: { usuario: DadosUsuario }) {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={
          usuario.papel ? `${usuario.nome}, ${usuario.papel}` : usuario.nome
        }
        className="flex items-center gap-2.5 rounded-lg py-1 pr-1 pl-1 text-left hover:bg-muted data-popup-open:bg-muted"
      >
        <Avatar className="size-9">
          {usuario.avatarUrl ? (
            <AvatarImage src={usuario.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
            {usuario.iniciais}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 md:flex md:flex-col">
          <span className="truncate text-sm leading-tight font-semibold text-texto">
            {usuario.nome}
          </span>
          {usuario.papel ? (
            <span className="truncate text-xs leading-tight text-texto-suave">
              {usuario.papel}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className="hidden size-4 shrink-0 text-texto-suave md:block"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem
          className="focus:bg-muted focus:text-foreground"
          onClick={() => router.push("/perfil")}
        >
          <UserRound />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={sair}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
