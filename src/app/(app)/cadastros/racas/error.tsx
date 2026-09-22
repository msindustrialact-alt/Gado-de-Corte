"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErroRacas({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 md:p-6">
      <section className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-card px-6 py-16 text-center shadow-card">
        <span className="flex size-14 items-center justify-center rounded-full bg-alerta/15 text-alerta">
          <TriangleAlert className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-texto">
          Não foi possível carregar as raças
        </h1>
        <p className="mt-1 max-w-sm text-sm text-texto-suave">
          Verifique a conexão e tente de novo. Se o problema continuar, fale
          com o administrador.
        </p>
        <Button
          type="button"
          className="mt-5 h-10 rounded-[10px] px-4"
          onClick={reset}
        >
          Tentar de novo
        </Button>
      </section>
    </div>
  );
}
