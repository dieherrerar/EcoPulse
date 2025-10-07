import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { StackedDatum } from "../../types/dashboard";

interface AreaDef {
  key: keyof StackedDatum;
  name?: string;
}

interface AreaChartCompProps {
  title?: string;
  data: StackedDatum[];
  areas?: AreaDef[];
  xKey: keyof StackedDatum;
  height?: number | string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function AreaChartComp(props: AreaChartCompProps) {
  const {
    title,
    data,
    xKey = "date",
    areas = [
      { key: "co2", name: "CO2" },
      { key: "nh3", name: "NH3" },
    ],
    height = 220,
  } = props;
  return (
    <div className="area-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="area-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={String(xKey)} />
            <YAxis />
            <Tooltip />
            <Legend />
            {areas.map((a, i) => (
              <Area
                key={String(a.key)}
                type="monotone"
                dataKey={String(a.key)}
                stackId="1"
                name={a.name || String(a.key)}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
