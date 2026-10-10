"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BuscaCabecalho() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (pathname === "/animais") {
      setBusca(searchParams.get("q") ?? "");
      return;
    }

    if (!pathname.startsWith("/animais")) {
      setBusca("");
    }
  }, [pathname, searchParams]);

  function enviarBusca(evento?: FormEvent<HTMLFormElement>) {
    evento?.preventDefault();
    const q = busca.trim();
    router.push(q ? `/animais?q=${encodeURIComponent(q)}` : "/animais");
  }

  return (
    <form
      className="relative min-w-0 flex-1 max-w-[470px]"
      onSubmit={enviarBusca}
    >
      <label className="block">
        <span className="sr-only">Buscar animal, lote ou brinco</span>
        <Input
          type="search"
          name="q"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Buscar animal, lote, brinco..."
          className="h-[42px] rounded-[10px] border border-[#E4E9E6] bg-[#F1F4F2] pr-12 pl-3.5 text-sm shadow-none placeholder:text-texto-suave focus-visible:border-[#E4E9E6] focus-visible:ring-0"
        />
      </label>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Buscar"
        className="absolute top-1/2 right-1 size-9 -translate-y-1/2 text-texto-suave hover:bg-transparent hover:text-primary"
      >
        <Search className="size-4" />
      </Button>
    </form>
  );
}
