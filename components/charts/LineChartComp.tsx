import React, { useMemo } from "react";
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
  omitZeroY?: boolean;
  compactX?: boolean;
  xTickFormatter?: (value: any) => string;
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
    omitZeroY = false,
    compactX = false,
    xTickFormatter,
  } = props;

  const xDataKey = String(xKey);
  const yDataKey = String(yKey);

  // Filtra valores inválidos y -999; ordena si el eje X es numérico
  const filteredData = useMemo(() => {
    const arr = Array.isArray(data) ? (data as any[]) : [];

    const clean = arr.filter((item) => {
      const yRaw = item?.[yDataKey];
      const yNum = typeof yRaw === "string" ? parseFloat(yRaw) : yRaw;
      if (yNum === -999 || Number.isNaN(yNum)) return false;
      if (omitZeroY && Number(yNum) === 0) return false;

      const xRaw = item?.[xDataKey];
      if (xType === "number") {
        const xNum = typeof xRaw === "string" ? parseFloat(xRaw) : xRaw;
        if (xNum === -999 || Number.isNaN(xNum)) return false;
      } else {
        if (xRaw === undefined || xRaw === null || xRaw === "") return false;
        if (xRaw === -999 || xRaw === "-999") return false;
      }
      return true;
    });

    if (xType === "number") {
      return clean.sort((a, b) => {
        const ax = Number(a?.[xDataKey]);
        const bx = Number(b?.[xDataKey]);
        return ax - bx;
      });
    }
    return clean;
  }, [data, xDataKey, yDataKey, xType, omitZeroY]);

  // Calcula ticks uniformes (máximo 10) para el eje X (fechas/categorías)
  const xTicks = useMemo(() => {
    const n = filteredData.length;
    const labelKey = compactX ? "__xLabel" : xDataKey;

    if (n === 0) return [] as any[];

    // Si hay 10 o menos, usa todos los valores únicos
    if (n <= 10) {
      const set = new Set<any>();
      const ticks: any[] = [];
      for (const it of filteredData) {
        const v = String(it?.[xDataKey]);
        if (!set.has(v)) {
          set.add(v);
          // Si compactX, el dato real en el chart será __xLabel = String(original)
          ticks.push(compactX ? String(v) : (xType === "number" ? Number(it?.[xDataKey]) : v));
        }
      }
      return ticks;
    }

    // Más de 10: elige 10 índices uniformemente distribuidos (incluye extremos)
    const indices: number[] = [];
    for (let i = 0; i < 10; i++) {
      const idx = Math.round((i * (n - 1)) / 9);
      if (indices.length === 0 || indices[indices.length - 1] !== idx) {
        indices.push(idx);
      }
    }

    return indices.map((i) => {
      const raw = filteredData[i]?.[xDataKey];
      if (xType === "number") return Number(raw);
      return compactX ? String(raw) : raw;
    });
  }, [filteredData, xDataKey, xType, compactX]);

  // Calcula dominio Y con margen para evitar valores en el borde
  const yDomain = useMemo(() => {
    if (!filteredData.length) return [0, 1] as [number, number];
    const ys = filteredData
      .map((it: any) => {
        const v = it?.[yDataKey];
        return typeof v === "string" ? parseFloat(v) : (v as number);
      })
      .filter((v) => Number.isFinite(v));

    if (!ys.length) return [0, 1] as [number, number];

    let min = Math.min(...ys);
    let max = Math.max(...ys);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1] as [number, number];

    const range = max - min;
    const pad = range === 0 ? Math.max(Math.abs(max) * 0.1, 1) : range * 0.05; // 5% margen o 10% si rango = 0
    return [min - pad, max + pad] as [number, number];
  }, [filteredData, yDataKey]);

  return (
    <div className="Line-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="Line-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={compactX ? filteredData.map((it: any) => ({ ...it, __xLabel: String(it?.[xDataKey]) })) : filteredData}
            margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type={compactX ? "category" : xType}
              dataKey={compactX ? "__xLabel" : String(xKey)}
              domain={(compactX ? "category" : xType) === "number" ? ["auto", "auto"] : undefined}
              tick={{ fontSize: 12 }}
              tickFormatter={xTickFormatter}
              // 10 ticks uniformes en eje X (si es numérico, se intenta con tickCount)
              tickCount={(compactX ? "category" : xType) === "number" ? 10 : undefined}
              ticks={(compactX ? "category" : xType) === "number" ? undefined : (xTicks as any)}
              label={{
                value: xLabel,
                angle: 0,
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis
              allowDecimals
              tickFormatter={(v: any) => {
                const num = typeof v === "number" ? v : parseFloat(v);
                return Number.isFinite(num) ? num.toFixed(1) : v;
              }}
              domain={yDomain as [number, number]}
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: any, name) => {
                const num = typeof value === "number" ? value : parseFloat(value);
                const formatted = Number.isFinite(num) ? num.toFixed(1) : value;
                const label = name === yDataKey ? yLabel ?? yDataKey : String(name);
                return [formatted, label];
              }}
            />
            <Line
              type="monotone"
              dataKey={yDataKey}
              stroke="#0d6efd"
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
