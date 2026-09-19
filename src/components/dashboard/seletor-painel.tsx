"use client";

import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SeletorPainel({
  valor,
  opcoes,
}: {
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
}) {
  const [pronto, setPronto] = useState(false);
  const rotulo = opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? valor;
  const items = Object.fromEntries(
    opcoes.map((opcao) => [opcao.valor, opcao.rotulo]),
  );

  useEffect(() => {
    setPronto(true);
  }, []);

  if (!pronto) {
    return (
      <span className="inline-flex h-7 items-center gap-1 px-2 text-xs font-medium text-texto-suave">
        {rotulo}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </span>
    );
  }

  return (
    <Select defaultValue={valor} items={items}>
      <SelectTrigger
        size="sm"
        className="h-7 gap-1 border-0 bg-transparent py-0 pr-0.5 pl-2 text-xs font-medium text-texto-suave shadow-none hover:bg-muted"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="min-w-40">
        {opcoes.map((opcao) => (
          <SelectItem key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
