"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dna, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  alterarAtivaRaca,
  excluirRaca,
} from "@/app/(app)/cadastros/racas/actions";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { RacaCard } from "@/components/racas/raca-card";
import { RacaFormulario } from "@/components/racas/raca-formulario";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogOuSheet } from "@/components/ui/dialog-ou-sheet";
import { formatarInteiro } from "@/lib/formatacao";
import type { RacaItem } from "@/lib/racas";

export function RacasTela({
  padrao,
  minhas,
}: {
  padrao: RacaItem[];
  minhas: RacaItem[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<RacaItem | null>(null);
  const [confirmar, setConfirmar] = useState<RacaItem | null>(null);
  const [pendente, startTransition] = useTransition();

  const total = padrao.length + minhas.length;
  const subtitulo =
    total === 1
      ? "1 raça disponível"
      : `${formatarInteiro(total)} raças disponíveis`;

  function abrirNova() {
    setEditando(null);
    setAberto(true);
  }

  function alterarAtiva(raca: RacaItem, ativa: boolean) {
    startTransition(async () => {
      const resultado = await alterarAtivaRaca(raca.id, ativa);

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível atualizar a raça.");
        return;
      }

      toast.success(resultado.message);
      router.refresh();
    });
  }

  function excluir() {
    if (!confirmar) {
      return;
    }

    startTransition(async () => {
      const resultado = await excluirRaca(confirmar.id);

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível excluir a raça.");
        return;
      }

      setConfirmar(null);
      toast.success(resultado.message ?? "Raça excluída.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Raças</h1>
          <p className="mt-1 text-sm text-texto-suave">{subtitulo}</p>
        </div>
        <Button type="button" className="h-10 rounded-[10px] px-4" onClick={abrirNova}>
          <Plus />
          Nova raça
        </Button>
      </header>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-texto">
            Raças padrão do sistema
          </h2>
          <p className="text-sm text-texto-suave">
            Disponíveis para todas as fazendas. Somente leitura.
          </p>
        </div>
        {padrao.length === 0 ? (
          <EstadoVazio
            icone={Dna}
            titulo="Nenhuma raça padrão"
            descricao="As raças do sistema ainda não foram cadastradas."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {padrao.map((raca) => (
              <RacaCard key={raca.id} raca={raca} somenteLeitura />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-texto">Minhas raças</h2>
          <p className="text-sm text-texto-suave">
            Cadastros desta fazenda. Uma raça desativada some das listas de
            seleção, mas permanece nos animais que já a usam.
          </p>
        </div>
        {minhas.length === 0 ? (
          <EstadoVazio
            icone={Dna}
            titulo="Nenhuma raça própria"
            descricao="Cadastre raças específicas desta fazenda, além das raças padrão."
            acao={
              <Button
                type="button"
                className="h-10 rounded-[10px] px-4"
                onClick={abrirNova}
              >
                <Plus />
                Nova raça
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {minhas.map((raca) => (
              <RacaCard
                key={raca.id}
                raca={raca}
                onRenomear={(item) => {
                  setEditando(item);
                  setAberto(true);
                }}
                onDesativar={(item) => alterarAtiva(item, false)}
                onReativar={(item) => alterarAtiva(item, true)}
                onExcluir={setConfirmar}
              />
            ))}
          </div>
        )}
      </section>

      <DialogOuSheet
        aberto={aberto}
        onAbertoChange={setAberto}
        titulo={editando ? "Renomear raça" : "Nova raça"}
        descricao={
          editando
            ? "O nome precisa ser único, ignorando maiúsculas e minúsculas."
            : "A raça fica disponível só nesta fazenda."
        }
      >
        <RacaFormulario
          key={editando?.id ?? "nova"}
          raca={editando}
          onCancelar={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false);
            router.refresh();
          }}
        />
      </DialogOuSheet>

      <Dialog open={Boolean(confirmar)} onOpenChange={(abertoDlg) => !abertoDlg && setConfirmar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir raça?</DialogTitle>
            <DialogDescription>
              {confirmar
                ? `A raça ${confirmar.nome} será removida. Só é possível excluir raças sem animais vinculados.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmar(null)}
              disabled={pendente}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={excluir} disabled={pendente}>
              {pendente ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
