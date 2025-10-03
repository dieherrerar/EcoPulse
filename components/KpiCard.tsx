import React from "react";

interface KpiCardProps {
  title: String;
  value: String | number;
  subtitle?: String;
}

export default function KpiCard(props: KpiCardProps) {
  const { title, value, subtitle } = props;
  // Truncate value to 2 decimals if it's a number
  const displayValue =
    typeof value === "number"
      ? value.toFixed(2)
      : value;
  return (
    <div className="Kpicard p-3 h-100">
      <div className="small text-muted">{title}</div>
      <div className="h3 fw-bold">{displayValue}</div>
      {subtitle && <div className="small text-muted">{subtitle}</div>}
    </div>
  );
}
