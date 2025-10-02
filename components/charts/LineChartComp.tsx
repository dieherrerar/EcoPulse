import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TimePoint } from "../../types/dashboard";

interface LineChartCompProps {
  data: TimePoint[];
  xKey?: keyof TimePoint;
  yKey?: keyof TimePoint;
  height?: number | string;
}

export default function LineChartComp(props: LineChartCompProps) {
  const { data, xKey = "date", yKey = "aqi", height = 220 } = props;
  return (
    <div className="Line-card p-2 h-100">
      <div className="Line-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={String(xKey)} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={String(yKey)}
              stroke="#0d6efd"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
