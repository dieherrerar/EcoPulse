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

type XType = "category" | "number";

interface LineChartCompProps<T = any> {
  data: T[];
  xKey?: keyof T;
  yKey?: keyof T;
  height?: number | string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xType?: XType;
}

export default function LineChartComp<T>(props: LineChartCompProps) {
  const {
    data,
    xKey = "date",
    yKey = "pm25",
    height = 220,
    title,
    xLabel,
    yLabel,
    xType = "category",
  } = props;

  const xDataKey = String(xKey);
  const yDataKey = String(yKey);

  return (
    <div className="Line-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="Line-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data as any[]}
            margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type={xType}
              dataKey={String(xKey)}
              domain={xType === "number" ? ["auto", "auto"] : undefined}
              tick={{ fontSize: 12 }}
              label={{
                value: xLabel,
                angle: 0,
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: any, name) => [
                value,
                name === yDataKey ? yLabel ?? yDataKey : String(name),
              ]}
            />
            <Line
              type="monotone"
              dataKey={yDataKey}
              stroke="#0d6efd"
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
