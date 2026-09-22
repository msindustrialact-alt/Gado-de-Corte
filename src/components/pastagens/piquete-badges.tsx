import { Badge } from "@/components/ui/badge";
import {
  LABELS_STATUS_PIQUETE,
  type StatusPiquete,
} from "@/lib/pastagens";
import { formatarDecimal, formatarInteiro } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

const CORES_STATUS: Record<StatusPiquete, string> = {
  ativo: "border-transparent bg-positivo/15 text-positivo",
  em_descanso: "border-transparent bg-info/15 text-info",
  em_reforma: "border-transparent bg-alerta/15 text-alerta",
  inativo: "border-transparent bg-muted text-texto-suave",
};

export function StatusPiqueteBadge({ status }: { status: StatusPiquete }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", CORES_STATUS[status])}
    >
      {LABELS_STATUS_PIQUETE[status]}
    </Badge>
  );
}

export function BarraOcupacao({
  uaAtual,
  capacidade,
}: {
  uaAtual: number;
  capacidade: number | null;
}) {
  if (capacidade == null || capacidade <= 0) {
    return <span className="text-texto-suave">—</span>;
  }

  const perc = (uaAtual / capacidade) * 100;
  const cor =
    perc > 100 ? "bg-perigo" : perc >= 80 ? "bg-alerta" : "bg-positivo";

  return (
    <div className="flex min-w-28 items-center gap-2">
      <div className="h-2 min-w-16 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", cor)}
          style={{ width: `${Math.min(perc, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-texto-suave">
        {formatarInteiro(Math.round(perc))}%
      </span>
    </div>
  );
}

export function formatarHa(valor: number | null): string {
  if (valor == null) {
    return "—";
  }

  return `${formatarDecimal(valor, 2)} ha`;
}

export function formatarUa(valor: number | null): string {
  if (valor == null) {
    return "—";
  }

  return formatarDecimal(valor, 2);
}
