import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { StationDatum } from "../../types/dashboard";

interface BarChartCompProps {
  data: StationDatum[];
  xKey?: keyof StationDatum;
  yKey?: keyof StationDatum;
  height?: number | string;
}

export default function BarChartComp(props: BarChartCompProps) {
  const { data, xKey = "station", yKey = "value", height = 220 } = props;
  return (
    <div className="Bar-card p-2 h-100">
      <div className="Bar-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={String(xKey)} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={String(yKey)} fill="#198754" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
