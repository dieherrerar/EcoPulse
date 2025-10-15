import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
  Cell,
} from "recharts";
import { CompositionDatum } from "../../types/dashboard";

interface BarChartCompProps {
  data: CompositionDatum[];
  height?: number | string;
  title?: string;
}

export default function BarChartComp(props: BarChartCompProps) {
  const { data, title, height = 220 } = props;

  const defaultColor = "#0d6efd"; // primary
  const successColor = "#0ca733ff"; // success (Bootstrap)

  // Regla simple: si el nombre incluye "límite" u "OMS", píntalo verde
  const isLimitBar = (label: string) => /límite|OMS/i.test(label ?? "");

  return (
    <div className="Bar-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="Bar-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }}>
              <Label value="Referencia" position="insideBottom" offset={-10} />
            </XAxis>
            <YAxis tick={{ fontSize: 12 }}>
              <Label
                value="MP10_ATE (µg/m³)"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle" }}
              />
            </YAxis>
            <Tooltip formatter={(v: any) => [`${v} µg/m³`, "MP10_ATE"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={isLimitBar(d.name) ? successColor : defaultColor}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
