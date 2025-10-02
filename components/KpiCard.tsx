import React from "react";

interface KpiCardProps {
  title: String;
  value: String | number;
  subtitle?: String;
}

export default function KpiCard(props: KpiCardProps) {
  const { title, value, subtitle } = props;
  return (
    <div className="Kpicard p-3 h-100">
      <div className="small text-muted">{title}</div>
      <div className="h3 fw-bold">{value}</div>
      {subtitle && <div className="small text-muted">{subtitle}</div>}
    </div>
  );
}
