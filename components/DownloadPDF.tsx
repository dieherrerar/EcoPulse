"use client";
import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Props {
  targetId: string;
  fileName?: string;
  hideSelectors?: string[];
}

interface PropsWithClass extends Props {
  btnClassName?: string;
}

export default function DownloadPDF({
  targetId,
  fileName,
  btnClassName = "btn btn-primary",
  hideSelectors = [],
}: PropsWithClass) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const hiddenEls: { el: Element; prevDisplay: string | null }[] = [];
    try {
      hideSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          // guardar display anterior y ocultar
          const prev = (el as HTMLElement).style.display || null;
          hiddenEls.push({ el, prevDisplay: prev });
          (el as HTMLElement).style.display = "none";
        });
      });

      const el = document.getElementsByClassName(targetId)[0] as
        | HTMLElement
        | undefined;
      if (!el) throw new Error(`Elemento ${targetId} no encontrado`);

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // 2) Preparar PDF A4 (mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);

      pdf.save(`${fileName}.pdf`);
    } catch (err: any) {
      console.error("DownloadPDFMulti error:", err);
      alert("Error generando PDF: " + (err?.message ?? String(err)));
    } finally {
      hiddenEls.forEach(({ el, prevDisplay }) => {
        (el as HTMLElement).style.display = prevDisplay ?? "";
      });
      setLoading(false);
    }
  };

  return (
    <button
      className={btnClassName}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? "Generando PDF..." : "Exportar a PDF"}
    </button>
  );
}
