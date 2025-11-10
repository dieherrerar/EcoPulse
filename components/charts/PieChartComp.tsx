import React, { useMemo } from "react";
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

  const nameKeyStr = String(nameKey);
  const valueKeyStr = String(valueKey);

  // Filtra -999/NaN, valores 0 y nombres vacios
  const chartData = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr
      .filter((d: any) => {
        const name = d?.[nameKeyStr];
        const raw = d?.[valueKeyStr];
        const num = typeof raw === "string" ? parseFloat(raw) : Number(raw);
        if (name === undefined || name === null || name === "") return false;
        if (num === -999 || Number.isNaN(num) || num === 0) return false;
        return true;
      })
      .map((d: any) => {
        const raw = d?.[valueKeyStr];
        const val = typeof raw === "string" ? parseFloat(raw) : Number(raw);
        return {
          [nameKeyStr]: d?.[nameKeyStr],
          [valueKeyStr]: val,
        } as { [key: string]: any };
      });
  }, [data, nameKeyStr, valueKeyStr]);

  // Suma total para calcular % en el tooltip
  const total = useMemo(() => {
    return chartData.reduce((sum: number, d: any) => {
      const v = typeof d?.[valueKeyStr] === "number" ? d[valueKeyStr] : Number(d?.[valueKeyStr]);
      return sum + (Number.isFinite(v) ? Number(v) : 0);
    }, 0);
  }, [chartData, valueKeyStr]);

  return (
    <div className="pie-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="pie-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey={valueKeyStr}
              nameKey={nameKeyStr}
              outerRadius={70}
              label={(props: any) => {
                const pct = typeof props?.percent === "number" ? props.percent * 100 : 0;
                const name = props?.name ?? "";
                return `${name} ${pct.toFixed(1)}%`;
              }}
              labelLine={false}
            >
              {chartData.map((_: any, idx: number) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => {
                const v = typeof value === "string" ? parseFloat(value) : Number(value);
                const pct = total > 0 ? (v / total) * 100 : 0;
                return [`${pct.toFixed(1)}%`, name];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}