import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
} from "recharts";

type AnyRecord = Record<string, any>;

export interface PM25TimeSeriesChartProps<T extends AnyRecord = AnyRecord> {
  data: T[];
  xKey?: keyof T; // defaults to 'timestamp_registro'
  yKey?: keyof T; // defaults to 'mp2.5_ate'
  height?: number | string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  tickFormat?: (d: Date) => string;
  // Opciones rápidas
  showDots?: boolean; // false = oculta puntos
  dotSize?: number; // tamaño de punto cuando showDots=true
  // Re-muestreo por intervalo (minutos). 0/undefined = sin agrupar
  resampleMinutes?: number; // p.ej. 30
  // Cuando hay huecos de tiempo sin datos, insertar tramo a 0
  fillGapsToZero?: boolean; // default false
  // Tratar valores 0 como "faltantes" y conectar la línea
  treatZeroAsMissing?: boolean; // default true
  compactX?: boolean;
}

function defaultTickFormat(d: Date): string {
  // dd/MM hh:mm am/pm (hora local)
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const H = d.getHours();
  const mi = String(d.getMinutes()).padStart(2, "0");
  const suffix = H < 12 ? "am" : "pm";
  const h12 = H % 12 === 0 ? 12 : H % 12;
  const hh = String(h12).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi} ${suffix}`;
}

export default function PM25TimeSeriesChart<T extends AnyRecord = AnyRecord>(
  props: PM25TimeSeriesChartProps<T>
) {
  const {
    data,
    xKey = "timestamp_registro" as keyof T,
    yKey = "mp2.5_ate" as keyof T,
    height = 260,
    title = "PM2.5 en el tiempo",
    xLabel = "Fecha/Hora",
    yLabel = "MP 2.5 (µg/m³)",
    tickFormat = defaultTickFormat,
    showDots = false,
    dotSize = 2,
    resampleMinutes = 30,
    fillGapsToZero = false,
    treatZeroAsMissing = true,
    compactX = false,
  } = props;

  const xDataKey = String(xKey);
  const yDataKey = String(yKey);

  const processed = useMemo(() => {
    const arr = Array.isArray(data) ? (data as AnyRecord[]) : [];
    const mapped = arr
      .map((it) => {
        const raw = it[xDataKey];
        let ms: number | null = null;
        if (typeof raw === "number") {
          ms = raw > 1e12 ? raw : raw * 1000;
        } else if (typeof raw === "string") {
          const t = Date.parse(raw);
          ms = Number.isNaN(t) ? null : t;
        }

        const yRaw = it[yDataKey];
        const yVal = typeof yRaw === "string" ? parseFloat(yRaw) : (yRaw as number);
        if (
          ms === null ||
          Number.isNaN(yVal) ||
          yVal === -999 ||
          (treatZeroAsMissing && Number(yVal) === 0)
        )
          return null;
        return { ...it, __xMs: ms, [yDataKey]: yVal } as AnyRecord;
      })
      .filter(Boolean) as AnyRecord[];

    const sorted = mapped.sort((a, b) => (a.__xMs as number) - (b.__xMs as number));

    const intervalMs = typeof resampleMinutes === "number" && resampleMinutes > 0
      ? resampleMinutes * 60 * 1000
      : 0;

    if (!intervalMs) return sorted;

    // Agrupar por bin de tiempo y promediar valores
    const groups = new Map<number, { sum: number; count: number }>();
    for (const item of sorted) {
      const ms = item.__xMs as number;
      const bin = Math.floor(ms / intervalMs) * intervalMs;
      const val = Number(item[yDataKey]);
      const g = groups.get(bin) ?? { sum: 0, count: 0 };
      g.sum += val;
      g.count += 1;
      groups.set(bin, g);
    }

    const resampled: AnyRecord[] = Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bin, g]) => ({ __xMs: bin, [yDataKey]: g.sum / Math.max(1, g.count) }));

    // Rellenar huecos largos con ceros si se pide
    if (!fillGapsToZero || resampled.length <= 1) return resampled;

    const gapMs = intervalMs * 2; // umbral = 2 bins sin datos
    const withZeros: AnyRecord[] = [];
    for (let i = 0; i < resampled.length - 1; i++) {
      const cur = resampled[i];
      const next = resampled[i + 1];
      withZeros.push(cur);
      const dt = (next.__xMs as number) - (cur.__xMs as number);
      if (dt > gapMs) {
        withZeros.push({ __xMs: (cur.__xMs as number) + 1, [yDataKey]: 0 });
        withZeros.push({ __xMs: (next.__xMs as number) - 1, [yDataKey]: 0 });
      }
    }
    withZeros.push(resampled[resampled.length - 1]);
    return withZeros;
  }, [data, xDataKey, yDataKey, resampleMinutes, fillGapsToZero]);

  const categoricalData = useMemo(() => {
    if (!compactX) return processed;
    return processed.map((d: AnyRecord) => ({
      ...d,
      __xLabel: tickFormat(new Date(d.__xMs as number)),
    }));
  }, [processed, compactX, tickFormat]);

  const xTypeInner: 'number' | 'category' = compactX ? 'category' : 'number';
  const xDataKeyInner = compactX ? '__xLabel' : '__xMs';
  const xDomainInner = compactX ? undefined : ["auto", "auto"] as const;
  const xTickFormatterInner = compactX ? undefined : ((v: number) => tickFormat(new Date(v)));

  // Ticks uniformes para eje X (exactamente 10 cuando sea posible)
  const xTicks = useMemo(() => {
    if (compactX) {
      const n = categoricalData.length;
      if (n === 0) return [] as any[];
      if (n <= 10) return categoricalData.map((d) => d.__xLabel);
      const indices: number[] = [];
      for (let i = 0; i < 10; i++) {
        const idx = Math.round((i * (n - 1)) / 9);
        if (indices.length === 0 || indices[indices.length - 1] !== idx) indices.push(idx);
      }
      return indices.map((i) => categoricalData[i]?.__xLabel);
    }
    // Eje numérico: usar rango uniforme en milisegundos
    const n = processed.length;
    if (n === 0) return [] as number[];
    const minMs = processed[0].__xMs as number;
    const maxMs = processed[n - 1].__xMs as number;
    if (!(Number.isFinite(minMs) && Number.isFinite(maxMs)) || minMs === maxMs) {
      return [minMs];
    }
    const ticks: number[] = [];
    for (let i = 0; i < 10; i++) {
      const t = Math.round(minMs + (i * (maxMs - minMs)) / 9);
      if (ticks.length === 0 || ticks[ticks.length - 1] !== t) ticks.push(t);
    }
    return ticks;
  }, [compactX, categoricalData, processed]);

  // Dominio Y con margen para evitar bordes (no anclar a 0)
  const yDomain = useMemo(() => {
    if (!processed.length) return [0, 1] as [number, number];
    const ys = processed
      .map((d) => d[yDataKey] as number)
      .filter((v) => Number.isFinite(v));
    if (!ys.length) return [0, 1] as [number, number];
    let min = Math.min(...ys);
    let max = Math.max(...ys);
    const range = max - min;
    // 10% de margen; si rango=0, 10% del valor o mínimo 1
    const pad = range === 0 ? Math.max(Math.abs(max) * 0.1, 1) : range * 0.1;
    return [min - pad, max + pad] as [number, number];
  }, [processed, yDataKey]);

  return (
    <div className="Line-card p-2 h-100">
      <div className="small text-muted">{title}</div>
      <div className="Line-card-body p-2">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={compactX ? categoricalData : processed}
            margin={{ top: 10, right: 20, bottom: 12, left: 44 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type={xTypeInner}
              dataKey={xDataKeyInner}
              domain={xDomainInner as any}
              tick={{ fontSize: 12 }}
              minTickGap={24}
              tickFormatter={xTickFormatterInner as any}
              interval={0}
              ticks={xTicks as any}
              label={{ value: xLabel, angle: 0, position: "insideBottom", offset: -10 }}
            />
            <YAxis
              domain={yDomain as any}
              allowDecimals={false}
              tickFormatter={(v: any) => {
                const num = typeof v === 'number' ? v : parseFloat(v);
                return Number.isFinite(num) ? Math.round(num).toString() : String(v);
              }}
            >
              <Label value={yLabel} angle={-90} position="insideLeft" dy={16} />
            </YAxis>
            <Tooltip
              labelFormatter={(v: any) => {
                // Soporta tanto eje numérico (ms) como categórico (string)
                if (typeof v === 'number') return tickFormat(new Date(v));
                return String(v);
              }}
              formatter={(value: any, name) => {
                const num = typeof value === 'number' ? value : parseFloat(value);
                const formatted = Number.isFinite(num) ? num.toFixed(1) : value;
                return [formatted, name === yDataKey ? yLabel : String(name)];
              }}
            />
            <Line
              type="linear"
              dataKey={yDataKey}
              stroke="#0d6efd"
              strokeWidth={2}
              dot={showDots ? { r: dotSize } : false}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

