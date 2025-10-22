import XlsxPopulate from "xlsx-populate/browser/xlsx-populate";
import { saveAs } from "file-saver";

export async function exportToExcel(data) {
  const buf = await (await fetch("/chart-template.xlsx")).arrayBuffer();
  const wb  = await XlsxPopulate.fromDataAsync(buf);
  const ws  = wb.sheet("Data");

  const blocks = [
    { start: "A1", header: ["index","total"], rows: data.contactosPorMes },
    { start: "F1", header: ["contact","yes"], rows: data.tasaExitoCanal },
    { start: "I1", header: ["segment","conversionRate"], rows: data.conversionPorEdad },
    { start: "N1", header: ["poutcome","yes","no"], rows: data.impactoHistorial },
    { start: "S1", header: ["campaignCount","efficiency"], rows: data.indiceEficiencia },
  ];

  for (const { start, header, rows } of blocks) {
    const arr = Array.isArray(rows) ? rows : [];
    const matrix = [header, ...arr.map(r => header.map(k => r?.[k] ?? ""))];
    ws.cell(start).value(matrix);
  }

  ws.cell("B20").value(data?.tasaConversion?.conversionRate );
  ws.cell("B21").value(data?.avgDuration?.avgDuration);

  const out = await wb.outputAsync();
  saveAs(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "Dashboard.xlsx"
  );
}
