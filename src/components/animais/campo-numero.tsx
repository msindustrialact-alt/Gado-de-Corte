import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CampoNumero({
  id,
  rotulo,
  valor,
  onChange,
  erro,
  sufixo,
  placeholder,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
  sufixo?: string;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        {rotulo}
      </Label>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          aria-invalid={erro ? true : undefined}
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          className={cn(CLASSE_CAMPO, sufixo && "pr-10")}
        />
        {sufixo ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-texto-suave">
            {sufixo}
          </span>
        ) : null}
      </div>
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}
