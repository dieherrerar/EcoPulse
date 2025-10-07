import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { CompositionDatum } from "../../types/dashboard";

interface PieChartCompProps {
  title: string;
  data: CompositionDatum[];
  nameKey?: keyof CompositionDatum;
  valueKey?: keyof CompositionDatum;
  height?: number | string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PieChartComp(props: PieChartCompProps) {
  const {
    title,
    data,
    nameKey = "name",
    valueKey = "value",
    height = 220,
  } = props;

  const chartData = data.map((d) => ({
    [String(nameKey)]: d[nameKey as keyof CompositionDatum],
    [String(valueKey)]: d[valueKey as keyof CompositionDatum],
  })) as { [key: string]: any }[];

  return (
    <div className="pie-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="pie-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey={String(valueKey)}
              nameKey={String(nameKey)}
              outerRadius={70}
              label
            >
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
