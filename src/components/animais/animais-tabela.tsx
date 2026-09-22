"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { AnimalAcoes } from "@/components/animais/animal-acoes";
import { FotoAnimal } from "@/components/animais/foto-animal";
import { SexoBadge, StatusBadge } from "@/components/animais/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatIdade,
  formatPeso,
  LABELS_CATEGORIA,
  LABELS_PROPRIEDADE,
  urlAnimais,
  type AnimalListagem,
  type FiltrosAnimais,
  type OrdemAnimais,
} from "@/lib/animais";
import { cn } from "@/lib/utils";

export function AnimaisTabela({
  animais,
  filtros,
  caminho = "/animais",
}: {
  animais: AnimalListagem[];
  filtros: FiltrosAnimais;
  caminho?: string;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[12px] border border-border bg-card shadow-card">
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 pl-4">Foto</TableHead>
            <TableHead>
              <CabecalhoOrdenavel
                rotulo="Brinco"
                coluna="brinco"
                filtros={filtros}
                caminho={caminho}
              />
            </TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Raça</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>
              <CabecalhoOrdenavel
                rotulo="Idade"
                coluna="idade"
                filtros={filtros}
                caminho={caminho}
              />
            </TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Piquete</TableHead>
            <TableHead>Fazenda</TableHead>
            <TableHead>
              <CabecalhoOrdenavel
                rotulo="Peso atual"
                coluna="peso"
                filtros={filtros}
                caminho={caminho}
              />
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 pr-3">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animais.map((animal) => (
            <TableRow
              key={animal.id}
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/60"
              onClick={() => router.push(`/animais/${animal.id}`)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                  evento.preventDefault();
                  router.push(`/animais/${animal.id}`);
                }
              }}
            >
              <TableCell className="pl-4">
                <FotoAnimal url={animal.foto_url} />
              </TableCell>
              <TableCell>
                <span className="block font-semibold text-texto">
                  {animal.brinco}
                </span>
                {animal.nome ? (
                  <span className="block text-xs text-texto-suave">
                    {animal.nome}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <SexoBadge sexo={animal.sexo} />
              </TableCell>
              <TableCell className="text-texto">
                {animal.raca?.nome ?? "—"}
              </TableCell>
              <TableCell className="text-texto">
                {animal.categoria
                  ? LABELS_CATEGORIA[animal.categoria]
                  : "—"}
              </TableCell>
              <TableCell className="text-texto">
                {formatIdade(
                  animal.data_nascimento,
                  animal.nascimento_estimado,
                )}
              </TableCell>
              <TableCell className="text-texto">
                {animal.lote ? (
                  <Link
                    href={`/lotes/${animal.lote.id}`}
                    className="font-medium text-primary hover:underline"
                    onClick={(evento) => evento.stopPropagation()}
                  >
                    {animal.lote.nome}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-texto">
                {animal.piquete ? (
                  <Link
                    href={`/pastagens?piquete=${animal.piquete.id}`}
                    className="font-medium text-primary hover:underline"
                    onClick={(evento) => evento.stopPropagation()}
                  >
                    {animal.piquete.nome}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-texto">
                {LABELS_PROPRIEDADE[animal.propriedade]}
              </TableCell>
              <TableCell className="tabular-nums text-texto">
                {formatPeso(animal.peso_atual)}
              </TableCell>
              <TableCell>
                <StatusBadge status={animal.status} />
              </TableCell>
              <TableCell className="pr-3">
                <AnimalAcoes id={animal.id} brinco={animal.brinco} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CabecalhoOrdenavel({
  rotulo,
  coluna,
  filtros,
  caminho,
}: {
  rotulo: string;
  coluna: OrdemAnimais;
  filtros: FiltrosAnimais;
  caminho: string;
}) {
  const ativo = filtros.ordem === coluna;
  const proxima: FiltrosAnimais["direcao"] =
    ativo && filtros.direcao === "asc" ? "desc" : "asc";
  const href = urlAnimais(filtros, { ordem: coluna, direcao: proxima }, caminho);
  const Icone = !ativo
    ? ArrowUpDown
    : filtros.direcao === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 hover:text-texto",
        ativo ? "text-texto" : "text-texto-suave",
      )}
      onClick={(evento) => evento.stopPropagation()}
    >
      {rotulo}
      <Icone className="size-3.5" aria-hidden />
    </Link>
  );
}
