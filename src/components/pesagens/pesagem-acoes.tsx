"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, EllipsisVertical, Eye, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { arquivarPesagem, reabrirPesagem } from "@/app/(app)/pesagens/actions";
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
import type { PesagemResumo } from "@/lib/pesagens";

export function PesagemAcoes({ pesagem }: { pesagem: PesagemResumo }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [pendente, startTransition] = useTransition();
  const emAberto = pesagem.status === "rascunho";

  function reabrir() {
    startTransition(async () => {
      const resultado = await reabrirPesagem(pesagem.id);

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível reabrir a pesagem.");
        return;
      }

      toast.success(resultado.message);
      router.push(`/pesagens/${pesagem.id}`);
      router.refresh();
    });
  }

  function arquivar() {
    startTransition(async () => {
      const resultado = await arquivarPesagem(pesagem.id);

      if (!resultado.ok) {
        toast.error(
          resultado.message ??
            (emAberto
              ? "Não foi possível excluir a pesagem."
              : "Não foi possível arquivar a pesagem."),
        );
        return;
      }

      setConfirmar(false);
      toast.success(emAberto ? "Pesagem excluída." : resultado.message);
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
          aria-label={`Ações da pesagem ${pesagem.lote_nome}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-texto-suave hover:bg-muted hover:text-texto"
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => router.push(`/pesagens/${pesagem.id}`)}>
            <Eye />
            Abrir sessão
          </DropdownMenuItem>
          {pesagem.status === "concluida" ? (
            <DropdownMenuItem onClick={reabrir} disabled={pendente}>
              <RotateCcw />
              Reabrir
            </DropdownMenuItem>
          ) : null}
          {emAberto ? (
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmar(true)}>
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmar(true)}>
              <Archive />
              Arquivar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmar} onOpenChange={setConfirmar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {emAberto ? "Excluir pesagem em andamento?" : "Arquivar pesagem?"}
            </DialogTitle>
            <DialogDescription>
              {emAberto
                ? `A sessão aberta do lote ${pesagem.lote_nome} será removida da listagem. Você poderá iniciar outra pesagem para este lote.`
                : `A sessão do lote ${pesagem.lote_nome} sai da listagem. Os pesos concluídos continuam no histórico do animal.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmar(false)} disabled={pendente}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={arquivar} disabled={pendente}>
              {pendente
                ? emAberto
                  ? "Excluindo..."
                  : "Arquivando..."
                : emAberto
                  ? "Excluir"
                  : "Arquivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
