"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  OPCOES_CATEGORIA,
  OPCOES_SEXO,
  OPCOES_STATUS,
  urlAnimais,
  type FiltrosAnimais,
  type OpcaoFiltro,
} from "@/lib/animais";

type Props = {
  filtros: FiltrosAnimais;
  racas: OpcaoFiltro[];
  lotes: OpcaoFiltro[];
  piquetes: OpcaoFiltro[];
};

export function AnimaisFiltros({ filtros, racas, lotes, piquetes }: Props) {
  const router = useRouter();
  const [busca, setBusca] = useState(filtros.q);

  useEffect(() => {
    setBusca(filtros.q);
  }, [filtros.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const texto = busca.trim();

      if (texto === filtros.q) {
        return;
      }

      router.push(urlAnimais(filtros, { q: texto }));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [busca, filtros, router]);

  function atualizar(patch: Partial<FiltrosAnimais>) {
    router.push(urlAnimais(filtros, patch));
  }

  const campos = (
    <CamposFiltro
      filtros={filtros}
      racas={racas}
      lotes={lotes}
      piquetes={piquetes}
      onChange={atualizar}
    />
  );

  return (
    <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar animal</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-suave"
            />
            <Input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Brinco, nome, chip ou SISBOV"
              className="h-10 rounded-[10px] border-border bg-bg-app pr-3 pl-10 shadow-none"
            />
          </label>
          <Sheet>
            <SheetTrigger className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 text-sm font-medium text-texto md:hidden">
              <SlidersHorizontal className="size-4" />
              Filtros
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,24rem)] p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Refine a listagem de animais.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 overflow-y-auto p-4">
                {campos}
                <Button
                  nativeButton={false}
                  variant="outline"
                  className="mt-2"
                  render={<Link href="/animais" />}
                >
                  <X />
                  Limpar filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-3 xl:grid-cols-7">
          {campos}
          <div className="flex items-end">
            <Button
              nativeButton={false}
              variant="outline"
              className="h-9 w-full rounded-[10px]"
              render={<Link href="/animais" />}
            >
              <X />
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CamposFiltro({
  filtros,
  racas,
  lotes,
  piquetes,
  onChange,
}: Props & { onChange: (patch: Partial<FiltrosAnimais>) => void }) {
  return (
    <>
      <CampoSelect
        rotulo="Status"
        valor={filtros.status}
        opcoes={OPCOES_STATUS}
        onChange={(status) =>
          onChange({ status: status as FiltrosAnimais["status"] })
        }
      />
      <CampoSelect
        rotulo="Sexo"
        valor={filtros.sexo}
        opcoes={OPCOES_SEXO}
        onChange={(sexo) =>
          onChange({ sexo: sexo as FiltrosAnimais["sexo"] })
        }
      />
      <CampoSelect
        rotulo="Categoria"
        valor={filtros.categoria}
        opcoes={OPCOES_CATEGORIA}
        onChange={(categoria) =>
          onChange({ categoria: categoria as FiltrosAnimais["categoria"] })
        }
      />
      <CampoSelect
        rotulo="Raça"
        valor={filtros.racaId}
        opcoes={[{ valor: "", rotulo: "Todas" }, ...racas]}
        onChange={(racaId) => onChange({ racaId })}
      />
      <CampoSelect
        rotulo="Lote"
        valor={filtros.loteId}
        opcoes={[{ valor: "", rotulo: "Todos" }, ...lotes]}
        onChange={(loteId) => onChange({ loteId })}
      />
      <CampoSelect
        rotulo="Piquete"
        valor={filtros.piqueteId}
        opcoes={[{ valor: "", rotulo: "Todos" }, ...piquetes]}
        onChange={(piqueteId) => onChange({ piqueteId })}
      />
    </>
  );
}

function CampoSelect({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string;
  valor: string;
  opcoes: OpcaoFiltro[];
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-texto-suave">{rotulo}</span>
      <select
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className="h-9 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {opcoes.map((opcao) => (
          <option key={`${rotulo}-${opcao.valor || "todos"}`} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
