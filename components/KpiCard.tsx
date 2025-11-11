import React from "react";

interface KpiCardProps {
  title: String;
  value: String | number;
  subtitle?: String;
  inlineUnit?: String; // muestra la unidad junto al valor
}

export default function KpiCard(props: KpiCardProps) {
  const { title, value, subtitle, inlineUnit } = props;
  // Maneja -999/NaN/null/vacío como sin datos; si numérico válido, 2 decimales
  let displayValue: string | number = value as any;
  const rawNum = typeof value === "string" ? parseFloat(value) : (value as number);

  const isNoData =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    rawNum === -999 ||
    Number.isNaN(rawNum as number);

  if (isNoData) {
    displayValue = "N/A";
  } else if (typeof rawNum === "number" && !Number.isNaN(rawNum)) {
    displayValue = rawNum.toFixed(2);
  }

  const unit = inlineUnit ?? subtitle;

  return (
    <div className="Kpicard p-3 h-100">
      <div className="small text-muted">{title}</div>
      <div className="h3 fw-bold">
        {displayValue}
        {unit && !isNoData ? ` ${unit}` : ""}
      </div>
    </div>
  );
}

