import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { CardPainel } from "@/components/dashboard/card-painel";
import type { RebanhoFazenda } from "@/lib/dashboard/data";
import { formatarInteiro } from "@/lib/formatacao";

const CORES: Record<RebanhoFazenda["propriedade"], string> = {
  joana: "#1D6A3D",
  catagua: "#3DB37E",
};

export function RebanhoPorFazenda({ itens }: { itens: RebanhoFazenda[] }) {
  const total = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <CardPainel className="flex h-auto min-h-[242px] flex-col lg:h-[242px]">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-texto">
          <MapPinned className="size-4 text-primary" aria-hidden />
          Rebanho por fazenda
        </h2>
        <Link
          href="/animais"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-action hover:underline"
        >
          Ver animais
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      {total === 0 ? (
        <p className="flex flex-1 items-center text-sm text-texto-suave">
          Nenhum animal ativo cadastrado ainda.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-4">
          <ul className="flex flex-col gap-3.5">
            {itens.map((item) => (
              <li key={item.propriedade}>
                <Link
                  href={`/animais?fazenda=${item.propriedade}`}
                  className="block rounded-[10px] hover:bg-muted/60"
                >
                  <div className="mb-1.5 flex items-end justify-between gap-2">
                    <span className="text-sm font-medium text-texto">
                      {item.rotulo}
                    </span>
                    <span className="text-right">
                      <span className="text-base font-bold tabular-nums text-texto">
                        {formatarInteiro(item.quantidade)}
                      </span>
                      <span className="ml-1.5 text-xs tabular-nums text-texto-suave">
                        {item.percentual}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-[6px] bg-[#E8F3EC]">
                    <div
                      className="h-full rounded-[6px]"
                      style={{
                        width: `${item.percentual}%`,
                        backgroundColor: CORES[item.propriedade],
                      }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-texto-suave">
            {formatarInteiro(total)} animais ativos nas duas unidades
          </p>
        </div>
      )}
    </CardPainel>
  );
}
