"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  arquivarVacinaAction,
  salvarProtocoloAction,
  salvarVacinaAction,
} from "@/app/(app)/sanidade/vacinas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProtocoloComItens, Vacina } from "@/lib/vacinas/data";

type ItemLocal = {
  vacina_id: string;
  obrigatoria: boolean;
  idade_minima_dias: string;
  ordem: number;
};

export function ProtocoloForm({
  protocolo,
  vacinasIniciais,
}: {
  protocolo: ProtocoloComItens | null;
  vacinasIniciais: Vacina[];
}) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const [vacinas, setVacinas] = useState(vacinasIniciais);
  const [nomeProtocolo, setNomeProtocolo] = useState(
    protocolo?.nome ?? "Protocolo padrão",
  );
  const [itens, setItens] = useState<ItemLocal[]>(
    protocolo?.itens.map((item, indice) => ({
      vacina_id: item.vacina_id,
      obrigatoria: item.obrigatoria,
      idade_minima_dias:
        item.idade_minima_dias != null ? String(item.idade_minima_dias) : "",
      ordem: item.ordem ?? indice,
    })) ?? [],
  );
  const [novaVacina, setNovaVacina] = useState({ nome: "", intervalo_dias: "" });

  const idsUsados = useMemo(
    () => new Set(itens.map((item) => item.vacina_id)),
    [itens],
  );

  const disponiveis = vacinas.filter(
    (vacina) => vacina.ativa && !idsUsados.has(vacina.id),
  );

  function adicionarVacina(vacinaId: string) {
    if (!vacinaId) return;
    setItens((atual) => [
      ...atual,
      {
        vacina_id: vacinaId,
        obrigatoria: true,
        idade_minima_dias: "",
        ordem: atual.length,
      },
    ]);
  }

  function criarVacina() {
    startTransition(async () => {
      const resultado = await salvarVacinaAction({
        nome: novaVacina.nome,
        intervalo_dias: novaVacina.intervalo_dias,
        observacoes: "",
        ativa: true,
      });

      if (!resultado.ok || !resultado.id) {
        toast.error(resultado.message ?? "Não foi possível criar a vacina.");
        return;
      }

      const criada: Vacina = {
        id: resultado.id,
        nome: novaVacina.nome.trim(),
        intervalo_dias: novaVacina.intervalo_dias.trim()
          ? Number(novaVacina.intervalo_dias.replace(",", "."))
          : null,
        ativa: true,
        observacoes: null,
      };

      setVacinas((atual) => [...atual, criada].sort((a, b) => a.nome.localeCompare(b.nome)));
      adicionarVacina(criada.id);
      setNovaVacina({ nome: "", intervalo_dias: "" });
      toast.success("Vacina criada.");
      router.refresh();
    });
  }

  function salvar() {
    startTransition(async () => {
      const resultado = await salvarProtocoloAction({
        id: protocolo?.id ?? "",
        nome: nomeProtocolo,
        itens,
      });

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível salvar o protocolo.");
        return;
      }

      toast.success("Protocolo salvo.");
      router.push("/sanidade/vacinas");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Protocolo ativo</h2>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-texto-suave">Nome</span>
          <Input
            value={nomeProtocolo}
            onChange={(e) => setNomeProtocolo(e.target.value)}
            className="h-10"
          />
        </label>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Vacinas do protocolo</h2>

        <div className="mt-3 space-y-2">
          {itens.map((item, indice) => {
            const vacina = vacinas.find((v) => v.id === item.vacina_id);
            return (
              <div
                key={`${item.vacina_id}-${indice}`}
                className="grid gap-2 rounded-[10px] border border-border p-3 sm:grid-cols-[1fr_7rem_auto_auto]"
              >
                <p className="text-sm font-medium text-texto">
                  {vacina?.nome ?? "Vacina"}
                  {vacina?.intervalo_dias != null ? (
                    <span className="ml-2 text-xs text-texto-suave">
                      reforço {vacina.intervalo_dias}d
                    </span>
                  ) : null}
                </p>
                <Input
                  value={item.idade_minima_dias}
                  onChange={(e) =>
                    setItens((atual) =>
                      atual.map((linha, i) =>
                        i === indice
                          ? { ...linha, idade_minima_dias: e.target.value }
                          : linha,
                      ),
                    )
                  }
                  placeholder="Idade mín. dias"
                  className="h-9"
                />
                <label className="flex items-center gap-2 text-xs text-texto">
                  <input
                    type="checkbox"
                    checked={item.obrigatoria}
                    onChange={(e) =>
                      setItens((atual) =>
                        atual.map((linha, i) =>
                          i === indice
                            ? { ...linha, obrigatoria: e.target.checked }
                            : linha,
                        ),
                      )
                    }
                  />
                  Obrigatória
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setItens((atual) => atual.filter((_, i) => i !== indice))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {disponiveis.length > 0 ? (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-texto-suave">
              Adicionar vacina existente
            </span>
            <select
              className="h-10 w-full rounded-[10px] border border-border bg-card px-2.5 text-sm"
              defaultValue=""
              onChange={(e) => {
                adicionarVacina(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="" disabled>
                Selecione…
              </option>
              {disponiveis.map((vacina) => (
                <option key={vacina.id} value={vacina.id}>
                  {vacina.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-texto">Nova vacina</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
          <Input
            value={novaVacina.nome}
            onChange={(e) =>
              setNovaVacina((atual) => ({ ...atual, nome: e.target.value }))
            }
            placeholder="Nome (ex.: Aftosa)"
            className="h-10"
          />
          <Input
            value={novaVacina.intervalo_dias}
            onChange={(e) =>
              setNovaVacina((atual) => ({
                ...atual,
                intervalo_dias: e.target.value,
              }))
            }
            placeholder="Intervalo dias"
            className="h-10"
          />
          <Button
            type="button"
            onClick={criarVacina}
            disabled={pendente || !novaVacina.nome.trim()}
          >
            <Plus />
            Criar
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={salvar} disabled={pendente || itens.length === 0}>
          Salvar protocolo
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/sanidade/vacinas")}
        >
          Cancelar
        </Button>
      </div>

      {vacinas.length > 0 ? (
        <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold text-texto">Catálogo</h2>
          <ul className="mt-2 space-y-1">
            {vacinas.map((vacina) => (
              <li
                key={vacina.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className={vacina.ativa ? "text-texto" : "text-texto-suave line-through"}>
                  {vacina.nome}
                </span>
                {vacina.ativa ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pendente}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await arquivarVacinaAction(vacina.id);
                        if (!r.ok) {
                          toast.error(r.message);
                          return;
                        }
                        setVacinas((atual) =>
                          atual.map((v) =>
                            v.id === vacina.id ? { ...v, ativa: false } : v,
                          ),
                        );
                        setItens((atual) =>
                          atual.filter((i) => i.vacina_id !== vacina.id),
                        );
                        toast.success("Vacina arquivada.");
                      })
                    }
                  >
                    Arquivar
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
