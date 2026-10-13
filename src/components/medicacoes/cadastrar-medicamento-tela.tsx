"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  atualizarMedicamentoAction,
  cadastrarMedicamentoAction,
} from "@/app/(app)/sanidade/medicacoes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LABELS_VIA,
  VIAS_MEDICAMENTO,
  textoCarencia,
  type Medicamento,
  type ViaMedicamento,
} from "@/lib/medicacoes/tipos";

const vazio = {
  id: "",
  nome: "",
  via: "injetavel" as ViaMedicamento,
  dose: "",
  carencia: "",
};

export function CadastrarMedicamentoTela({
  medicamentos,
}: {
  medicamentos: Medicamento[];
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [form, setForm] = useState(vazio);

  function editar(item: Medicamento) {
    setForm({
      id: item.id,
      nome: item.nome,
      via: item.via,
      dose: item.dose ?? "",
      carencia: item.carencia_dias == null ? "" : String(item.carencia_dias),
    });
  }

  function enviar() {
    if (form.carencia === "") {
      toast.error("Informe a carência. Use 0 se não houver.");
      return;
    }

    const carenciaDias = Number(form.carencia);

    iniciar(async () => {
      const dados = {
        nome: form.nome,
        via: form.via,
        dose: form.dose,
        carenciaDias,
      };
      const resultado = form.id
        ? await atualizarMedicamentoAction({ id: form.id, ...dados })
        : await cadastrarMedicamentoAction(dados);

      if (!resultado.ok) {
        toast.error(resultado.message);
        return;
      }

      toast.success(form.id ? "Medicamento atualizado." : "Medicamento cadastrado.");
      setForm(vazio);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-[12px] border border-border bg-card p-3 shadow-card sm:grid-cols-2 sm:p-4">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-texto-suave">Nome</span>
          <Input
            value={form.nome}
            onChange={(evento) =>
              setForm((atual) => ({ ...atual, nome: evento.target.value }))
            }
            className="h-11 md:h-10"
            placeholder="Ex.: Ivomec, Modificador, ADE"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texto-suave">Via</span>
          <select
            value={form.via}
            onChange={(evento) =>
              setForm((atual) => ({
                ...atual,
                via: evento.target.value as ViaMedicamento,
              }))
            }
            className="h-11 rounded-[10px] border border-border bg-card px-2.5 text-sm text-texto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-10"
          >
            {VIAS_MEDICAMENTO.map((via) => (
              <option key={via} value={via}>
                {LABELS_VIA[via]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texto-suave">
            Carência de abate (dias)
          </span>
          <Input
            inputMode="numeric"
            value={form.carencia}
            onChange={(evento) =>
              setForm((atual) => ({
                ...atual,
                carencia: evento.target.value.replace(/\D/g, ""),
              }))
            }
            className="h-11 md:h-10"
            placeholder="0 se não houver"
          />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-texto-suave">Dose</span>
          <Input
            value={form.dose}
            onChange={(evento) =>
              setForm((atual) => ({ ...atual, dose: evento.target.value }))
            }
            className="h-11 md:h-10"
            placeholder="Ex.: 1 ml para cada 50 kg"
          />
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="button" onClick={enviar} disabled={pendente}>
            {pendente ? <Loader2 className="animate-spin" /> : null}
            {form.id ? "Salvar" : "Cadastrar"}
          </Button>
          {form.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(vazio)}
              disabled={pendente}
            >
              Cancelar edição
            </Button>
          ) : null}
        </div>
      </section>

      <ul className="space-y-2">
        {medicamentos.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-[12px] border border-border bg-card px-4 py-3 shadow-card"
          >
            <div className="min-w-0">
              <p className="font-semibold text-texto">{item.nome}</p>
              <p className="mt-0.5 text-xs text-texto-suave">
                {LABELS_VIA[item.via]}
                {" · "}
                {item.dose ?? "Dose não informada"}
                {" · "}
                {textoCarencia(item.carencia_dias)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 rounded-[10px]"
              onClick={() => editar(item)}
            >
              Editar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
