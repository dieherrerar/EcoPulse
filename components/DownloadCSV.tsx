"use client";

import React from "react";

interface DownloadButtonProps {
  label: string;
  date?: string; // compat
  start?: string;
  end?: string;
  reportTypeId?: number;
  dashboardId?: number;
  reportTitle?: string;
}

export default function DownloadButton(props: DownloadButtonProps) {
  const { label, date, start, end, reportTypeId, dashboardId, reportTitle } = props;
  const handleDownload = async () => {
    try {
      let url = "/api/export-csv";
      if (start && end) {
        const params = new URLSearchParams({ start: String(start), end: String(end) });
        url = `/api/export-csv?${params.toString()}`;
      } else if (date) {
        url = `/api/export-csv?date=${date}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Error en la descarga del archivo");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      const suffix =
        start && end ? `_${start}_a_${end}` : date ? `_${date}` : "";
      const downloadName = `datos_ambientales${suffix}.csv`;
      a.download = downloadName;

      document.body.appendChild(a);
      a.click();
      a.remove();

      // Registrar reporte CSV generado
      try {
        const payload: {
          id_tipo_reporte: number;
          id_dashboard?: number;
          titulo_reporte: string;
        } = {
          id_tipo_reporte: reportTypeId ?? 2,
          titulo_reporte:
            reportTitle && reportTitle.trim() !== ""
              ? reportTitle
              : downloadName,
        };
        if (typeof dashboardId === "number") {
          payload.id_dashboard = dashboardId;
        }

        await fetch("/api/reportes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (logError) {
        console.error("Error registrando reporte CSV:", logError);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button className="dashboard-btn" onClick={handleDownload}>
      {label}
    </button>
  );
}
