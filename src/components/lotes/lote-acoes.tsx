"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, EllipsisVertical, Eye, Pencil, RotateCcw, SquareStop } from "lucide-react";
import { toast } from "sonner";

import {
  alterarStatusLote,
  arquivarLote,
} from "@/app/(app)/lotes/actions";
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
import type { LoteResumo } from "@/lib/lotes";

export function LoteAcoes({
  lote,
  onEditar,
}: {
  lote: LoteResumo;
  onEditar: (lote: LoteResumo) => void;
}) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function encerrarOuReabrir() {
    const proximo = lote.status === "ativo" ? "encerrado" : "ativo";
    startTransition(async () => {
      const resultado = await alterarStatusLote(lote.id, proximo);

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível atualizar o lote.");
        return;
      }

      toast.success(resultado.message);
      router.refresh();
    });
  }

  function arquivar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await arquivarLote(lote.id);

      if (!resultado.ok) {
        setErro(resultado.message ?? "Não foi possível arquivar o lote.");
        toast.error(resultado.message ?? "Não foi possível arquivar o lote.");
        return;
      }

      setConfirmar(false);
      toast.success(resultado.message ?? "Lote arquivado.");
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
          aria-label={`Ações do lote ${lote.nome}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-texto-suave hover:bg-muted hover:text-texto"
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => router.push(`/lotes/${lote.id}`)}>
            <Eye />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditar(lote)}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={encerrarOuReabrir} disabled={pendente}>
            {lote.status === "ativo" ? <SquareStop /> : <RotateCcw />}
            {lote.status === "ativo" ? "Encerrar" : "Reabrir"}
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
            <DialogTitle>Arquivar lote?</DialogTitle>
            <DialogDescription>
              O lote {lote.nome} sai da listagem, mas o histórico permanece. Isso
              não exclui o cadastro.
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
