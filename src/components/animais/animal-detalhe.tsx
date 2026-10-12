import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  Pencil,
  Scale,
  Weight,
} from "lucide-react";

import { FotoAnimal } from "@/components/animais/foto-animal";
import { SexoBadge, StatusBadge } from "@/components/animais/status-badge";
import { StatusVacinaBadge } from "@/components/vacinas/vacina-badges";
import { AnimalDesempenho } from "@/components/pesagens/animal-desempenho";
import { buttonVariants } from "@/components/ui/button";
import {
  formatIdade,
  formatPeso,
  LABELS_CATEGORIA,
  LABELS_CHIFRE,
  LABELS_FASE,
  LABELS_MOTIVO_SAIDA,
  LABELS_ORIGEM,
  LABELS_PROPRIEDADE,
  LABELS_SEXO,
  textoOuTraco,
  type AnimalDetalhe,
  type ParenteAnimal,
} from "@/lib/animais";
import {
  formatArroba,
  formatGmd,
  type DesempenhoAnimal,
} from "@/lib/pesagens";
import type { AvaliacaoVacinaAnimal } from "@/lib/vacinas";
import { formatarData, formatarMoeda } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

export function AnimalDetalhe({
  animal,
  desempenho,
  avaliacaoVacinas,
  historicoVacinas,
}: {
  animal: AnimalDetalhe;
  desempenho: DesempenhoAnimal;
  avaliacaoVacinas: AvaliacaoVacinaAnimal;
  historicoVacinas: Array<{
    id: string;
    data: string;
    vacina_id: string;
    vacina_nome: string;
  }>;
}) {
  const idade = formatIdade(
    animal.data_nascimento,
    animal.nascimento_estimado,
  );
  const categoria = animal.categoria
    ? LABELS_CATEGORIA[animal.categoria]
    : null;
  const raca = animal.raca?.nome ?? null;
  const fase = animal.fase_produtiva
    ? LABELS_FASE[animal.fase_produtiva]
    : null;

  return (
    <div className="space-y-4 p-4 pb-6 md:p-6">
      {/* Hero estilo brinco / ficha de campo */}
      <section className="relative overflow-hidden rounded-[20px] border border-[#C9E0D2] bg-[#0F3D24] text-white shadow-[0_16px_40px_rgba(15,61,36,0.22)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, #2fe39a55, transparent 55%), radial-gradient(ellipse 70% 50% at 0% 100%, #16a97044, transparent 50%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-18deg, #fff 0 1px, transparent 1px 14px)",
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/animais"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-white/16"
            >
              <ArrowLeft className="size-4" />
              Animais
            </Link>
            <div className="flex gap-2">
              {animal.lote ? (
                <Link
                  href={`/pesagens/nova?lote=${animal.lote.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#2fe39a] px-3 text-sm font-semibold text-[#0F3D24] transition-opacity hover:opacity-90"
                >
                  <Weight className="size-4" />
                  Pesar
                </Link>
              ) : null}
              <Link
                href={`/animais/${animal.id}/editar`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-full border-white/25 bg-white/10 px-3 text-white hover:bg-white/16 hover:text-white",
                )}
              >
                <Pencil className="size-4" />
                Editar
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="rounded-full bg-gradient-to-b from-white/35 to-white/5 p-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                <FotoAnimal
                  url={animal.foto_url}
                  tamanho={88}
                  className="ring-2 ring-[#0F3D24]"
                />
              </div>
              <span className="absolute -right-1 -bottom-1 scale-90">
                <StatusBadge status={animal.status} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium tracking-[0.14em] text-[#A8D4B8] uppercase">
                Brinco
              </p>
              <h1 className="mt-0.5 truncate font-mono text-[2.15rem] leading-none font-bold tracking-tight text-white sm:text-[2.6rem]">
                {animal.brinco}
              </h1>
              <p className="mt-1.5 truncate text-sm text-white/75">
                {animal.nome ?? "Sem nome"}
                <span className="mx-1.5 text-white/35">·</span>
                {LABELS_PROPRIEDADE[animal.propriedade]}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <SexoBadge sexo={animal.sexo} />
                {categoria ? <Chip claro>{categoria}</Chip> : null}
                {raca ? <Chip claro>{raca}</Chip> : null}
                {fase ? <Chip claro>{fase}</Chip> : null}
              </div>
            </div>
          </div>

          {/* Vitais em faixa */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Vital
              icone={<Scale className="size-3.5" />}
              rotulo="Peso atual"
              valor={
                animal.peso_atual != null
                  ? formatPeso(animal.peso_atual)
                  : "—"
              }
              detalhe={
                animal.peso_atual != null
                  ? formatArroba(animal.peso_atual)
                  : undefined
              }
            />
            <Vital
              icone={<CalendarDays className="size-3.5" />}
              rotulo="Idade"
              valor={idade}
            />
            <Vital
              icone={<Weight className="size-3.5" />}
              rotulo="GMD acum."
              valor={formatGmd(desempenho.gmd_acumulado)}
            />
            <Vital
              icone={<MapPin className="size-3.5" />}
              rotulo="Lote"
              valor={animal.lote?.nome ?? "—"}
            />
          </div>
        </div>
      </section>

      {/* Trilha de localização */}
      <nav
        aria-label="Localização"
        className="flex flex-wrap items-center gap-1 rounded-[14px] border border-border bg-card px-3 py-2.5 text-sm shadow-card"
      >
        <span className="font-medium text-texto">
          {LABELS_PROPRIEDADE[animal.propriedade]}
        </span>
        <ChevronRight className="size-3.5 text-texto-suave" aria-hidden />
        {animal.lote ? (
          <Link
            href={`/lotes/${animal.lote.id}`}
            className="font-medium text-primary hover:underline"
          >
            {animal.lote.nome}
          </Link>
        ) : (
          <span className="text-texto-suave">Sem lote</span>
        )}
        <ChevronRight className="size-3.5 text-texto-suave" aria-hidden />
        {animal.piquete ? (
          <Link
            href={`/pastagens?piquete=${animal.piquete.id}`}
            className="text-texto hover:text-primary hover:underline"
          >
            {animal.piquete.nome}
          </Link>
        ) : (
          <span className="text-texto-suave">Sem piquete</span>
        )}
      </nav>

      <div className="grid gap-4 lg:grid-cols-2">
        <Secao titulo="Identificação">
          <Campo rotulo="Brinco eletrônico" valor={textoOuTraco(animal.brinco_eletronico)} />
          <Campo rotulo="SISBOV" valor={textoOuTraco(animal.sisbov)} />
          <Campo rotulo="Sexo" valor={LABELS_SEXO[animal.sexo]} />
          <Campo
            rotulo="Categoria"
            valor={categoria ?? "—"}
          />
        </Secao>

        <Secao titulo="Características">
          <Campo rotulo="Raça" valor={textoOuTraco(raca)} />
          <Campo
            rotulo="Composição racial"
            valor={textoOuTraco(animal.composicao_racial)}
          />
          <Campo rotulo="Pelagem" valor={textoOuTraco(animal.pelagem)} />
          <Campo
            rotulo="Tipo de chifre"
            valor={animal.tipo_chifre ? LABELS_CHIFRE[animal.tipo_chifre] : "—"}
          />
          <Campo
            rotulo="Nascimento"
            valor={formatarData(animal.data_nascimento)}
          />
          <Campo rotulo="Idade" valor={idade} />
        </Secao>

        <Secao titulo="Origem">
          <Campo rotulo="Origem" valor={LABELS_ORIGEM[animal.origem]} />
          <Campo rotulo="Fornecedor" valor={textoOuTraco(animal.fornecedor)} />
          <Campo rotulo="Entrada" valor={formatarData(animal.data_entrada)} />
          <Campo rotulo="Peso entrada" valor={formatPeso(animal.peso_entrada)} />
          <Campo
            rotulo="Valor aquisição"
            valor={
              animal.valor_aquisicao != null
                ? formatarMoeda(Number(animal.valor_aquisicao))
                : "—"
            }
          />
          <Campo
            rotulo="Última pesagem"
            valor={formatarData(animal.data_ultima_pesagem)}
          />
          <Campo
            rotulo="Escore corporal"
            valor={textoOuTraco(animal.escore_corporal)}
          />
        </Secao>

        <Secao titulo="Genealogia">
          <div className="col-span-full grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ParenteCard rotulo="Pai" parente={animal.pai} />
            <ParenteCard rotulo="Mãe" parente={animal.mae} />
          </div>
        </Secao>
      </div>

      <AnimalDesempenho
        desempenho={desempenho}
        loteId={animal.lote?.id ?? null}
      />

      <section className="rounded-[16px] border border-border bg-card p-4 shadow-card md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-texto">
            Vacinas
          </h2>
          <StatusVacinaBadge status={avaliacaoVacinas.status} />
        </div>

        {avaliacaoVacinas.faltantes.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-texto-suave">
              O que falta
            </p>
            <ul className="space-y-1.5">
              {avaliacaoVacinas.faltantes.map((item) => (
                <li
                  key={`${item.vacina_id}-${item.motivo}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                >
                  <span className="font-medium text-texto">
                    {item.vacina_nome}
                  </span>
                  <span className="text-texto-suave">
                    {item.motivo === "nunca"
                      ? "Nunca aplicada"
                      : "Intervalo vencido"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : avaliacaoVacinas.status === "em_dia" ? (
          <p className="mb-4 text-sm text-texto-suave">
            Vacinações registradas em dia (realizado).
          </p>
        ) : avaliacaoVacinas.status === "incompleto" ? (
          <p className="mb-4 text-sm text-texto-suave">
            Nenhuma vacinação registrada para este animal.
          </p>
        ) : avaliacaoVacinas.status === "sem_protocolo" ? (
          <p className="mb-4 text-sm text-texto-suave">
            Nenhum protocolo ativo. Cadastre em Sanidade → Vacinas.
          </p>
        ) : null}

        {historicoVacinas.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-texto-suave">
              Histórico
            </p>
            <ul className="divide-y divide-border rounded-[12px] border border-border">
              {historicoVacinas.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-texto">
                    {item.vacina_nome}
                  </span>
                  <span className="shrink-0 text-texto-suave">
                    {formatarData(item.data)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-4 text-sm text-texto-suave">
            Nenhuma aplicação registrada.
          </p>
        )}

        {animal.lote?.id ? (
          <Link
            href={`/sanidade/vacinas/aplicar?lote=${animal.lote.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-[10px]",
            )}
          >
            Aplicar no lote
          </Link>
        ) : (
          <Link
            href="/sanidade/vacinas"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-[10px]",
            )}
          >
            Ver vacinas
          </Link>
        )}
      </section>

      {animal.status !== "ativo" ? (
        <Secao titulo="Saída">
          <Campo rotulo="Status" valor={<StatusBadge status={animal.status} />} />
          <Campo
            rotulo="Motivo"
            valor={
              animal.motivo_saida
                ? LABELS_MOTIVO_SAIDA[animal.motivo_saida]
                : "—"
            }
          />
          <Campo rotulo="Data" valor={formatarData(animal.data_saida)} />
          <Campo rotulo="Destino" valor={textoOuTraco(animal.destino)} />
          <Campo rotulo="Peso saída" valor={formatPeso(animal.peso_saida)} />
          <Campo
            rotulo="Valor venda"
            valor={
              animal.valor_venda != null
                ? formatarMoeda(Number(animal.valor_venda))
                : "—"
            }
          />
        </Secao>
      ) : null}

      {animal.observacoes ? (
        <section className="rounded-[16px] border border-border bg-card p-4 shadow-card md:p-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-texto">
            Observações
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-texto-suave">
            {animal.observacoes}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function Chip({
  children,
  claro = false,
}: {
  children: ReactNode;
  claro?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        claro
          ? "bg-white/14 text-white ring-1 ring-white/20"
          : "bg-muted text-texto",
      )}
    >
      {children}
    </span>
  );
}

function Vital({
  icone,
  rotulo,
  valor,
  detalhe,
}: {
  icone: ReactNode;
  rotulo: string;
  valor: string;
  detalhe?: string;
}) {
  return (
    <div className="rounded-[14px] bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
      <p className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-[#A8D4B8]">
        {icone}
        {rotulo}
      </p>
      <p className="mt-1 truncate text-[15px] leading-tight font-semibold text-white">
        {valor}
      </p>
      {detalhe ? (
        <p className="mt-0.5 truncate text-[10px] text-white/55">{detalhe}</p>
      ) : null}
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[16px] border border-border bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/80 bg-[#F4F8F5] px-4 py-2.5">
        <span className="h-4 w-1 rounded-full bg-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-texto">{titulo}</h2>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border/60 p-px">
        {children}
      </div>
    </section>
  );
}

function Campo({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: ReactNode;
}) {
  return (
    <div className="min-w-0 bg-card px-3.5 py-3">
      <p className="text-[10px] font-medium tracking-wide text-texto-suave uppercase">
        {rotulo}
      </p>
      <div className="mt-0.5 text-sm font-medium text-texto">{valor}</div>
    </div>
  );
}

function ParenteCard({
  rotulo,
  parente,
}: {
  rotulo: string;
  parente: ParenteAnimal | null;
}) {
  const conteudo = parente ? (
    parente.deleted_at ? (
      <span className="text-sm font-medium text-texto">
        {parente.nome ? `${parente.brinco} · ${parente.nome}` : parente.brinco}
      </span>
    ) : (
      <Link
        href={`/animais/${parente.id}`}
        className="text-sm font-semibold text-primary hover:underline"
      >
        {parente.nome ? `${parente.brinco} · ${parente.nome}` : parente.brinco}
      </Link>
    )
  ) : (
    <span className="text-sm text-texto-suave">Não informado</span>
  );

  return (
    <div className="rounded-[12px] border border-dashed border-border bg-[#F8FBF9] px-3 py-3">
      <p className="text-[10px] font-medium tracking-wide text-texto-suave uppercase">
        {rotulo}
      </p>
      <div className="mt-1">{conteudo}</div>
    </div>
  );
}
