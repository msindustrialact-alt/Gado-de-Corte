"use client";

import { useState } from "react";

import { criarRaca } from "@/app/(app)/animais/actions";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { OpcaoFiltro } from "@/lib/animais";
import { cn } from "@/lib/utils";

const NOVA = "__nova__";

export function RacaSelect({
  id,
  valor,
  racas,
  onChange,
  onRacasChange,
  erro,
}: {
  id: string;
  valor: string;
  racas: OpcaoFiltro[];
  onChange: (id: string) => void;
  onRacasChange: (racas: OpcaoFiltro[]) => void;
  erro?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [erroDialogo, setErroDialogo] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  async function salvarRaca() {
    setPendente(true);
    setErroDialogo(null);
    const resultado = await criarRaca(nome);
    setPendente(false);

    if (!resultado.ok) {
      setErroDialogo(resultado.message);
      return;
    }

    if (!racas.some((raca) => raca.valor === resultado.id)) {
      onRacasChange(
        [...racas, { valor: resultado.id, rotulo: resultado.nome }].sort((a, b) =>
          a.rotulo.localeCompare(b.rotulo, "pt-BR"),
        ),
      );
    }

    onChange(resultado.id);
    setNome("");
    setAberto(false);
  }

  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        Raça
      </Label>
      <select
        id={id}
        value={valor}
        aria-invalid={erro ? true : undefined}
        onChange={(evento) => {
          if (evento.target.value === NOVA) {
            setAberto(true);
            return;
          }

          onChange(evento.target.value);
        }}
        className={cn(CLASSE_CAMPO, "bg-card")}
      >
        <option value="">Sem raça</option>
        {racas.map((raca) => (
          <option key={raca.valor} value={raca.valor}>
            {raca.rotulo}
          </option>
        ))}
        <option value={NOVA}>+ Cadastrar nova raça</option>
      </select>
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova raça</DialogTitle>
            <DialogDescription>
              A raça fica disponível só nesta fazenda.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="nova-raca" className="mb-1.5 text-sm text-texto">
              Nome
            </Label>
            <input
              id="nova-raca"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              className={CLASSE_CAMPO}
              autoFocus
            />
            {erroDialogo ? (
              <p className="mt-1 text-sm text-perigo">{erroDialogo}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAberto(false)}
              disabled={pendente}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={salvarRaca} disabled={pendente}>
              {pendente ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
