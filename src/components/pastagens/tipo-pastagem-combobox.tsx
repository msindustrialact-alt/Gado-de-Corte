"use client";

import { useState } from "react";

import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Label } from "@/components/ui/label";
import { SUGESTOES_PASTAGEM } from "@/lib/pastagens";
import { cn } from "@/lib/utils";

export function TipoPastagemCombobox({
  id,
  valor,
  onChange,
  erro,
}: {
  id: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const termo = valor.trim().toLocaleLowerCase("pt-BR");
  const sugestoes = SUGESTOES_PASTAGEM.filter((item) =>
    item.toLocaleLowerCase("pt-BR").includes(termo),
  );

  return (
    <div className="relative min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        Tipo de pastagem
      </Label>
      <input
        id={id}
        autoComplete="off"
        value={valor}
        aria-invalid={erro ? true : undefined}
        onChange={(evento) => {
          onChange(evento.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => window.setTimeout(() => setAberto(false), 120)}
        className={CLASSE_CAMPO}
        placeholder="Ex.: Marandu, Mombaça..."
      />
      {aberto && sugestoes.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-[10px] border border-border bg-card py-1 shadow-card">
          {sugestoes.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm text-texto hover:bg-muted",
                  item === valor && "bg-muted font-medium",
                )}
                onMouseDown={(evento) => {
                  evento.preventDefault();
                  onChange(item);
                  setAberto(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}
