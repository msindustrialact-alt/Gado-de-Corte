"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EllipsisVertical, Eye, Pencil, Archive } from "lucide-react";

import { arquivarAnimal } from "@/app/(app)/animais/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AnimalAcoes({
  id,
  brinco,
}: {
  id: string;
  brinco: string;
}) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function arquivar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await arquivarAnimal(id);

      if (!resultado.ok) {
        setErro(resultado.mensagem);
        return;
      }

      setConfirmar(false);
      router.refresh();
    });
  }

  return (
    <div onClick={(evento) => evento.stopPropagation()} onKeyDown={(evento) => evento.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Ações do animal ${brinco}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-texto-suave hover:bg-muted hover:text-texto"
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => router.push(`/animais/${id}`)}>
            <Eye />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/animais/${id}/editar`)}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmar(true)}
          >
            <Archive />
            Arquivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmar} onOpenChange={setConfirmar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar animal?</DialogTitle>
            <DialogDescription>
              O animal {brinco} sai da listagem, mas o histórico permanece. Isso
              não exclui o cadastro.
            </DialogDescription>
          </DialogHeader>
          {erro ? (
            <p className="text-sm text-perigo">{erro}</p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmar(false)}
              disabled={pendente}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={arquivar}
              disabled={pendente}
            >
              {pendente ? "Arquivando..." : "Arquivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
