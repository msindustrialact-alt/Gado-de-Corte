import { Mars, Venus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LABELS_SEXO, LABELS_STATUS, type SexoAnimal, type StatusAnimal } from "@/lib/animais";
import { cn } from "@/lib/utils";

const CORES_STATUS: Record<StatusAnimal, string> = {
  ativo: "border-transparent bg-positivo/15 text-positivo",
  vendido: "border-transparent bg-info/15 text-info",
  abatido: "border-transparent bg-alerta/15 text-alerta",
  morto: "border-transparent bg-perigo/15 text-perigo",
  transferido: "border-transparent bg-muted text-texto-suave",
};

export function StatusBadge({ status }: { status: StatusAnimal }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", CORES_STATUS[status])}
    >
      {LABELS_STATUS[status]}
    </Badge>
  );
}

export function SexoBadge({ sexo }: { sexo: SexoAnimal }) {
  const Icone = sexo === "macho" ? Mars : Venus;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-texto">
      <Icone className="size-3.5" aria-hidden />
      {LABELS_SEXO[sexo]}
    </span>
  );
}
