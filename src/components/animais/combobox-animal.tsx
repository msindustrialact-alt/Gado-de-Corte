"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { buscarParentes } from "@/app/(app)/animais/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Opcao = { id: string; rotulo: string };

export function ComboboxAnimal({
  id,
  rotulo,
  valor,
  rotuloSelecionado,
  sexo,
  excluirId,
  onChange,
  erro,
  placeholder,
}: {
  id: string;
  rotulo: string;
  valor: string;
  rotuloSelecionado: string;
  sexo: "macho" | "femea";
  excluirId?: string;
  onChange: (id: string, rotulo: string) => void;
  erro?: string;
  placeholder: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCarregando(true);
      void buscarParentes({ q: busca, sexo, excluirId }).then((lista) => {
        setOpcoes(lista);
        setCarregando(false);
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [aberto, busca, sexo, excluirId]);

  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        {rotulo}
      </Label>
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger
          id={id}
          className={cn(
            CLASSE_CAMPO,
            "flex items-center justify-between gap-2 text-left",
            !valor && "text-texto-suave",
          )}
          aria-invalid={erro ? true : undefined}
        >
          <span className="truncate">
            {valor ? rotuloSelecionado || placeholder : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-texto-suave" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--anchor-width)] min-w-72 p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por brinco ou nome"
              value={busca}
              onValueChange={setBusca}
            />
            <CommandList>
              <CommandEmpty>
                {carregando ? "Buscando..." : "Nenhum animal encontrado."}
              </CommandEmpty>
              <CommandGroup>
                {opcoes.map((opcao) => (
                  <CommandItem
                    key={opcao.id}
                    value={opcao.id}
                    onSelect={() => {
                      onChange(opcao.id, opcao.rotulo);
                      setAberto(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{opcao.rotulo}</span>
                    {valor === opcao.id ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {valor ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-texto-suave hover:bg-muted"
              onClick={() => {
                onChange("", "");
                setAberto(false);
              }}
            >
              <X className="size-4" />
              Limpar seleção
            </button>
          ) : null}
        </PopoverContent>
      </Popover>
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}
