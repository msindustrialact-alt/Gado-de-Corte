"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Loader2,
  RotateCcw,
  Save,
  Scale,
  Search,
  TrendingUp,
  Weight,
} from "lucide-react";
import { toast } from "sonner";

import {
  concluirPesagem,
  reabrirPesagem,
  salvarPesagem,
} from "@/app/(app)/pesagens/actions";
import { CampoMoeda, formatarMoedaValor } from "@/components/animais/campo-moeda";
import { CustosPeriodoDialog } from "@/components/pesagens/custos-periodo-dialog";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { CardResumo } from "@/components/layout/card-resumo";
import { LucratividadeProjecaoPainel } from "@/components/lucratividade/lucratividade-projecao-painel";
import { ObjetivoBadge } from "@/components/lotes/lote-badges";
import { PesagemAnimalLinha } from "@/components/pesagens/pesagem-animal-linha";
import { StatusPesagemBadge } from "@/components/pesagens/pesagem-badges";
import { Button, buttonVariants } from "@/components/ui/button";
import type { LoteLucratividadeBase } from "@/lib/lucratividade";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPeso } from "@/lib/animais";
import { formatarData, formatarInteiro, formatarMoeda } from "@/lib/formatacao";
import {
  desempenhoDaLinha,
  formatArroba,
  formatCobertura,
  formatCustoArroba,
  formatGanho,
  formatGmd,
  formatUniformidade,
  OPCOES_CONDICAO_PESAGEM,
  pesoParaCampo,
  resumoSessaoLive,
  TEXTO_DICA_JEJUM,
  TEXTO_TOOLTIP_ARROBA,
  UNIFORMIDADE_CV_ALERTA,
  type CondicaoPesagem,
  type FiltroListaSessao,
  type PesagemSessao,
} from "@/lib/pesagens";
import { cn } from "@/lib/utils";

const FILTROS: { valor: FiltroListaSessao; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "pendentes", rotulo: "Pendentes" },
  { valor: "pesados", rotulo: "Pesados" },
  { valor: "atencao", rotulo: "Atenção" },
];

export function PesagemSessaoTela({
  sessao,
  lucratividade,
}: {
  sessao: PesagemSessao;
  lucratividade: LoteLucratividadeBase | null;
}) {
  const router = useRouter();
  const { cabecalho, animais } = sessao;
  const somenteLeitura = cabecalho.status === "concluida";
  const [pesos, setPesos] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      animais.map((animal) => [animal.id, pesoParaCampo(animal.peso_salvo_kg)]),
    ),
  );
  const [custo, setCusto] = useState(
    cabecalho.custo_alimentacao != null
      ? cabecalho.custo_alimentacao.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "",
  );
  const [condicao, setCondicao] = useState<CondicaoPesagem | "">(
    cabecalho.condicao_pesagem ?? "",
  );
  const [observacoes, setObservacoes] = useState(cabecalho.observacoes ?? "");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroListaSessao>("todos");
  const [confirmar, setConfirmar] = useState(false);
  const [pendente, startTransition] = useTransition();

  const custoNumero = useMemo(() => {
    const texto = custo.trim();

    if (!texto) {
      return null;
    }

    const normalizado = texto.includes(",")
      ? texto.replace(/\./g, "").replace(",", ".")
      : texto;
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
  }, [custo]);

  const condicaoAtual = condicao === "" ? null : condicao;

  const resumo = useMemo(
    () =>
      resumoSessaoLive(
        animais,
        pesos,
        cabecalho.data,
        custoNumero,
        condicaoAtual,
        cabecalho.qtd_lote,
      ),
    [animais, pesos, cabecalho.data, custoNumero, condicaoAtual, cabecalho.qtd_lote],
  );

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return animais.filter((animal) => {
      const desempenho = desempenhoDaLinha(
        pesos[animal.id] ?? "",
        animal,
        cabecalho.data,
        condicaoAtual,
      );
      const pesado = desempenho.peso_kg != null;

      if (filtro === "pendentes" && pesado) {
        return false;
      }

      if (filtro === "pesados" && !pesado) {
        return false;
      }

      if (
        filtro === "atencao" &&
        desempenho.alerta == null &&
        desempenho.confiabilidade !== "baixa" &&
        desempenho.confiabilidade !== "media"
      ) {
        return false;
      }

      if (!termo) {
        return true;
      }

      const nome = animal.nome?.toLocaleLowerCase("pt-BR") ?? "";
      return animal.brinco.toLocaleLowerCase("pt-BR").includes(termo) || nome.includes(termo);
    });
  }, [animais, busca, filtro, pesos, cabecalho.data, condicaoAtual]);

  const progresso =
    resumo.qtd_animais_lote === 0
      ? 0
      : (resumo.pesados / resumo.qtd_animais_lote) * 100;

  function payload() {
    return {
      custo_alimentacao: custo,
      condicao_pesagem: condicao,
      observacoes,
      itens: animais.map((animal) => ({
        animal_id: animal.id,
        peso: pesos[animal.id] ?? "",
      })),
    };
  }

  function focarProximo(atual: HTMLInputElement) {
    const inputs = [
      ...document.querySelectorAll<HTMLInputElement>("[data-peso-input]:not(:disabled)"),
    ].filter((campo) => campo.offsetParent !== null);
    const indice = inputs.indexOf(atual);
    const seguinte =
      inputs.slice(indice + 1).find((campo) => !campo.value.trim()) ?? inputs[indice + 1];
    seguinte?.focus();
    seguinte?.select();
  }

  function salvar(concluir: boolean) {
    startTransition(async () => {
      const resultado = concluir
        ? await concluirPesagem(cabecalho.id, payload())
        : await salvarPesagem(cabecalho.id, payload());

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível salvar a pesagem.");
        return;
      }

      setConfirmar(false);
      toast.success(resultado.message);
      router.refresh();
    });
  }

  function reabrir() {
    startTransition(async () => {
      const resultado = await reabrirPesagem(cabecalho.id);

      if (!resultado.ok) {
        toast.error(resultado.message ?? "Não foi possível reabrir a pesagem.");
        return;
      }

      toast.success(resultado.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 p-4 pb-28 md:p-6 md:pb-6">
      <header className="flex flex-col gap-3">
        <Link
          href="/pesagens"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-fit rounded-[10px] px-2 text-texto-suave",
          )}
        >
          <ArrowLeft />
          Voltar para pesagens
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-texto">{cabecalho.lote_nome}</h1>
              <ObjetivoBadge objetivo={cabecalho.lote_objetivo} />
              <StatusPesagemBadge status={cabecalho.status} />
            </div>
            <p className="mt-1 text-sm text-texto-suave">
              {formatarData(cabecalho.data)} ·{" "}
              {formatCobertura(
                resumo.pesados,
                resumo.qtd_animais_lote,
                resumo.cobertura_percentual,
              )}
              {resumo.pesados_fora_do_lote > 0
                ? ` · +${resumo.pesados_fora_do_lote} ${
                    resumo.pesados_fora_do_lote === 1
                      ? "animal que já saiu do lote, não conta na média"
                      : "animais que já saíram do lote, não contam na média"
                  }`
                : ""}{" "}
              · Enter avança para o próximo animal
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            {somenteLeitura ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-[10px] px-4"
                onClick={reabrir}
                disabled={pendente}
              >
                <RotateCcw />
                Reabrir
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-[10px] px-4"
                  onClick={() => salvar(false)}
                  disabled={pendente}
                >
                  {pendente ? <Loader2 className="animate-spin" /> : <Save />}
                  Salvar rascunho
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-[10px] px-4"
                  onClick={() => setConfirmar(true)}
                  disabled={
                    pendente ||
                    resumo.pesados + resumo.pesados_fora_do_lote === 0
                  }
                >
                  <Check />
                  Concluir pesagem
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-texto-suave">
          <span>
            Cobertura do lote:{" "}
            {formatCobertura(
              resumo.pesados,
              resumo.qtd_animais_lote,
              resumo.cobertura_percentual,
            )}
            {resumo.pesados_fora_do_lote > 0
              ? ` · +${resumo.pesados_fora_do_lote} fora do lote (não contam na média)`
              : ""}
          </span>
          <span>{Math.round(Math.min(progresso, 100))}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.min(progresso, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <CardResumo
          rotulo="Peso médio"
          valor={
            resumo.peso_medio != null
              ? `${formatPeso(resumo.peso_medio)} · ${formatArroba(resumo.peso_medio)}`
              : "—"
          }
          icone={<Scale className="size-6" />}
        />
        <CardResumo
          rotulo="Uniformidade (CV)"
          valor={formatUniformidade(resumo.uniformidade_cv)}
          icone={<Weight className="size-6" />}
        />
        <CardResumo
          rotulo="GMD do lote"
          valor={formatGmd(resumo.gmd_medio)}
          icone={<TrendingUp className="size-6" />}
        />
        <CardResumo
          rotulo="Ganho no período"
          valor={
            resumo.ganho_total_kg != null
              ? `${formatGanho(resumo.ganho_total_kg)} · ${formatArroba(resumo.ganho_total_kg)}`
              : "—"
          }
          icone={<Weight className="size-6" />}
        />
        <CardResumo
          rotulo="Custo @ est. produzida"
          valor={formatCustoArroba(resumo.custo_por_arroba)}
          icone={<CircleDollarSign className="size-6" />}
        />
      </div>
      {resumo.uniformidade_cv != null &&
      resumo.uniformidade_cv > UNIFORMIDADE_CV_ALERTA ? (
        <p className="rounded-[12px] border border-alerta/25 bg-alerta/8 px-4 py-3 text-sm text-alerta">
          Lote desuniforme (CV {formatarInteiro(Math.round(resumo.uniformidade_cv))}%).
          Considere separar por faixa de peso.
        </p>
      ) : null}

      {resumo.perdas > 0 ? (
        <p className="rounded-[12px] border border-perigo/20 bg-perigo/8 px-4 py-3 text-sm text-perigo">
          {resumo.perdas === 1
            ? "1 animal perdeu peso neste intervalo."
            : `${resumo.perdas} animais perderam peso neste intervalo.`}{" "}
          Vale conferir dieta, sanidade e se o peso foi digitado certo.
        </p>
      ) : null}

      <section className="grid gap-4 rounded-[12px] border border-border bg-card p-4 shadow-card lg:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar brinco</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-suave"
            />
            <Input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar brinco ou nome"
              className="h-10 rounded-[10px] border-border bg-bg-app pr-3 pl-10 shadow-none"
            />
          </label>
          <div className="grid grid-cols-4 gap-1 rounded-[10px] bg-muted p-1">
            {FILTROS.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setFiltro(opcao.valor)}
                className={cn(
                  "h-8 rounded-[8px] px-2 text-xs font-medium",
                  filtro === opcao.valor
                    ? "bg-card text-texto shadow-sm"
                    : "text-texto-suave hover:text-texto",
                )}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>
        <p className="self-center text-sm text-texto-suave lg:text-right">
          {resumo.custo_por_arroba != null
            ? `Dieta ${formatarMoeda(custoNumero ?? 0)} → ${formatCustoArroba(resumo.custo_por_arroba)}`
            : "Informe o custo da dieta para ver o R$/@"}
        </p>
      </section>

      <div className="hidden overflow-hidden rounded-[12px] border border-border bg-card shadow-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/70 text-left text-texto-suave">
            <tr>
              <th className="py-3 pl-4 font-medium">Animal</th>
              <th className="font-medium">Peso anterior</th>
              <th className="font-medium">Peso agora</th>
              <th className="font-medium" title={TEXTO_TOOLTIP_ARROBA}>
                @ est.
              </th>
              <th className="font-medium">Ganho</th>
              <th className="font-medium">GMD</th>
              <th className="pr-4 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((animal, indice) => (
              <PesagemAnimalLinha
                key={animal.id}
                animal={animal}
                peso={pesos[animal.id] ?? ""}
                dataSessao={cabecalho.data}
                condicaoAtual={condicaoAtual}
                somenteLeitura={somenteLeitura}
                indice={indice}
                variante="tabela"
                onChange={(valor) =>
                  setPesos((atual) => ({ ...atual, [animal.id]: valor }))
                }
                onEnter={focarProximo}
              />
            ))}
          </tbody>
        </table>
        {visiveis.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-texto-suave">
            Nenhum animal neste filtro.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {visiveis.map((animal, indice) => (
          <PesagemAnimalLinha
            key={animal.id}
            animal={animal}
            peso={pesos[animal.id] ?? ""}
            dataSessao={cabecalho.data}
            condicaoAtual={condicaoAtual}
            somenteLeitura={somenteLeitura}
            indice={indice}
            variante="cartao"
            onChange={(valor) =>
              setPesos((atual) => ({ ...atual, [animal.id]: valor }))
            }
            onEnter={focarProximo}
          />
        ))}
      </div>

      <section className="grid gap-4 rounded-[12px] border border-border bg-card p-4 shadow-card md:grid-cols-2">
        <div className="space-y-2">
          <CampoMoeda
            id="custo_alimentacao"
            rotulo="Custo do período"
            valor={custo}
            desabilitado={somenteLeitura}
            onChange={setCusto}
          />
          <CustosPeriodoDialog
            pesagemId={cabecalho.id}
            desabilitado={somenteLeitura}
            onAplicado={(total) => setCusto(formatarMoedaValor(total))}
          />
          <p className="text-xs text-texto-suave">
            A @ produzida usa este valor. Você ainda pode ajustar o número depois.
          </p>
        </div>
        <div>
          <Label htmlFor="condicao_pesagem" className="mb-1.5 text-sm text-texto">
            Condição da pesagem
          </Label>
          <select
            id="condicao_pesagem"
            className={CLASSE_CAMPO}
            disabled={somenteLeitura}
            value={condicao}
            onChange={(evento) =>
              setCondicao(evento.target.value as CondicaoPesagem | "")
            }
          >
            {OPCOES_CONDICAO_PESAGEM.map((opcao) => (
              <option key={opcao.valor || "vazio"} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-texto-suave">{TEXTO_DICA_JEJUM}</p>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="observacoes" className="mb-1.5 text-sm text-texto">
            Observações da sessão
          </Label>
          <Textarea
            id="observacoes"
            rows={3}
            value={observacoes}
            disabled={somenteLeitura}
            onChange={(evento) => setObservacoes(evento.target.value)}
            className="min-h-[88px] rounded-[10px] border-border"
            placeholder="Condição do curral, mudança de dieta..."
          />
        </div>
      </section>

      {lucratividade ? (
        <LucratividadeProjecaoPainel
          base={lucratividade}
          className="mb-20 md:mb-0"
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden">
        {somenteLeitura ? (
          <Button
            type="button"
            className="h-11 w-full rounded-[10px]"
            onClick={reabrir}
            disabled={pendente}
          >
            <RotateCcw />
            Reabrir para editar
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[10px]"
              onClick={() => salvar(false)}
              disabled={pendente}
            >
              {pendente ? <Loader2 className="animate-spin" /> : <Save />}
              Salvar
            </Button>
            <Button
              type="button"
              className="h-11 rounded-[10px]"
              onClick={() => setConfirmar(true)}
              disabled={
                pendente || resumo.pesados + resumo.pesados_fora_do_lote === 0
              }
            >
              <Check />
              Concluir
            </Button>
          </div>
        )}
      </div>

      <Dialog open={confirmar} onOpenChange={setConfirmar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir pesagem?</DialogTitle>
            <DialogDescription>
              {resumo.pesados < resumo.qtd_animais_lote
                ? `Cobertura ${formatCobertura(resumo.pesados, resumo.qtd_animais_lote, resumo.cobertura_percentual)}. Os que faltam ficam sem peso nesta sessão. O peso atual do animal só atualiza ao concluir.`
                : "O peso atual de cada animal será atualizado com esta sessão."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmar(false)} disabled={pendente}>
              Continuar pesando
            </Button>
            <Button onClick={() => salvar(true)} disabled={pendente}>
              {pendente ? "Concluindo..." : "Concluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
