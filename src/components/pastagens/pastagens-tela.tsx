"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Ruler, Wheat } from "lucide-react";

import { CardResumo } from "@/components/layout/card-resumo";
import { PiqueteFormulario } from "@/components/pastagens/piquete-formulario";
import { PiqueteSheet } from "@/components/pastagens/piquete-sheet";
import { PastagensTabela } from "@/components/pastagens/pastagens-tabela";
import { formatarHa, formatarUa } from "@/components/pastagens/piquete-badges";
import { Button } from "@/components/ui/button";
import { DialogOuSheet } from "@/components/ui/dialog-ou-sheet";
import { IconeBoi } from "@/components/icons/icone-boi";
import { formatarInteiro } from "@/lib/formatacao";
import { resumoPiquetes, type PiqueteResumo } from "@/lib/pastagens";

export function PastagensTela({
  piquetes,
  piqueteInicial,
}: {
  piquetes: PiqueteResumo[];
  piqueteInicial?: PiqueteResumo | null;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<PiqueteResumo | null>(null);
  const [detalhe, setDetalhe] = useState<PiqueteResumo | null>(
    piqueteInicial ?? null,
  );
  const resumo = resumoPiquetes(piquetes);

  const subtitulo =
    piquetes.length === 1
      ? "1 piquete cadastrado"
      : `${formatarInteiro(piquetes.length)} piquetes cadastrados`;

  function abrirNovo() {
    setEditando(null);
    setAberto(true);
  }

  function abrirEditar(piquete: PiqueteResumo) {
    setEditando(piquete);
    setAberto(true);
  }

  function abrirDetalhe(piquete: PiqueteResumo) {
    setDetalhe(piquete);
    router.replace(`/pastagens?piquete=${piquete.id}`, { scroll: false });
  }

  function fecharDetalhe() {
    setDetalhe(null);
    router.replace("/pastagens", { scroll: false });
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-texto">Pastagens</h1>
          <p className="mt-1 text-sm text-texto-suave">{subtitulo}</p>
        </div>
        <Button type="button" className="h-10 rounded-[10px] px-4" onClick={abrirNovo}>
          <Plus />
          Novo piquete
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CardResumo
          rotulo="Piquetes"
          valor={formatarInteiro(resumo.total)}
          icone={<Wheat className="size-6" />}
        />
        <CardResumo
          rotulo="Área total"
          valor={formatarHa(resumo.areaTotal)}
          icone={<Ruler className="size-6" />}
        />
        <CardResumo
          rotulo="Lotação média"
          valor={
            resumo.lotacaoMedia == null
              ? "—"
              : `${formatarUa(resumo.lotacaoMedia)} UA/ha`
          }
          icone={<IconeBoi className="size-6" />}
        />
      </div>

      <PastagensTabela
        piquetes={piquetes}
        onEditar={abrirEditar}
        onDetalhe={abrirDetalhe}
        onNovo={abrirNovo}
      />

      <p className="text-xs text-texto-suave">1 UA = 450 kg de peso vivo</p>

      <DialogOuSheet
        aberto={aberto}
        onAbertoChange={setAberto}
        titulo={editando ? "Editar piquete" : "Novo piquete"}
        descricao={
          editando
            ? "Atualize os dados do piquete."
            : "Informe os dados da pastagem."
        }
      >
        <PiqueteFormulario
          key={editando?.id ?? "novo"}
          piquete={editando}
          onCancelar={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false);
            router.refresh();
          }}
        />
      </DialogOuSheet>

      <PiqueteSheet piquete={detalhe} onFechar={fecharDetalhe} />
    </div>
  );
}
