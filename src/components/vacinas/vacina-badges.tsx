import { Badge } from "@/components/ui/badge";
import {
  LABELS_STATUS_VACINA,
  type StatusVacinaAnimal,
} from "@/lib/vacinas";
import { cn } from "@/lib/utils";

const CORES: Record<StatusVacinaAnimal, string> = {
  em_dia: "border-transparent bg-positivo/15 text-positivo",
  incompleto: "border-transparent bg-alerta/15 text-alerta",
  atrasado: "border-transparent bg-perigo/15 text-perigo",
  sem_protocolo: "border-transparent bg-muted text-texto-suave",
  indefinido: "border-transparent bg-info/15 text-info",
};

export function StatusVacinaBadge({ status }: { status: StatusVacinaAnimal }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", CORES[status])}
    >
      {LABELS_STATUS_VACINA[status]}
    </Badge>
  );
}
