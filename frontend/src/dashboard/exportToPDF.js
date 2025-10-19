import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPdf = async (ref) => {
  const node = ref.current;
  const margin = 30;
  const scale = 2;            
  const pageW = 595;          
  const bodyW = pageW - margin * 2;

  const canvas = await html2canvas(node, {
    scale,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const imgW = bodyW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const pageH = imgH + margin * 2;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],  
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgW, imgH);
  pdf.save("chart-long.pdf");
};