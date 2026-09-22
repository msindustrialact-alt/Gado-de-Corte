import { Badge } from "@/components/ui/badge";
import {
  LABELS_CONFIABILIDADE,
  LABELS_STATUS_PESAGEM,
  rotuloAlerta,
  type AlertaGmd,
  type ConfiabilidadeGmd,
  type StatusPesagem,
} from "@/lib/pesagens";
import { cn } from "@/lib/utils";

const CORES_STATUS: Record<StatusPesagem, string> = {
  rascunho: "border-transparent bg-alerta/15 text-alerta",
  concluida: "border-transparent bg-positivo/15 text-positivo",
};

const CORES_ALERTA: Record<AlertaGmd, string> = {
  perda: "border-transparent bg-perigo/15 text-perigo",
  gmd_alto: "border-transparent bg-alerta/15 text-alerta",
  sem_anterior: "border-transparent bg-muted text-texto-suave",
};

const CORES_CONFIABILIDADE: Record<ConfiabilidadeGmd, string> = {
  alta: "border-transparent bg-positivo/15 text-positivo",
  media: "border-transparent bg-alerta/15 text-alerta",
  baixa: "border-transparent bg-marca-laranja/15 text-marca-laranja",
  sem_referencia: "border-transparent bg-muted text-texto-suave",
};

export function StatusPesagemBadge({ status }: { status: StatusPesagem }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", CORES_STATUS[status])}
    >
      {LABELS_STATUS_PESAGEM[status]}
    </Badge>
  );
}

export function AlertaGmdBadge({ alerta }: { alerta: AlertaGmd | null }) {
  if (!alerta) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2 font-medium", CORES_ALERTA[alerta])}
    >
      {rotuloAlerta(alerta)}
    </Badge>
  );
}

export function ConfiabilidadeBadge({
  nivel,
}: {
  nivel: ConfiabilidadeGmd | null;
}) {
  if (!nivel) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2 font-medium",
        CORES_CONFIABILIDADE[nivel],
      )}
      title={`Confiabilidade do GMD: ${LABELS_CONFIABILIDADE[nivel]}`}
    >
      {LABELS_CONFIABILIDADE[nivel]}
    </Badge>
  );
}
