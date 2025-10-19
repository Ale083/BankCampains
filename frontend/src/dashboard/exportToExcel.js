import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

export async function exportToExcel({
  charts = [],                   
  filename,
  scale = 2,
  backgroundColor = "#fff",
} = {}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Charts");
  let row = 1;

  for (const t of charts) {
    const el = t?.current || t;
    if (!el) continue;

    let n = el, box;
    const r0 = el.getBoundingClientRect?.() || { width: 0, height: 0 };
    const hidden = !el.isConnected || r0.width === 0 || r0.height === 0 || getComputedStyle(el).display === "none";
    if (hidden) {
      n = el.cloneNode(true);
      box = document.createElement("div");
      Object.assign(box.style, { position: "fixed", left: "-10000px", top: 0, background: backgroundColor, width: (r0.width || 800) + "px" });
      n.style.width = (r0.width || 800) + "px";
      n.style.height = (r0.height || 400) + "px";
      box.appendChild(n); document.body.appendChild(box);
    }

    await new Promise(r => requestAnimationFrame(r));
    const r1 = n.getBoundingClientRect();
    const pad = 4, W = Math.ceil(r1.width) + pad, H = Math.ceil(r1.height) + pad;

    const canvas = await html2canvas(n, { scale, backgroundColor, useCORS: true, windowWidth: W, windowHeight: H });
    if (box) document.body.removeChild(box);

    const id = wb.addImage({ base64: canvas.toDataURL("image/png"), extension: "png" });
    const w = canvas.width / 2, h = canvas.height / 2;

    ws.addImage(id, { tl: { col: 0, row: row - 1 }, ext: { width: w, height: h }, editAs: "oneCell" });
    row += Math.ceil(h / 20) + 3; 
  }

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), filename);
}
