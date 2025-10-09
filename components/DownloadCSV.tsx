"use client";

import React from "react";

interface DownloadButtonProps {
  label: String;
  date?: String;
}

export default function DownloadButton(props: DownloadButtonProps) {
  const { label, date } = props;
  const handleDownload = async () => {
    try {
      const url = date ? `/api/export-csv?date=${date}` : "/api/export-csv";

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Error en la descarga del archivo");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `datos_ambientales${date || ""}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();
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
