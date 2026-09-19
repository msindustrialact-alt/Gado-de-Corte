import type { Metadata } from "next";

import { EmBreve } from "@/components/layout/em-breve";

export const metadata: Metadata = {
  title: "Editar animal | Fazenda Joana",
};

export default function PaginaEditarAnimal() {
  return (
    <div className="p-4 md:p-6">
      <EmBreve titulo="Editar animal" />
    </div>
  );
}
