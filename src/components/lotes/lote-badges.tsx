import { Badge } from "@/components/ui/badge";
import {
  LABELS_OBJETIVO,
  LABELS_STATUS_LOTE,
  type ObjetivoLote,
  type StatusLote,
} from "@/lib/lotes";
import { cn } from "@/lib/utils";

const CORES_OBJETIVO: Record<ObjetivoLote, string> = {
  cria: "border-transparent bg-positivo/15 text-positivo",
  recria: "border-transparent bg-info/15 text-info",
  engorda: "border-transparent bg-alerta/15 text-alerta",
  reproducao: "border-transparent bg-primary/15 text-primary",
  quarentena: "border-transparent bg-marca-laranja/15 text-marca-laranja",
  venda: "border-transparent bg-muted text-texto-suave",
};

const CORES_STATUS: Record<StatusLote, string> = {
  ativo: "border-transparent bg-positivo/15 text-positivo",
  encerrado: "border-transparent bg-muted text-texto-suave",
};

export function ObjetivoBadge({ objetivo }: { objetivo: ObjetivoLote | null }) {
  if (!objetivo) {
    return <span className="text-texto-suave">—</span>;
  }

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", CORES_OBJETIVO[objetivo])}
    >
      {LABELS_OBJETIVO[objetivo]}
    </Badge>
  );
}

export function StatusLoteBadge({ status }: { status: StatusLote }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", CORES_STATUS[status])}
    >
      {LABELS_STATUS_LOTE[status]}
    </Badge>
  );
}
