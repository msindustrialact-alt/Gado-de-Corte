import { cn } from "@/lib/utils";

export const CLASSE_CAMPO =
  "h-11 min-h-11 w-full rounded-[10px] border border-border bg-card px-3 text-base text-texto shadow-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-perigo";

export function SegmentedControl<T extends string>({
  valor,
  opcoes,
  onChange,
  ariaLabel,
  erro,
}: {
  valor: T | "";
  opcoes: { valor: T; rotulo: string }[];
  onChange: (valor: T) => void;
  ariaLabel: string;
  erro?: string;
}) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-invalid={erro ? true : undefined}
        className={cn(
          "grid gap-1 rounded-[10px] border border-border bg-muted p-1",
          opcoes.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {opcoes.map((opcao) => {
          const ativo = valor === opcao.valor;

          return (
            <button
              key={opcao.valor}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => onChange(opcao.valor)}
              className={cn(
                "h-11 min-h-11 rounded-[8px] px-2 text-base font-medium transition-colors",
                ativo
                  ? "bg-primary text-primary-foreground"
                  : "text-texto hover:bg-card",
              )}
            >
              {opcao.rotulo}
            </button>
          );
        })}
      </div>
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}
