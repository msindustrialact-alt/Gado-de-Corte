"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, EllipsisVertical, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

import { arquivarPiquete } from "@/app/(app)/pastagens/actions";
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
import type { PiqueteResumo } from "@/lib/pastagens";

export function PiqueteAcoes({
  piquete,
  onEditar,
  onDetalhe,
}: {
  piquete: PiqueteResumo;
  onEditar: (piquete: PiqueteResumo) => void;
  onDetalhe: (piquete: PiqueteResumo) => void;
}) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function arquivar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await arquivarPiquete(piquete.id);

      if (!resultado.ok) {
        setErro(resultado.message ?? "Não foi possível arquivar o piquete.");
        toast.error(resultado.message ?? "Não foi possível arquivar o piquete.");
        return;
      }

      setConfirmar(false);
      toast.success(resultado.message ?? "Piquete arquivado.");
      router.refresh();
    });
  }

  return (
    <div
      onClick={(evento) => evento.stopPropagation()}
      onKeyDown={(evento) => evento.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Ações do piquete ${piquete.nome}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-texto-suave hover:bg-muted hover:text-texto"
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => onDetalhe(piquete)}>
            <Eye />
            Ver animais
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditar(piquete)}>
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
            <DialogTitle>Arquivar piquete?</DialogTitle>
            <DialogDescription>
              O piquete {piquete.nome} sai da listagem, mas o histórico permanece.
              Isso não exclui o cadastro.
            </DialogDescription>
          </DialogHeader>
          {erro ? <p className="text-sm text-perigo">{erro}</p> : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmar(false)}
              disabled={pendente}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={arquivar} disabled={pendente}>
              {pendente ? "Arquivando..." : "Arquivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
