"use client";

import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DownloadClusterPDFProps {
  targetSelector: string;
  fileName?: string;
  hideSelectors?: string[];
  btnClassName?: string;
  reportTypeId?: number;
  dashboardId?: number;
}

export default function DownloadClusterPDF({
  targetSelector,
  fileName,
  hideSelectors,
  btnClassName,
  reportTypeId,
  dashboardId,
}: DownloadClusterPDFProps) {
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/graficos-modelo", { cache: "no-store" });
        const j = await res.json();
        if (!res.ok || !j?.success || !Array.isArray(j.data)) return;
        // Para el modelo de clustering tomamos el id_grafico = 5 por defecto
        const row = (j.data as any[]).find(
          (r) => Number(r?.id_grafico ?? r?.id_modelo) === 5
        );
        const desc =
          row?.descripcion_relacion ??
          row?.["descripcion_relacion"] ??
          row?.["descripcion_relación"];
        if (typeof desc === "string" && desc.trim()) {
          setCaption(desc.trim());
        }
      } catch (err) {
        console.warn("No se pudo cargar detalle_grafico_modelo:", err);
      }
    })();
  }, []);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const root = document.querySelector(targetSelector) as HTMLElement | null;
      if (!root) {
        console.warn("DownloadClusterPDF: no se encontró el nodo objetivo");
        return;
      }

      const hidden: { el: HTMLElement; visibility: string }[] = [];
      if (hideSelectors && hideSelectors.length > 0) {
        hideSelectors.forEach((sel) => {
          document.querySelectorAll(sel).forEach((el) => {
            const htmlEl = el as HTMLElement;
            hidden.push({ el: htmlEl, visibility: htmlEl.style.visibility });
            htmlEl.style.visibility = "hidden";
          });
        });
      }

      const plotNode = root.querySelector(
        ".js-plotly-plot"
      ) as HTMLElement | null;

      let imgData: string | null = null;

      try {
        const anyWindow = window as any;
        if (plotNode && anyWindow?.Plotly?.toImage) {
          imgData = await anyWindow.Plotly.toImage(plotNode, {
            format: "png",
            width: 1400,
            height: 950,
          });
        }
      } catch (err) {
        console.warn("Plotly.toImage falló, usando html2canvas:", err);
      }

      if (!imgData) {
        root.scrollIntoView({ block: "center" });
        const canvas = await html2canvas(root, { scale: 2, useCORS: true });
        imgData = canvas.toDataURL("image/png");
      }

      hidden.forEach(({ el, visibility }) => {
        el.style.visibility = visibility;
      });

      const pdf = new jsPDF("p", "pt", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // Fondo suave verde claro en toda la pgina
      pdf.setFillColor(210, 230, 210);
      pdf.rect(0, 0, pageW, pageH, "F");

      // T?tulo en dos l?neas centrado
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(30);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Informe de Modelo", pageW / 2, 70, { align: "center" });
      pdf.text('"Patrones ambientales"', pageW / 2, 110, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      // Fecha actual centrada D?a/Mes/A?o (ms separada del ttulo)
      const today = new Date();
      const fechaStr = `${String(today.getDate()).padStart(2, "0")}/${String(
        today.getMonth() + 1
      ).padStart(2, "0")}/${today.getFullYear()}`;
      pdf.text(`Fecha del informe: ${fechaStr}`, pageW / 2, 160, {
        align: "center",
      });

      const marginX = 40;
      const imgMarginX = 30;
      const cleanedCaption =
        caption && caption.trim()
          ? caption
              .replace(/\u00a0/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          : "";
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setCharSpace(0);
      const captionLines = cleanedCaption
        ? pdf.splitTextToSize(cleanedCaption, pageW - marginX * 2)
        : [];
      const captionLineHeight = 16;
      const captionBlockHeight =
        captionLines.length > 0 ? captionLines.length * captionLineHeight : 0;
      const captionGap = captionLines.length > 0 ? 12 : 0;

      const topY = 200; // más espacio entre fecha y recuadro
      const bottomMargin = 40;
      const availableH =
        pageH - topY - bottomMargin - captionGap - captionBlockHeight;

      const imgProps = pdf.getImageProperties(imgData);
      const ratio = Math.min(
        (pageW - imgMarginX * 2) / imgProps.width,
        Math.max(120, availableH) / imgProps.height
      ) * 1.05; // ligero zoom para reducir margen
      const drawW = imgProps.width * ratio;
      const drawH = imgProps.height * ratio;
      const x = (pageW - drawW) / 2;
      const y = topY;

      const boxPad = 6;
      pdf.setDrawColor(40, 90, 140);
      pdf.setLineWidth(1);
      pdf.rect(
        x - boxPad,
        y - boxPad,
        drawW + boxPad * 2,
        drawH + boxPad * 2
      );
      pdf.addImage(imgData, "PNG", x, y, drawW, drawH);

      if (captionLines.length > 0) {
        const startY = y + drawH + captionGap + 18; // separa texto del recuadro
        // Subtítulo
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        const subtitle = "Descripción del gráfico";
        pdf.text(subtitle, marginX, startY);
        const subWidth = pdf.getTextWidth(subtitle);
        const underlineY = startY + 2;
        pdf.setLineWidth(0.6);
        pdf.line(marginX, underlineY, marginX + subWidth, underlineY);
        // Texto del párrafo
        const textStartY = startY + 24; // más espacio entre subtítulo y texto
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setCharSpace(0);
        pdf.text(captionLines, marginX, textStartY, { lineHeightFactor: 1.35 });
      }

      pdf.save(
        fileName && fileName.trim() !== "" ? fileName : "eco_clustering.pdf"
      );

      // Registrar reporte PDF de clustering (dashboard 2)
      try {
        const tipoReporte = reportTypeId ?? 1;
        const dashboard = dashboardId ?? 2;

        await fetch("/api/reportes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_tipo_reporte: tipoReporte,
            id_dashboard: dashboard,
          }),
        });
      } catch (error) {
        console.error("Error registrando reporte de clustering:", error);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className={btnClassName || "btn btn-sm dashboard-btn-blue"}
      onClick={handleExport}
      disabled={busy}
    >
      {busy ? "Generando PDF..." : "Exportar PDF"}
    </button>
  );
}
