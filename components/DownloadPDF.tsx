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

type ApiGraph = {
  id_grafico: number;
  titulo_grafico?: string;
  descripcion_relacion?: string;
  variables?: string[];
  visualizacion?: number | null;
  activo?: number | null;
};

type ReportContext = {
  tipoReporte: {
    id_tipo_reporte: number;
    nombre_tipo_reporte: string;
    descripcion_tipo_reporte: string;
  } | null;
  dashboard: {
    id_dashboard: number;
    titulo_dashboard: string;
    estado_dashboard: number | null;
    fecha_creacion_dashboard: string | null;
    descripcion_dashboard: string | null;
  } | null;
  graficos: ApiGraph[];
};

interface Props {
  date: string;
  startDate?: string;
  endDate?: string;
  kpis: Kpi[];
  graficos: Grafico[];
  chartNodeIds: Record<number, string>;
  kpiNodeId: string;
  reportTypeId?: number;
  dashboardId?: number;
}

// Descripciones base de cada grafico (fallback cuando no hay datos desde BD).
const CAPTIONS: Record<number, string> = {
  1: "Este grafico compara las variaciones simultaneas de CO2 y temperatura ambiental, permitiendo analizar su correlacion temporal y el impacto de la ventilacion.",
  2: "Representa la concentracion promedio diaria de material particulado y la compara con el limite recomendado por la OMS. Permite evaluar cumplimiento normativo y episodios de contaminacion.",
  3: "Muestra la proporcion relativa de material particulado suspendido en el aire segun su tamano. Ayuda a identificar la fraccion de particulas que mas contribuye a la carga total.",
  4: "Analiza la relacion entre la concentracion de CO2 y el consumo energetico o de recursos durante el periodo monitoreado.",
  5: "Resumen de patrones ambientales detectados a partir de los datos historicos de los sensores.",
  6: "Serie temporal de las concentraciones de CO2 para detectar picos asociados a actividad humana o ventilacion limitada.",
  7: "Variacion del material particulado fino (PM2.5) en el periodo seleccionado, destacando patrones recurrentes o picos puntuales.",
  8: "Dinamica termica del entorno monitoreado, mostrando fluctuaciones de temperatura y su posible relacion con la calidad del aire.",
  9: "Variacion de la humedad del aire a lo largo del tiempo y su influencia en el comportamiento de las particulas suspendidas.",
  10: "Comparacion de valores medios de PM2.5 por dia de la semana para detectar patrones asociados a la actividad humana.",
};

const PAR_MARGIN_X = 60;
const PAR_LINE_HEIGHT = 16;
const PAR_WIDTH = (doc: jsPDF) =>
  doc.internal.pageSize.getWidth() - PAR_MARGIN_X * 2;

const VARIABLE_LABELS: Record<string, string> = {
  "mp1.0_ate": "Material particulado 1.0",
  "mp2.5_ate": "Material particulado 2.5",
  "mp10_ate": "Material particulado 10",
  co2_mhz19: "Dioxido de Carbono",
  timestamp_registro: "Fecha/hora registro",
  tem_bme280: "Temperatura",
  dia_semana: "Día de la semana",
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  let d: Date | null = null;
  const match = value.match(dateOnly);
  if (match) {
    // Interpretar fecha sin hora como local para evitar desfase de zona horaria
    const [_, y, m, day] = match;
    d = new Date(Number(y), Number(m) - 1, Number(day));
  } else {
    d = new Date(value);
  }

  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : value;
};

function drawJustifiedParagraph(
  doc: jsPDF,
  text: string,
  yStart: number,
  xStart: number = PAR_MARGIN_X,
  forcedWidth?: number
) {
  const textWidth =
    forcedWidth ?? doc.internal.pageSize.getWidth() - xStart - PAR_MARGIN_X;
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  let y = yStart;
  paragraphs.forEach((para, pIdx) => {
    const lines = doc.splitTextToSize(para, textWidth);

    lines.forEach((line: string, i: number) => {
      const isLast = i === lines.length - 1;
      const words = line.trim().split(/\s+/);
      const hasGaps = words.length > 1;

      if (!isLast && hasGaps) {
        const gaps = words.length - 1;
        const wordsWidth = words.reduce((acc, w) => acc + doc.getTextWidth(w), 0);
        const spaceWidth = doc.getTextWidth(" ");
        const remaining = textWidth - (wordsWidth + spaceWidth * gaps);
        const gapSize =
          remaining >= 0
            ? spaceWidth + remaining / gaps
            : spaceWidth; // evita superposicion si el texto es mas ancho

        let x = xStart;
        words.forEach((w, idx) => {
          doc.text(w, x, y);
          x += doc.getTextWidth(w) + (idx < gaps ? gapSize : 0);
        });
      } else {
        doc.text(line, xStart, y);
      }
      y += PAR_LINE_HEIGHT;
    });

    if (pIdx < paragraphs.length - 1) {
      y += PAR_LINE_HEIGHT * 0.05; // espacio casi nulo entre parrafos
    }
  });

  return y;
}

function drawSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
  align: "left" | "center" = "left"
) {
  const pageW = doc.internal.pageSize.getWidth();
  const x = align === "center" ? pageW / 2 : PAR_MARGIN_X;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, x, y, { align });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
}

const isGraphActive = (g?: ApiGraph) => {
  const show = g?.visualizacion === undefined || Number(g.visualizacion) === 1;
  const activeFlag = g?.activo === undefined || Number(g.activo) === 1;
  return show && activeFlag;
};

const buildCaption = (id: number, graph?: ApiGraph) => {
  const baseText =
    graph?.descripcion_relacion?.trim() || CAPTIONS[id] || "Grafico del dashboard.";
  const base = baseText.trim().endsWith(".") ? baseText.trim() : `${baseText.trim()}.`;

  const vars = graph?.variables ?? [];
  const varsFormatted = vars
    .map((v) => VARIABLE_LABELS[v] || v)
    .filter(Boolean);

  let varsText = "";
  if (varsFormatted.length === 1) {
    varsText = `Variables utilizadas: ${varsFormatted[0]}.`;
  } else if (varsFormatted.length === 2) {
    varsText = `Variables utilizadas: ${varsFormatted[0]} y ${varsFormatted[1]}.`;
  } else if (varsFormatted.length > 2) {
    const last = varsFormatted[varsFormatted.length - 1];
    const head = varsFormatted.slice(0, -1).join(", ");
    varsText = `Variables utilizadas: ${head} y ${last}.`;
  }

  return [base, varsText].filter(Boolean).join("\n");
};

const buildGraphList = (
  chartNodeIds: Record<number, string>,
  ctx: ReportContext | null,
  graficos: Grafico[]
) => {
  const ctxGraphs = ctx?.graficos ?? [];
  const fallback = graficos ?? [];
  const byIdCtx = new Map<number, ApiGraph>();
  ctxGraphs.forEach((g) => byIdCtx.set(Number(g.id_grafico), g));

  const candidates: ApiGraph[] =
    ctxGraphs.length > 0
      ? ctxGraphs
      : fallback.map((g) => ({
          id_grafico: Number(g.id_grafico),
          titulo_grafico: g.titulo_grafico,
          activo: g.activo,
        }));

  const result: Array<{
    id: number;
    selector: string;
    title: string;
    caption: string;
  }> = [];

  candidates.forEach((item) => {
    const id = Number(item.id_grafico);
    if (!Number.isFinite(id) || id === 5) return; // id 5 no se usa en este reporte
    const selector = chartNodeIds[id];
    if (!selector) return;

    const info = byIdCtx.get(id) ?? item;
    const isActive =
      info?.visualizacion !== undefined || info?.activo !== undefined
        ? isGraphActive(info)
        : Number((item as any).activo ?? 1) === 1;
    if (!isActive) return;

    const title =
      info?.titulo_grafico || (item as any).titulo_grafico || `Grafico ${id}`;
    const caption = buildCaption(id, info);

    result.push({ id, selector, title, caption });
  });

  return result.sort((a, b) => a.id - b.id);
};

const fetchReportContext = async (
  reportTypeId?: number,
  dashboardId?: number
): Promise<ReportContext | null> => {
  try {
    const params = new URLSearchParams();
    if (reportTypeId) params.set("reportTypeId", String(reportTypeId));
    if (dashboardId) params.set("dashboardId", String(dashboardId));

    const url =
      params.toString().length > 0
        ? `/api/reportes/pdf-data?${params.toString()}`
        : "/api/reportes/pdf-data";

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;

    const data = json.data as ReportContext;
    return {
      tipoReporte: data?.tipoReporte ?? null,
      dashboard: data?.dashboard ?? null,
      graficos: Array.isArray(data?.graficos) ? data.graficos : [],
    };
  } catch (error) {
    console.warn("DownloadPDF: no se pudo obtener info del reporte", error);
    return null;
  }
};

const applyFooters = (doc: jsPDF) => {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`EcoPulse - ${new Date().toLocaleString("es-CL")}`, 20, h - 16, {
      align: "left",
    });
    doc.text(`Pagina ${i} / ${total}`, w - 40, h - 16, { align: "right" });
  }
};

const addCover = (
  doc: jsPDF,
  date: string,
  ctx: ReportContext | null,
  startDate?: string,
  endDate?: string
) => {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFillColor(230, 245, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(25, 90, 140);
  const reportTitle = "Resumen PDF EcoPulse";
  const titleY = pageH / 2 - 120;
  doc.text(reportTitle, pageW / 2, titleY, { align: "center" });

  doc.setFontSize(24);
  doc.text(
    ctx?.dashboard?.titulo_dashboard || "Dashboard Ambiental",
    pageW / 2,
    titleY + 60,
    { align: "center" }
  );

  doc.setDrawColor(25, 90, 140);
  doc.setLineWidth(1.2);
  doc.line(pageW / 2 - 80, titleY + 78, pageW / 2 + 80, titleY + 78);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const rangeLabel =
    startDate && endDate
      ? `Rango seleccionado: ${formatDate(startDate)} a ${formatDate(endDate)}`
      : `Fecha del reporte: ${formatDate(date)}`;

  doc.text(rangeLabel, pageW / 2, titleY + 108, {
    align: "center",
  });
};

const addIntroduccion = (doc: jsPDF, ctx: ReportContext | null) => {
  doc.addPage();
  drawSectionTitle(doc, "Introducción", 60, "left");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const introBlocks = [
    (ctx?.tipoReporte?.descripcion_tipo_reporte?.trim() ||
      "Reporte que muestra graficas y metricas de un dashboard") +
      " orientado al monitoreo ambiental de la plataforma EcoPulse. Este documento entrega una vision clara y estructurada del estado actual de las variables atmosfericas medidas y de la forma en que se representan en los componentes visuales del sistema.",
    "Las mediciones provienen de sensores instalados en distintas zonas de Santiago, Chile. Se registran en tiempo casi real variables como temperatura, humedad relativa, presion atmosferica, material particulado fino y otros parametros relevantes de calidad del aire. Estos datos se procesan para resaltar tendencias, identificar umbrales criticos y generar alertas, entregando contexto ejecutivo y operativo para la toma de decisiones.",
    (ctx?.dashboard?.descripcion_dashboard?.trim() ||
      "Configuracion inicial de graficos que se podrian visualizar en un dashboard") +
      ". Se detalla que variables se incluyen en cada grafica, que filtros o rangos temporales se consideran y que tipo de visualizacion se utiliza (lineas, barras, indicadores, entre otros). Con ello se facilita la trazabilidad de KPIs y la coherencia entre la plataforma y este documento.",
    "Finalmente, se describen los KPIs capturados desde la pagina de monitoreo y los graficos habilitados para el dashboard seleccionado. Cada visualizacion mantiene la configuracion activa en EcoPulse, asegurando consistencia con el monitoreo en linea. Esto favorece comparaciones entre periodos y soporta decisiones informadas sobre la calidad ambiental de la ciudad.",
  ];

  let y = 100;
  introBlocks.forEach((txt) => {
    y = drawJustifiedParagraph(doc, txt, y);
    y += 10;
  });
};

const drawDashboardSummary = (
  doc: jsPDF,
  ctx: ReportContext | null,
  startY: number,
  reportDate?: string,
  endDate?: string
) => {
  if (!ctx?.dashboard) return startY;

  const state =
    Number(ctx.dashboard.estado_dashboard) === 1
      ? "Activo"
      : String(ctx.dashboard.estado_dashboard ?? "") || "Sin estado";
  const requestDate = endDate || reportDate || new Date().toISOString();

  let y = startY;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Dashboard: ${ctx.dashboard.titulo_dashboard}`, PAR_MARGIN_X, y);
  y += PAR_LINE_HEIGHT;
  doc.text(`Estado: ${state}`, PAR_MARGIN_X, y);
  y += PAR_LINE_HEIGHT;
  doc.text(`Fecha solicitud: ${formatDate(requestDate)}`, PAR_MARGIN_X, y);

  if (ctx.dashboard.descripcion_dashboard) {
    y += PAR_LINE_HEIGHT;
    doc.text("Descripción:", PAR_MARGIN_X, y);
    const desc = ctx.dashboard.descripcion_dashboard.trim();
    const descWithDot =
      desc.endsWith(".") || desc.endsWith("!") || desc.endsWith("?") ? desc : `${desc}.`;
    y = drawJustifiedParagraph(doc, descWithDot, y + PAR_LINE_HEIGHT);
  }

  const activeGraphs = (ctx.graficos || [])
    .filter((g) => Number(g.activo ?? 1) === 1 && isGraphActive(g))
    .map((g) => g.titulo_grafico)
    .filter(Boolean);
  const graphsText =
    activeGraphs.length > 0
      ? "Graficos en el reporte:"
      : "No hay graficos activos configurados para este dashboard.";

  y += 12;
  doc.text(graphsText, PAR_MARGIN_X, y);

  if (activeGraphs.length > 0) {
    y += PAR_LINE_HEIGHT;
    activeGraphs.forEach((title) => {
      doc.text(`- ${title}`, PAR_MARGIN_X + 10, y);
      y += PAR_LINE_HEIGHT;
    });
  }

  return y;
};

const addKpis = async (
  doc: jsPDF,
  kpiNodeId: string,
  kpis: Kpi[],
  startY: number
) => {
  const node = document.querySelector(kpiNodeId) as HTMLElement | null;
  if (!node) return;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const pm25 = kpis.find((k) => k.id_kpi === 1)?.value;
  const temp = kpis.find((k) => k.id_kpi === 2)?.value;
  const co2 = kpis.find((k) => k.id_kpi === 3)?.value;
  const rain = kpis.find((k) => k.id_kpi === 4)?.value;

  const items: string[] = [];
  if (pm25 !== undefined) {
    const ref = 130;
    const pos = Number(pm25) <= ref ? "por debajo" : "por encima";
    items.push(
      `MP2.5 promedio: ${pm25} ug/m3, ${pos} del umbral OMS (${ref} ug/m3). Resume la carga de partículas finas en el período analizado y sirve para identificar posibles episodios de contaminación.`
    );
  }
  if (temp !== undefined) {
    items.push(
      `Temperatura promedio: ${temp} C en el período evaluado. Ayuda a relacionar variaciones térmicas con el comportamiento de otros indicadores ambientales.`
    );
  }
  if (co2 !== undefined) {
    items.push(
      `CO2 máximo registrado: ${co2} ppm en el período analizado. Permite detectar espacios con ventilación insuficiente o alta ocupación.`
    );
  }
  if (rain !== undefined) {
    items.push(
      `Promedio de agua caída: ${rain} mm en el período seleccionado. Referencia útil para interpretar dispersión de partículas y eventos climáticos.`
    );
  }
  if (items.length === 0) {
    kpis.forEach((k) =>
      items.push(
        `${k.label}: ${k.value}. Indicador proveniente del panel de monitoreo activo.`
      )
    );
  }

  const cards = Array.from(
    node.querySelectorAll(".Kpicard")
  ) as HTMLElement[];

  const cardMaxW = 220;
  const gapY = 22;
  let y = startY;

  const drawCardRow = async (
    cardEl: HTMLElement,
    text: string,
    isFirstRow: boolean
  ) => {
    if (!isFirstRow && y > pageH - 120) {
      doc.addPage();
      drawSectionTitle(doc, "KPIs Card del Dashboard (cont.)", 50);
      y = 80;
    }

    cardEl.scrollIntoView({ block: "center" });
    const canvas = await html2canvas(cardEl, { scale: 2, useCORS: true });
    const ratio = Math.min(cardMaxW / canvas.width, 160 / canvas.height);
    const drawW = canvas.width * ratio;
    const drawH = canvas.height * ratio;
    const imgX = PAR_MARGIN_X;
    const imgY = y;
    doc.addImage(canvas.toDataURL("image/png"), "PNG", imgX, imgY, drawW, drawH);

    const textX = imgX + drawW + 18;
    const textWidth = pageW - textX - PAR_MARGIN_X;
    const textY = imgY + 12;
    const endTextY = drawJustifiedParagraph(doc, text, textY, textX, textWidth);
    const textHeight = endTextY - textY;

    const rowHeight = Math.max(drawH, textHeight);
    y += rowHeight + gapY;
  };

  // Emparejar cards y textos por orden; si no hay cards se cae al nodo completo.
  if (cards.length === items.length && cards.length > 0) {
    for (let i = 0; i < cards.length; i++) {
      await drawCardRow(cards[i], items[i], i === 0);
    }
  } else {
    // Fallback: una sola captura del contenedor + lista debajo
    node.scrollIntoView({ block: "center" });
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const maxW = pageW - 80;
    const ratio = Math.min(maxW / canvas.width, 200 / canvas.height);
    const drawW = canvas.width * ratio;
    const drawH = canvas.height * ratio;
    const imgX = (pageW - drawW) / 2;
    const imgY = y;
    doc.addImage(canvas.toDataURL("image/png"), "PNG", imgX, imgY, drawW, drawH);
    y = imgY + drawH + 14;
    items.forEach((txt) => {
      y = drawJustifiedParagraph(doc, txt, y);
      y += 6;
    });
  }
};

const addDomImage = async (
  doc: jsPDF,
  selector: string,
  title: string,
  caption: string
) => {
  const node = document.querySelector(selector) as HTMLElement | null;
  if (!node) return null;

  node.scrollIntoView({ block: "center" });
  const canvas = await html2canvas(node, { scale: 2, useCORS: true });
  const img = canvas.toDataURL("image/png");
  const imgProps = { width: canvas.width, height: canvas.height, data: img };
  return imgProps;
};

const addCharts = async (
  doc: jsPDF,
  charts: Array<{ id: number; selector: string; title: string; caption: string }>
) => {
  if (charts.length === 0) return;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const topOffset = 70;
  const blockGap = 32;
  const blockHeight = (pageH - topOffset * 2 - blockGap) / 2;

  const drawBlock = (
    chart: { title: string; caption: string },
    imgData: { width: number; height: number; data: string } | null,
    top: number
  ) => {
    drawSectionTitle(doc, chart.title, top + 10, "left");
    const titleGap = 18;
    const imgTop = top + titleGap + 16;
    const maxW = pageW - 100;
    const maxH = blockHeight * 0.6;
    if (imgData) {
      const ratio = Math.min(maxW / imgData.width, maxH / imgData.height);
      const drawW = imgData.width * ratio;
      const drawH = imgData.height * ratio;
      const imgX = (pageW - drawW) / 2;
      doc.addImage(imgData.data, "PNG", imgX, imgTop, drawW, drawH);
      const textTop = imgTop + drawH + PAR_LINE_HEIGHT * 1.5; // mas espacio entre imagen y texto
      drawJustifiedParagraph(doc, chart.caption, textTop, PAR_MARGIN_X);
    } else {
      doc.text("No se pudo capturar el grafico.", PAR_MARGIN_X, imgTop);
    }
  };

  for (let i = 0; i < charts.length; i += 2) {
    doc.addPage();
    const first = charts[i];
    const second = charts[i + 1];

    const img1 = await addDomImage(doc, first.selector, first.title, first.caption);
    drawBlock(first, img1, topOffset);

    if (second) {
      const img2 = await addDomImage(doc, second.selector, second.title, second.caption);
      drawBlock(second, img2, topOffset + blockHeight + blockGap);
    }
  }
};

export default function DownloadPDF({
  date,
  startDate,
  endDate,
  kpis,
  graficos,
  chartNodeIds,
  kpiNodeId,
  reportTypeId,
  dashboardId,
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const ctx = await fetchReportContext(reportTypeId, dashboardId);

      addCover(doc, date, ctx, startDate, endDate);
      addIntroduccion(doc, ctx);
      // Resumen + KPIs en una sola pagina
      doc.addPage();
      drawSectionTitle(doc, "Resumen del dashboard", 50);
      let nextY = drawDashboardSummary(doc, ctx, 90, date, endDate);
      nextY += 24;
      drawSectionTitle(doc, "KPIs Card del Dashboard", nextY);
      await addKpis(doc, kpiNodeId, kpis, nextY + 20);

      const charts = buildGraphList(chartNodeIds, ctx, graficos);
      await addCharts(doc, charts);

      applyFooters(doc);

      const parsed = new Date(date);
      const isoDate = Number.isNaN(parsed.getTime())
        ? new Date().toISOString().slice(0, 10)
        : parsed.toISOString().slice(0, 10);
      const reportName =
        ctx?.dashboard?.titulo_dashboard &&
        ctx.dashboard.titulo_dashboard.trim() !== ""
          ? `EcoPulse_${ctx.dashboard.titulo_dashboard}_${isoDate}.pdf`
          : `EcoPulse_${isoDate}.pdf`;

      doc.save(reportName);

      try {
        const payload: {
          id_tipo_reporte: number;
          id_dashboard?: number;
          titulo_reporte?: string;
        } = {
          id_tipo_reporte: reportTypeId ?? 1,
          titulo_reporte:
            ctx?.dashboard?.titulo_dashboard || reportName.replace(".pdf", ""),
        };
        if (typeof dashboardId === "number") {
          payload.id_dashboard = dashboardId;
        }

        await fetch("/api/reportes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error registrando reporte PDF:", error);
      }
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
