import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmBreve } from "@/components/layout/em-breve";
import { tituloDaRota } from "@/components/layout/nav-items";

type Props = {
  params: Promise<{ modulo: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modulo } = await params;
  const titulo = tituloDaRota(`/${modulo.join("/")}`) ?? "Em breve";

  return {
    title: `${titulo} | Fazenda Joana`,
  };
}

export default async function PaginaModulo({ params }: Props) {
  const { modulo } = await params;
  const href = `/${modulo.join("/")}`;
  const titulo = tituloDaRota(href);

  if (!titulo) {
    notFound();
  }

  return <EmBreve titulo={titulo} />;
}
