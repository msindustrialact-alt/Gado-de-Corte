import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function formatarMoedaDigitacao(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 12);

  if (!digitos) {
    return "";
  }

  const cents = Number(digitos) / 100;

  return cents.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarMoedaValor(
  valor: number | string | null | undefined,
): string {
  if (valor == null || valor === "") {
    return "";
  }

  const numero = typeof valor === "number" ? valor : Number(valor);

  if (!Number.isFinite(numero)) {
    return "";
  }

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CampoMoeda({
  id,
  rotulo,
  valor,
  onChange,
  erro,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        {rotulo}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-texto-suave">
          R$
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={erro ? true : undefined}
          value={valor}
          onChange={(evento) =>
            onChange(formatarMoedaDigitacao(evento.target.value))
          }
          className={cn(CLASSE_CAMPO, "pl-10")}
        />
      </div>
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}
