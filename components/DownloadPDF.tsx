"use client";
import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Grafico = {
  id_grafico: number | string;
  titulo_grafico: string;
  activo: number;
};
type Kpi = { id_kpi: number; label: string; value: string | number };

interface Props {
  date: string;
  kpis: Kpi[];
  graficos: Grafico[];
  chartNodeIds: Record<number, string>;
  kpiNodeId: string;
}

// ðŸ§¾ Descripciones de cada grÃ¡fico
const CAPTIONS: Record<number, string> = {
  2: "Este gráfico compara las variaciones simultáneas de dióxido de carbono (CO₂) y temperatura ambiental, permitiendo analizar su correlación temporal. Un incremento conjunto puede indicar espacios cerrados con poca ventilación o mayor actividad metabólica y de ocupación. La divergencia entre ambas curvas evidencia posibles efectos meteorológicos o cambios en la densidad del aire que afectan la dispersión de gases.",
  3: "Representa la concentración promedio diaria de material particulado (PM2.5) y la compara con el valor límite recomendado por la Organización Mundial de la Salud (OMS). Este gráfico permite evaluar el cumplimiento normativo y detectar episodios de contaminación puntual. Valores consistentemente por debajo del límite reflejan una atmósfera saludable, mientras que los sobrepasos reiterados advierten necesidad de medidas correctivas.",
  4: "Este gráfico representa la proporción relativa de material particulado suspendido en el aire según su tamaño o tipo. Permite identificar cuál fracción de partículas (por ejemplo, PM1, PM2.5 o PM10) contribuye en mayor medida a la carga total de contaminación atmosférica. Un predominio de PM2.5 sugiere una presencia significativa de partículas finas, las más perjudiciales para la salud respiratoria.",
  5: "Este gráfico analiza la relación entre la concentración de CO₂ y el consumo energético o de recursos durante el periodo monitoreado. Un aumento paralelo puede evidenciar mayor ocupación, uso intensivo de equipos o ventilación insuficiente. La correlación entre ambos indicadores es clave para optimizar eficiencia energética y calidad del aire interior.",
  7: "La serie temporal muestra la evolución de las concentraciones de dióxido de carbono (CO₂) durante el periodo seleccionado. Esta visualización permite detectar picos de emisión asociados a actividad humana o a condiciones de ventilación limitadas. Tendencias ascendentes sostenidas podrían indicar una acumulación de gases en zonas de baja circulación de aire.",
  8: "Este gráfico refleja la variación horaria o diaria del material particulado fino (PM2.5). Permite observar patrones recurrentes, como incrementos durante horas punta o en condiciones meteorológicas adversas. La estabilidad en valores bajos sugiere un ambiente limpio y controlado, mientras que los picos abruptos advierten episodios de contaminación puntual.",
  9: "La gráfica muestra la dinámica térmica del entorno monitoreado, destacando las fluctuaciones diarias de temperatura. Las variaciones permiten correlacionar los cambios térmicos con los niveles de contaminación o con la ocurrencia de precipitaciones. Temperaturas estables indican condiciones atmosféricas homogéneas, mientras que amplitudes térmicas amplias reflejan influencia meteorológica significativa.",
  10: "Indica la variación de la humedad del aire a lo largo del tiempo. Este parámetro influye directamente en la formación y comportamiento de las partículas suspendidas y en la sensación térmica. Niveles altos pueden favorecer la condensación y el aumento temporal de PM, mientras que valores bajos reflejan aire seco y mayor dispersión.",
  11: "Este gráfico compara los valores medios de PM2.5 para cada día de la semana, evidenciando patrones de contaminación asociados a la actividad humana. Días laborales suelen mostrar concentraciones más altas debido al tránsito y actividad industrial, mientras que fines de semana tienden a valores más bajos. La comparación facilita la planificación de estrategias de mitigación según el comportamiento semanal.",
};

const PAR_MARGIN_X = 60;
const PAR_LINE_HEIGHT = 16;
const PAR_WIDTH = (doc: jsPDF) =>
  doc.internal.pageSize.getWidth() - PAR_MARGIN_X * 2;

//FUNCION PARA PÃRRAFO JUSTIFICADO.
function drawJustifiedParagraph(doc: jsPDF, text: string, yStart: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const textWidth = PAR_WIDTH(doc);
  const lines = doc.splitTextToSize(text, textWidth);

  let y = yStart;
  lines.forEach((line: any, i: any) => {
    const isLast = i === lines.length - 1;
    if (!isLast && line.includes(" ")) {
      const words = line.trim().split(/\s+/);
      const base = words.join(" ");
      const baseW = doc.getTextWidth(base);
      const gaps = words.length - 1;
      const extra = gaps > 0 ? (textWidth - baseW) / gaps : 0;

      let x = PAR_MARGIN_X;
      words.forEach((w: any, idx: any) => {
        doc.text(w, x, y);
        x += doc.getTextWidth(w) + (idx < gaps ? extra : 0);
      });
    } else {
      doc.text(line, PAR_MARGIN_X, y);
    }
    y += PAR_LINE_HEIGHT;
  });

  return y;
}

//FUNCIÃ“N PARA TÃTULO CENTRADO.
function drawSectionTitle(doc: jsPDF, title: string, y: number) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, pageW / 2, y, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
}

export default function DownloadPDF({
  date,
  kpis,
  graficos,
  chartNodeIds,
  kpiNodeId,
}: Props) {
  const [busy, setBusy] = useState(false);

  const addFooter = (doc: jsPDF, pageNum: number) => {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.text(`EcoPulse - ${new Date().toLocaleString("es-CL")}`, 20, h - 16, {
      align: "left",
    });
    doc.text(`Pagina ${pageNum}`, w - 40, h - 16, { align: "right" });
  };

  //Portada
  const addCover = (doc: jsPDF) => {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Fondo suave
    doc.setFillColor(230, 245, 255);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(25, 90, 140);
    doc.text("Reporte Ambiental", pageW / 2, 200, { align: "center" });

    doc.setFontSize(20);
    doc.text("EcoPulse", pageW / 2, 230, { align: "center" });

    // LÃ­nea decorativa
    doc.setDrawColor(25, 90, 140);
    doc.setLineWidth(1.2);
    doc.line(pageW / 2 - 60, 245, pageW / 2 + 60, 245);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text(
      `Fecha seleccionada: ${new Date(date).toLocaleDateString("es-CL")}`,
      pageW / 2,
      280,
      { align: "center" }
    );

    doc.setFontSize(11);
    doc.text(
      "Sistema de monitoreo ambiental y analitica inteligente.",
      pageW / 2,
      300,
      { align: "center" }
    );

    addFooter(doc, 1);
  };

  const addIntroduccion = (doc: jsPDF, pageNum: number) => {
    doc.addPage();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Introduccion", pageW / 2, 60, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const intro =
      "Este informe resume el estado ambiental monitoreado por la plataforma EcoPulse. Se presentan indicadores clave y tendencias obtenidas a partir de los sensores, junto con su comparacion respecto a valores de referencia.\n\nEl reporte se genera automaticamente e incluye KPIs y graficos que permiten visualizar la evolucion de las variables ambientales de interes. La informacion busca facilitar la interpretacion de los datos y apoyar la toma de decisiones.";
    // Justificar manualmente el texto (como en Word)
    const marginX = 60;
    const lineHeight = 16;
    const textWidth = pageW - marginX * 2;
    const lines = doc.splitTextToSize(intro, textWidth);

    let y = 100;
    lines.forEach((txt: any, idx: any) => {
      doc.text("-", PAR_MARGIN_X - 10, y);
      y = drawJustifiedParagraph(doc, txt, y);
      y += 6;
    });

    addFooter(doc, pageNum);
  };

  //KPIs
  const addKpis = async (
    doc: jsPDF,
    kpiNodeId: string,
    kpis: any[],
    pageNum: number
  ) => {
    const node = document.querySelector(kpiNodeId) as HTMLElement | null;
    if (!node) return;

    // Captura del bloque de KPIs
    node.scrollIntoView({ block: "center" });
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const footerSpace = 40;

    // 1) Preparamos los textos (descripciones) y estimamos su altura total
    const pm25 = kpis.find((k) => k.id_kpi === 1)?.value;
    const temp = kpis.find((k) => k.id_kpi === 2)?.value;
    const co2 = kpis.find((k) => k.id_kpi === 3)?.value;
    const rain = kpis.find((k) => k.id_kpi === 4)?.value;

    const items: string[] = [];
    if (pm25 !== undefined) {
      const ref = 130;
      const pos = Number(pm25) <= ref ? "por debajo" : "por encima";
      items.push(
        `MP2.5 promedio(día o rango seleccionado) (ug/m3): indicador de material particulado fino (<= 2.5 um). Al momento de la generacion del informe, el promedio fue ${pm25} ug/m3, ubicandose ${pos} del umbral OMS (${ref} ug/m3). ` +
          `Al momento de la generacion del informe, el promedio fue ${pm25}ug/m3, ` +
          `ubicandose ${pos} del umbral OMS (${ref}ug/m3).`
      );
    }
    if (temp !== undefined) {
      items.push(
        `Temperatura promedio (C) (dia o rango seleccionado): describe las condiciones termicas predominantes del periodo. El valor observado es ${temp} C. ` +
          `El valor observado es ${temp}°C.`
      );
    }
    if (co2 !== undefined) {
      items.push(
        `CO2 promedio(ppm) (dia o rango seleccionado): mayor concentracion puntual registrada por los sensores durante el intervalo. El valor alcanzo ${co2} ppm. `
      );
    }
    if (rain !== undefined) {
      items.push(
        `Precipitacion acumulada(mm) (dia o rango seleccionado): total de agua caida en el periodo de analisis. Se registro ${rain} mm. ` +
          `Se registro ${rain} mm.`
      );
    }
    if (items.length === 0) {
      kpis.forEach((k) => items.push(`${k.label}: ${k.value}.`));
    }

    // Estimar altura total del texto para reservar espacio antes de calcular el tamaÃ±o de la imagen
    const textWidth = PAR_WIDTH(doc);
    const bulletGap = 6;
    let estimatedTextHeight = 0;
    items.forEach((txt) => {
      const wrapped = doc.splitTextToSize(txt, textWidth);
      const linesCount = wrapped.length;
      estimatedTextHeight += linesCount * PAR_LINE_HEIGHT + bulletGap;
    });
    if (estimatedTextHeight > 0) {
      estimatedTextHeight -= bulletGap; // quitar el gap del Ãºltimo bullet
    }

    // 2) Pintamos la pÃ¡gina: tÃ­tulo â†’ imagen (arriba) â†’ texto (debajo)
    doc.addPage();
    drawSectionTitle(doc, "KPIs del Dashboard", 50);

    const titleGap = 20;
    const imgTop = 50 + titleGap; // debajo del tÃ­tulo
    const textTopGap = 18; // espacio entre imagen y texto

    // Calcular tamaÃ±o mÃ¡ximo permitido para la imagen para que quepa tambiÃ©n el texto y el footer
    const maxW = pageW - 80;
    const maxH =
      pageH - imgTop - textTopGap - estimatedTextHeight - footerSpace;

    // Si el texto es muy largo, maxH podrÃ­a ser pequeÃ±o; aseguramos un mÃ­nimo visual
    const safeMaxH = Math.max(120, maxH);

    const ratio = Math.min(maxW / canvas.width, safeMaxH / canvas.height);
    const drawW = canvas.width * ratio;
    const drawH = canvas.height * ratio;
    const imgX = (pageW - drawW) / 2;
    const imgY = imgTop;

    // Dibuja imagen primero
    doc.addImage(img, "PNG", imgX, imgY, drawW, drawH);

    // 3) Descripciones justificadas, DEBAJO de la imagen
    let y = imgY + drawH + textTopGap;
    items.forEach((txt) => {
      // bullet
      doc.text("-", PAR_MARGIN_X - 10, y);
      y = drawJustifiedParagraph(doc, txt, y);
      y += bulletGap;
    });
    addFooter(doc, pageNum);
  };

  //GRAFICOS
  const addDomImage = async (
    doc: jsPDF,
    selector: string,
    title: string,
    caption: string,
    pageNum: number
  ) => {
    const node = document.querySelector(selector) as HTMLElement | null;
    if (!node) return;

    node.scrollIntoView({ block: "center" });
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const footerSpace = 40;

    doc.addPage();
    drawSectionTitle(doc, title, 40);

    const maxW = pageW - 100;
    const maxH = pageH - 180;
    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = Math.min(maxW / imgW, maxH / imgH);
    const drawW = imgW * ratio;
    const drawH = imgH * ratio;
    const imgX = (pageW - drawW) / 2;
    const imgY = 60;
    doc.addImage(img, "PNG", imgX, imgY, drawW, drawH);

    if (caption) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const yCaption = imgY + drawH + 18;

      const yEndLimit = pageH - footerSpace - 10;
      let y = drawJustifiedParagraph(doc, caption, yCaption);

      if (y > yEndLimit) {
        const remaining = caption;
        doc.addPage();
        drawSectionTitle(doc, "ContinuaciÃ³n", 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        y = drawJustifiedParagraph(doc, remaining, 70);
      }
    }

    addFooter(doc, pageNum);
  };

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      // Portada
      addCover(doc);

      let pageNum = 2;

      // Introduccion
      addIntroduccion(doc, pageNum++);

      // KPIs
      await addKpis(doc, kpiNodeId, kpis, pageNum++);

      // GrÃ¡ficos activos
      const activos = graficos
        .filter((g) => Number(g.activo) === 1)
        .sort((a, b) => Number(a.id_grafico) - Number(b.id_grafico));

      for (const g of activos) {
        const nodeSel = chartNodeIds[Number(g.id_grafico)];
        const caption = CAPTIONS[Number(g.id_grafico)] || "";
        if (nodeSel) {
          await addDomImage(doc, nodeSel, g.titulo_grafico, caption, pageNum++);
        }
      }

      const name = `EcoPulse_${new Date(date).toISOString().slice(0, 10)}.pdf`;
      doc.save(name);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="btn btn-sm dashboard-btn-blue"
      onClick={handleExport}
      disabled={busy}
    >
      {busy ? "Generando PDF..." : "Exportar PDF"}
    </button>
  );
}
