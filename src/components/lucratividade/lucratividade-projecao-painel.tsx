"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  TrendingUp,
  Wallet,
  Weight,
} from "lucide-react";

import {
  CampoMoeda,
  formatarMoedaDigitacao,
} from "@/components/animais/campo-moeda";
import { SegmentedControl, CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { CardResumo } from "@/components/layout/card-resumo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarDecimal, formatarInteiro } from "@/lib/formatacao";
import {
  OPCOES_TIPO_VENDA,
  RENDIMENTO_CARCACA_PCT_PADRAO,
  calcularLucroRealizado,
  calcularMetricasRealizadas,
  calcularProjecao,
  formatArrobasTotais,
  formatDiasGiro,
  formatMargemPct,
  formatMoedaOuTraco,
  formatPesoMedioKg,
  inputsProjecaoVazios,
  type InputsProjecao,
  type LoteLucratividadeBase,
  type TipoVenda,
} from "@/lib/lucratividade";
import { formatGmd } from "@/lib/pesagens";
import { cn } from "@/lib/utils";

function parseMoeda(texto: string): number | null {
  const limpo = texto.trim();

  if (!limpo) {
    return null;
  }

  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : null;
}

function parseNumero(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");

  if (!limpo) {
    return null;
  }

  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

export function LucratividadeProjecaoPainel({
  base,
  className,
}: {
  base: LoteLucratividadeBase;
  className?: string;
}) {
  const [diasPlanejados, setDiasPlanejados] = useState(
    String(inputsProjecaoVazios().dias_giro_planejados ?? 90),
  );
  const [tipoVenda, setTipoVenda] = useState<TipoVenda>("peso_vivo");
  const [precoArroba, setPrecoArroba] = useState("");
  const [rendimento, setRendimento] = useState(String(RENDIMENTO_CARCACA_PCT_PADRAO));
  const [outrosCustos, setOutrosCustos] = useState("0,00");

  const inputs: InputsProjecao = useMemo(
    () => ({
      dias_giro_planejados: parseNumero(diasPlanejados),
      tipo_venda: tipoVenda,
      preco_arroba: parseMoeda(precoArroba),
      rendimento_carcaca_pct: parseNumero(rendimento),
      outros_custos: parseMoeda(outrosCustos) ?? 0,
    }),
    [diasPlanejados, tipoVenda, precoArroba, rendimento, outrosCustos],
  );

  const metricas = useMemo(
    () => calcularMetricasRealizadas(base, inputs.outros_custos),
    [base, inputs.outros_custos],
  );

  const realizado = useMemo(
    () =>
      calcularLucroRealizado(base, {
        tipo_venda: inputs.tipo_venda,
        preco_arroba: inputs.preco_arroba,
        rendimento_carcaca_pct: inputs.rendimento_carcaca_pct,
        outros_custos: inputs.outros_custos,
      }),
    [base, inputs],
  );

  const projecao = useMemo(
    () => calcularProjecao(base, inputs),
    [base, inputs],
  );

  const lucroRealizadoPositivo =
    realizado.lucro_liquido != null && realizado.lucro_liquido >= 0;
  const lucroProjetadoPositivo =
    projecao.lucro_liquido_projetado != null &&
    projecao.lucro_liquido_projetado >= 0;

  const precoInformado = Boolean(precoArroba.trim());

  if (base.qtd_cabecas <= 0) {
    return (
      <section
        className={cn(
          "rounded-[12px] border border-border bg-card p-4 shadow-card",
          className,
        )}
      >
        <h2 className="text-base font-semibold text-texto">
          Lucratividade e projeção de venda
        </h2>
        <p className="mt-1 text-sm text-texto-suave">
          Não há animais ativos neste lote para projetar.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "space-y-4 rounded-[12px] border border-border bg-card p-4 shadow-card",
        className,
      )}
    >
      <header>
        <h2 className="text-base font-semibold text-texto">
          Lucratividade e projeção de venda
        </h2>
        <p className="mt-0.5 text-sm text-texto-suave">
          {base.lote_nome} · {formatarInteiro(base.qtd_cabecas)} cabeças · valor
          de mercado hoje e simulação de venda
        </p>
      </header>

      <div className="space-y-3">
        <h3 className="text-xs font-medium tracking-wide text-texto-suave uppercase">
          Preço de referência
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-sm text-texto">Tipo de venda</Label>
            <SegmentedControl
              valor={tipoVenda}
              opcoes={OPCOES_TIPO_VENDA}
              onChange={setTipoVenda}
              ariaLabel="Tipo de venda"
            />
          </div>

          <CampoMoeda
            id="preco_arroba"
            rotulo={
              tipoVenda === "peso_vivo"
                ? "Preço da @ viva"
                : "Preço da @ de carcaça"
            }
            valor={precoArroba}
            onChange={setPrecoArroba}
          />

          {tipoVenda === "peso_morto" ? (
            <div>
              <Label htmlFor="rendimento_carcaca" className="mb-1.5 text-sm text-texto">
                Rendimento de carcaça (%)
              </Label>
              <Input
                id="rendimento_carcaca"
                inputMode="decimal"
                className={CLASSE_CAMPO}
                value={rendimento}
                onChange={(evento) => {
                  const bruto = evento.target.value.replace(/[^\d,.]/g, "");
                  setRendimento(bruto.slice(0, 6));
                }}
                placeholder="50"
              />
            </div>
          ) : null}

          <CampoMoeda
            id="outros_custos"
            rotulo="Outros custos (opcional)"
            valor={outrosCustos}
            onChange={(valor) =>
              setOutrosCustos(valor || formatarMoedaDigitacao("0"))
            }
          />
        </div>
        <p className="text-xs text-texto-suave">
          {tipoVenda === "peso_vivo"
            ? "Peso vivo: 1 @ = 30 kg de peso vivo. O preço é o da arroba viva (boi em pé)."
            : "Abate: 1 @ = 15 kg de carcaça. Usa o rendimento informado sobre o peso vivo."}{" "}
          O mesmo preço vale para o lucro até hoje e para a projeção.
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-medium tracking-wide text-texto-suave uppercase">
          Até hoje (realizado)
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CardResumo
            rotulo="Dias de giro"
            valor={formatDiasGiro(metricas.dias_giro)}
            icone={<CalendarDays className="size-6" />}
          />
          <CardResumo
            rotulo="GMD do lote"
            valor={formatGmd(metricas.gmd)}
            icone={<TrendingUp className="size-6" />}
          />
          <CardResumo
            rotulo="Aquisição total"
            valor={formatMoedaOuTraco(metricas.custo_aquisicao_total)}
            icone={<Wallet className="size-6" />}
          />
          <CardResumo
            rotulo="Custo total acumulado"
            valor={formatMoedaOuTraco(metricas.custo_total_acumulado)}
            icone={<CircleDollarSign className="size-6" />}
          />
        </div>
        <p className="text-xs text-texto-suave">
          Suplementação:{" "}
          {formatMoedaOuTraco(metricas.custo_suplementacao_ate_hoje)}
          {metricas.custo_sanidade_ate_hoje > 0
            ? ` · Sanidade: ${formatMoedaOuTraco(metricas.custo_sanidade_ate_hoje)}`
            : null}
          {metricas.outros_custos > 0
            ? ` · Outros custos: ${formatMoedaOuTraco(metricas.outros_custos)}`
            : null}
          {" · "}
          Peso médio atual {formatPesoMedioKg(base.peso_atual_medio)}
          {" / entrada "}
          {formatPesoMedioKg(base.peso_entrada_medio)}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article
            className={cn(
              "rounded-[12px] border p-4",
              realizado.lucro_liquido == null
                ? "border-border bg-muted/40"
                : lucroRealizadoPositivo
                  ? "border-primary/30 bg-[#DDF1E6]"
                  : "border-perigo/30 bg-perigo/5",
            )}
          >
            <p className="text-xs text-texto-suave">Lucro se vendesse hoje</p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold",
                realizado.lucro_liquido == null
                  ? "text-texto-suave"
                  : lucroRealizadoPositivo
                    ? "text-primary"
                    : "text-perigo",
              )}
            >
              {formatMoedaOuTraco(realizado.lucro_liquido)}
            </p>
            {realizado.margem_pct != null ? (
              <p className="mt-1 text-xs text-texto-suave">
                Margem {formatMargemPct(realizado.margem_pct)} ·{" "}
                {formatMoedaOuTraco(realizado.lucro_por_cabeca)}/cabeça
              </p>
            ) : null}
          </article>

          <article className="rounded-[12px] border border-border bg-muted/40 p-4">
            <p className="text-xs text-texto-suave">Valor de mercado hoje</p>
            <p className="mt-1 text-2xl font-bold text-texto">
              {formatMoedaOuTraco(realizado.valor_mercado_hoje)}
            </p>
            <p className="mt-1 text-xs text-texto-suave">
              {realizado.peso_atual_total_kg != null
                ? `${formatarDecimal(realizado.peso_atual_total_kg, 0)} kg`
                : "—"}
              {realizado.arrobas_atuais != null
                ? ` · ${formatArrobasTotais(realizado.arrobas_atuais)}${
                    tipoVenda === "peso_vivo" ? " vivas" : ""
                  }`
                : null}
            </p>
          </article>
        </div>

        {!precoInformado ? (
          <p className="text-xs text-texto-suave">
            Informe o preço de referência acima para ver o lucro até hoje.
          </p>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-medium tracking-wide text-texto-suave uppercase">
          Projeção de venda
        </h3>

        <div className="max-w-sm">
          <Label htmlFor="dias_giro_planejados" className="mb-1.5 text-sm text-texto">
            Dias totais de giro planejados
          </Label>
          <Input
            id="dias_giro_planejados"
            inputMode="numeric"
            className={CLASSE_CAMPO}
            value={diasPlanejados}
            onChange={(evento) =>
              setDiasPlanejados(evento.target.value.replace(/[^\d]/g, "").slice(0, 4))
            }
            placeholder="Ex: 90"
          />
          {projecao.dias_restantes != null ? (
            <p className="mt-1 text-xs text-texto-suave">
              Restam {formatDiasGiro(projecao.dias_restantes)} até a venda
              planejada
            </p>
          ) : null}
        </div>

        {projecao.aviso ? (
          <p className="rounded-[10px] border border-border bg-muted/60 px-3 py-2 text-xs text-texto-suave">
            {projecao.aviso}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article
            className={cn(
              "rounded-[12px] border p-4",
              projecao.lucro_liquido_projetado == null
                ? "border-border bg-muted/40"
                : lucroProjetadoPositivo
                  ? "border-primary/30 bg-[#DDF1E6]"
                  : "border-perigo/30 bg-perigo/5",
            )}
          >
            <p className="text-xs text-texto-suave">Lucro líquido projetado</p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold",
                projecao.lucro_liquido_projetado == null
                  ? "text-texto-suave"
                  : lucroProjetadoPositivo
                    ? "text-primary"
                    : "text-perigo",
              )}
            >
              {formatMoedaOuTraco(projecao.lucro_liquido_projetado)}
            </p>
            {projecao.margem_pct != null ? (
              <p className="mt-1 text-xs text-texto-suave">
                Margem {formatMargemPct(projecao.margem_pct)}
              </p>
            ) : null}
          </article>

          <article className="rounded-[12px] border border-border bg-muted/40 p-4">
            <p className="text-xs text-texto-suave">Lucro por cabeça</p>
            <p className="mt-1 text-2xl font-bold text-texto">
              {formatMoedaOuTraco(projecao.lucro_por_cabeca)}
            </p>
            <p className="mt-1 text-xs text-texto-suave">
              Peso venda médio {formatPesoMedioKg(projecao.peso_venda_medio_kg)}
            </p>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <LinhaDetalhe
            rotulo="Peso total estimado"
            valor={
              projecao.peso_venda_total_kg != null
                ? `${formatarDecimal(projecao.peso_venda_total_kg, 0)} kg`
                : "—"
            }
            icone={<Weight className="size-4" />}
          />
          <LinhaDetalhe
            rotulo={
              tipoVenda === "peso_vivo" ? "@ vivas estimadas" : "@ totais estimadas"
            }
            valor={formatArrobasTotais(projecao.arrobas_totais)}
          />
          <LinhaDetalhe
            rotulo="Faturamento bruto"
            valor={formatMoedaOuTraco(projecao.faturamento_bruto)}
          />
          <LinhaDetalhe
            rotulo="Suplemento projetado"
            valor={formatMoedaOuTraco(projecao.custo_suplemento_projetado)}
          />
          <LinhaDetalhe
            rotulo="Custo total projetado"
            valor={formatMoedaOuTraco(projecao.custo_total_projetado)}
          />
        </div>
      </div>
    </section>
  );
}

function LinhaDetalhe({
  rotulo,
  valor,
  icone,
}: {
  rotulo: string;
  valor: string;
  icone?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-border/80 bg-card px-3 py-2">
      {icone ? <span className="text-texto-suave">{icone}</span> : null}
      <div className="min-w-0">
        <p className="text-[11px] text-texto-suave">{rotulo}</p>
        <p className="truncate font-medium text-texto">{valor}</p>
      </div>
    </div>
  );
}
