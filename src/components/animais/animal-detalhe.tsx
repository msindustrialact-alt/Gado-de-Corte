import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { FotoAnimal } from "@/components/animais/foto-animal";
import { StatusBadge } from "@/components/animais/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatIdade,
  formatPeso,
  LABELS_CATEGORIA,
  LABELS_CHIFRE,
  LABELS_FASE,
  LABELS_MOTIVO_SAIDA,
  LABELS_ORIGEM,
  LABELS_SEXO,
  textoOuTraco,
  type AnimalDetalhe,
  type ParenteAnimal,
} from "@/lib/animais";
import { formatarData, formatarMoeda } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

export function AnimalDetalhe({ animal }: { animal: AnimalDetalhe }) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="flex flex-col gap-4 rounded-[12px] border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <FotoAnimal url={animal.foto_url} tamanho={64} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-texto">{animal.brinco}</h1>
              <StatusBadge status={animal.status} />
            </div>
            <p className="mt-0.5 text-sm text-texto-suave">
              {animal.nome ?? "Sem nome"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/animais/${animal.id}/editar`}
            className={cn(
              buttonVariants(),
              "h-10 rounded-[10px] px-4",
            )}
          >
            <Pencil />
            Editar
          </Link>
          <Link
            href="/animais"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-[10px] px-4",
            )}
          >
            <ArrowLeft />
            Voltar
          </Link>
        </div>
      </header>

      <Secao titulo="Identificação">
        <Campo rotulo="Brinco" valor={animal.brinco} />
        <Campo rotulo="Nome" valor={textoOuTraco(animal.nome)} />
        <Campo
          rotulo="Brinco eletrônico"
          valor={textoOuTraco(animal.brinco_eletronico)}
        />
        <Campo rotulo="SISBOV" valor={textoOuTraco(animal.sisbov)} />
      </Secao>

      <Secao titulo="Características">
        <Campo rotulo="Sexo" valor={LABELS_SEXO[animal.sexo]} />
        <Campo
          rotulo="Categoria"
          valor={
            animal.categoria ? LABELS_CATEGORIA[animal.categoria] : "—"
          }
        />
        <Campo rotulo="Raça" valor={textoOuTraco(animal.raca?.nome)} />
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
          rotulo="Data de nascimento"
          valor={formatarData(animal.data_nascimento)}
        />
        <Campo
          rotulo="Idade"
          valor={formatIdade(
            animal.data_nascimento,
            animal.nascimento_estimado,
          )}
        />
      </Secao>

      <Secao titulo="Origem e genealogia">
        <Campo rotulo="Origem" valor={LABELS_ORIGEM[animal.origem]} />
        <Campo rotulo="Fornecedor" valor={textoOuTraco(animal.fornecedor)} />
        <Campo
          rotulo="Data de entrada"
          valor={formatarData(animal.data_entrada)}
        />
        <Campo rotulo="Peso de entrada" valor={formatPeso(animal.peso_entrada)} />
        <Campo
          rotulo="Valor de aquisição"
          valor={
            animal.valor_aquisicao != null
              ? formatarMoeda(Number(animal.valor_aquisicao))
              : "—"
          }
        />
        <Campo rotulo="Pai" valor={<LinkParente parente={animal.pai} />} />
        <Campo rotulo="Mãe" valor={<LinkParente parente={animal.mae} />} />
      </Secao>

      <Secao titulo="Situação atual">
        <Campo rotulo="Lote" valor={textoOuTraco(animal.lote?.nome)} />
        <Campo rotulo="Piquete" valor={textoOuTraco(animal.piquete?.nome)} />
        <Campo
          rotulo="Fase produtiva"
          valor={
            animal.fase_produtiva ? LABELS_FASE[animal.fase_produtiva] : "—"
          }
        />
        <Campo rotulo="Peso atual" valor={formatPeso(animal.peso_atual)} />
        <Campo
          rotulo="Última pesagem"
          valor={formatarData(animal.data_ultima_pesagem)}
        />
        <Campo
          rotulo="Escore corporal"
          valor={textoOuTraco(animal.escore_corporal)}
        />
      </Secao>

      {animal.status !== "ativo" ? (
        <Secao titulo="Saída">
          <Campo rotulo="Status" valor={<StatusBadge status={animal.status} />} />
          <Campo
            rotulo="Motivo da saída"
            valor={
              animal.motivo_saida
                ? LABELS_MOTIVO_SAIDA[animal.motivo_saida]
                : "—"
            }
          />
          <Campo rotulo="Data de saída" valor={formatarData(animal.data_saida)} />
          <Campo rotulo="Destino" valor={textoOuTraco(animal.destino)} />
          <Campo rotulo="Peso de saída" valor={formatPeso(animal.peso_saida)} />
          <Campo
            rotulo="Valor de venda"
            valor={
              animal.valor_venda != null
                ? formatarMoeda(Number(animal.valor_venda))
                : "—"
            }
          />
        </Secao>
      ) : null}

      <Secao titulo="Observações">
        <p className="col-span-full text-sm whitespace-pre-wrap text-texto">
          {textoOuTraco(animal.observacoes)}
        </p>
      </Secao>
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
    <section className="rounded-[12px] border border-border bg-card p-4 shadow-card md:p-5">
      <h2 className="mb-4 text-[17px] font-semibold text-texto">{titulo}</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </dl>
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
    <div className="min-w-0">
      <dt className="text-xs font-medium text-texto-suave">{rotulo}</dt>
      <dd className="mt-0.5 text-sm text-texto">{valor}</dd>
    </div>
  );
}

function LinkParente({ parente }: { parente: ParenteAnimal | null }) {
  if (!parente) {
    return "—";
  }

  const rotulo = parente.nome
    ? `${parente.brinco} · ${parente.nome}`
    : parente.brinco;

  if (parente.deleted_at) {
    return rotulo;
  }

  return (
    <Link
      href={`/animais/${parente.id}`}
      className="font-medium text-primary-action hover:underline"
    >
      {rotulo}
    </Link>
  );
}
