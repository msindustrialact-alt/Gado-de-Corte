"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  gravarFazendaPainel,
  lerCookieFazendaPainel,
  type FazendaPainel,
} from "@/lib/fazenda-painel";

const OPCOES: { valor: FazendaPainel; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "joana", rotulo: "Joana" },
  { valor: "catagua", rotulo: "Cataguá" },
];

export function SeletorFazenda({ inicial }: { inicial: FazendaPainel }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [memoria, setMemoria] = useState(inicial);
  const daUrl = searchParams.get("fazenda");
  const valor: FazendaPainel =
    daUrl === "joana" || daUrl === "catagua"
      ? daUrl
      : daUrl === "todas"
        ? "todas"
        : memoria;

  useEffect(() => {
    if (daUrl === "joana" || daUrl === "catagua") {
      gravarFazendaPainel(daUrl);
      setMemoria(daUrl);
      return;
    }

    if (daUrl === "todas") {
      gravarFazendaPainel("todas");
      setMemoria("todas");
      return;
    }

    setMemoria(lerCookieFazendaPainel());
  }, [daUrl]);

  function aoMudar(proximo: string) {
    const escolhida: FazendaPainel =
      proximo === "joana" || proximo === "catagua" ? proximo : "todas";
    gravarFazendaPainel(escolhida);
    setMemoria(escolhida);

    const params = new URLSearchParams(searchParams.toString());

    if (escolhida === "todas") {
      params.delete("fazenda");
    } else {
      params.set("fazenda", escolhida);
    }

    const consulta = params.toString();
    router.replace(consulta ? `${pathname}?${consulta}` : pathname, { scroll: false });
  }

  return (
    <label className="shrink-0">
      <span className="sr-only">Fazenda</span>
      <select
        aria-label="Fazenda"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="h-[42px] w-[104px] rounded-[10px] border border-[#E4E9E6] bg-[#F1F4F2] px-2 text-sm text-texto shadow-none sm:w-[124px]"
      >
        {OPCOES.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
