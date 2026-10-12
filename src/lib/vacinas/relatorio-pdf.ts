import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { formatarData } from "@/lib/formatacao";
import { LABELS_STATUS_VACINA, type StatusVacinaAnimal } from "@/lib/vacinas";
import type { LinhaRelatorioVacina } from "@/lib/vacinas/data";

export type FiltrosRelatorioVacina = {
  loteId: string;
  status: "" | StatusVacinaAnimal;
  vacinaId: string;
  vacinaNome: string;
};

export function filtrarLinhasRelatorio(
  linhas: LinhaRelatorioVacina[],
  filtros: FiltrosRelatorioVacina,
): LinhaRelatorioVacina[] {
  return linhas.filter((linha) => {
    if (filtros.loteId && linha.lote_id !== filtros.loteId) return false;
    if (filtros.status && linha.status !== filtros.status) return false;
    if (filtros.vacinaNome) {
      const tem = linha.vacinas_feitas.includes(filtros.vacinaNome);
      // Filtro "já tomou esta vacina"
      if (!tem) return false;
    }
    return true;
  });
}

export function gerarPdfRelatorioVacinas(params: {
  fazendaNome: string;
  geradoEm: string;
  linhas: LinhaRelatorioVacina[];
  filtrosResumo: string;
}): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const margem = 12;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Vacinas", margem, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(params.fazendaNome, margem, 23);
  doc.text(`Gerado em: ${formatarData(params.geradoEm)}`, margem, 29);

  if (params.filtrosResumo) {
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Filtros: ${params.filtrosResumo}`, margem, 35);
    doc.setTextColor(0);
  }

  const realizados = params.linhas.filter((l) => l.status === "em_dia").length;
  const pendentes = params.linhas.filter((l) => l.status === "incompleto").length;
  const atrasados = params.linhas.filter((l) => l.status === "atrasado").length;

  doc.setFontSize(9);
  doc.text(
    `Total: ${params.linhas.length}  ·  Realizado: ${realizados}  ·  Pendente: ${pendentes}  ·  Atrasado: ${atrasados}`,
    margem,
    params.filtrosResumo ? 41 : 36,
  );

  const startY = params.filtrosResumo ? 45 : 40;

  autoTable(doc, {
    startY,
    margin: { left: margem, right: margem },
    head: [
      [
        "Brinco",
        "Nome",
        "Lote",
        "Status",
        "Última vacina",
        "Data",
        "Vacinas feitas",
      ],
    ],
    body: params.linhas.map((linha) => [
      linha.brinco,
      linha.nome ?? "—",
      linha.lote_nome,
      LABELS_STATUS_VACINA[linha.status],
      linha.ultima_vacina_nome ?? "—",
      formatarData(linha.ultima_data),
      linha.vacinas_feitas.length > 0
        ? linha.vacinas_feitas.join(", ")
        : "—",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 1.6,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [15, 61, 36],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 248, 246] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 24 },
      4: { cellWidth: 40 },
      5: { cellWidth: 24 },
      6: { cellWidth: "auto" },
    },
  });

  const nomeArquivo = `relatorio-vacinas-${params.geradoEm}.pdf`;
  doc.save(nomeArquivo);
}
