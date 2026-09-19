import type { Metadata } from "next";

import { EmBreve } from "@/components/layout/em-breve";

export const metadata: Metadata = {
  title: "Novo animal | Fazenda Joana",
};

export default function PaginaNovoAnimal() {
  return (
    <div className="p-4 md:p-6">
      <EmBreve titulo="Novo animal" />
    </div>
  );
}
