import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type AnyRecord = Record<string, any>;

interface PM25WeekdayBarChartProps<T extends AnyRecord = AnyRecord> {
  data: T[];
  xKey?: keyof T; // defaults to 'timestamp_registro'
  yKey?: keyof T; // defaults to 'mp2.5_ate'
  height?: number | string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  treatZeroAsMissing?: boolean;
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun (JS getDay: 0=Sun)
const WEEK_LABEL_ES: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

export default function PM25WeekdayBarChart<T extends AnyRecord = AnyRecord>(
  props: PM25WeekdayBarChartProps<T>
) {
  const {
    data,
    xKey = "timestamp_registro" as keyof T,
    yKey = "mp2.5_ate" as keyof T,
    height = 260,
    title = "PM2.5 promedio por día de semana",
    xLabel = "Día de semana",
    yLabel = "PM2.5 (µg/m³)",
    treatZeroAsMissing = true,
  } = props;

  const xDataKey = String(xKey);
  const yDataKey = String(yKey);

  const grouped = useMemo(() => {
    const acc = new Map<number, { sum: number; count: number }>();
    for (const it of Array.isArray(data) ? (data as AnyRecord[]) : []) {
      const rawX = it[xDataKey];
      const t = typeof rawX === "number" ? (rawX > 1e12 ? rawX : rawX * 1000) : Date.parse(String(rawX));
      if (!Number.isFinite(t)) continue;
      const d = new Date(t);
      const dow = d.getDay(); // 0..6

      const rawY = it[yDataKey];
      const y = typeof rawY === "string" ? parseFloat(rawY) : (rawY as number);
      if (!Number.isFinite(y) || y === -999) continue;
      if (treatZeroAsMissing && y === 0) continue;

      const g = acc.get(dow) ?? { sum: 0, count: 0 };
      g.sum += y;
      g.count += 1;
      acc.set(dow, g);
    }

    // Build ordered dataset Mon..Sun
    return WEEK_ORDER.map((dow) => {
      const g = acc.get(dow);
      const avg = g && g.count > 0 ? g.sum / g.count : 0;
      return { dia: WEEK_LABEL_ES[dow], avg };
    });
  }, [data, xDataKey, yDataKey, treatZeroAsMissing]);

  return (
    <div className="Line-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="Line-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={grouped} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} label={{ value: xLabel, position: "insideBottom", offset: -10 }} />
            <YAxis
              allowDecimals={false}
              tickFormatter={(v: any) => {
                const num = typeof v === 'number' ? v : parseFloat(v);
                return Number.isFinite(num) ? Math.round(num).toString() : String(v);
              }}
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: any) => {
                const num = typeof value === 'number' ? value : parseFloat(value);
                return Number.isFinite(num) ? num.toFixed(1) : value;
              }}
            />
            <Bar dataKey="avg" fill="#0d6efd" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

