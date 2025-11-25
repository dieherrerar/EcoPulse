"use client";

import React, { useState } from "react";
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
            width: 1000,
            height: 700,
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

      const imgProps = pdf.getImageProperties(imgData);
      const ratio = Math.min(pageW / imgProps.width, pageH / imgProps.height);
      const drawW = imgProps.width * ratio;
      const drawH = imgProps.height * ratio;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      pdf.addImage(imgData, "PNG", x, y, drawW, drawH);
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

