// Tipos base (ajusta a los tuyos)
export type Level = "info" | "warning" | "critical";
export interface Measurement {
  sensor_id: string;
  variable: string;      // "temperatura" | "lluvia" | "pm25" | "pm10" | "co2" | "viento" | "viento_sostenido" | "granizo" | ...
  value: number;         // valor de la medición
  ts: Date;              // timestamp de la medición
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>; // flags adicionales (ej. "bad_read": true, "hail": true)
}

export interface AlertCandidate {
  catalog_id: number;         // id_alerta (1..14)
  nombre_alerta: string;      // del catálogo
  level: Level;
  message: string;
  threshold?: number;
  open_modal?: boolean;       // si el frontend debe abrir modal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
}

// Parámetros afinables (edítalos según tu realidad/sensores)
export const TH = {
  temp: { warnLow: 0, warnHighLo: 33, warnHighHi: 36, critHigh: 37, critLow: -5, rangeLowMin: -4 }, // -4..0 y 33..36
  rain: { critDailyMM: 80 },
  pm:   { preEmerg: 1, emerg: 2 },   // PLACEHOLDER: usa tu índice/umbral local (p.ej., 24h µg/m3 categorizado externamente)
  co2:  { deltaPPM: 150, zScore: 3 },// delta o z-score sobre ventana (elige uno)
  wind: { galeGust: 20, hurricaneSustainedKmh: 119 }, // 119 km/h ≈ huracán Saffir–Simpson Cat 1
  hotWave: { days: 3, minTemp: 33 }, // Olas de calor = ≥ minTemp por N días (ajusta)
};

type RuleFn = (m: Measurement, ctx: {
  // helpers para reglas con ventana (inyecta desde tu pipeline/DB):
  getDailyAccum?: (sensor_id: string, variable: string, dateISO: string) => Promise<number>;
  getStats?: (variable: string, mins: number) => Promise<{ mean: number; sd: number }>;
  getConsecutiveDaysAbove?: (sensor_id: string, variable: string, minTemp: number) => Promise<number>;
  getRecentErrorCount?: (sensor_idPrefix?: string, mins?: number) => Promise<number>;
}) => Promise<AlertCandidate | null>;

// Mapa de reglas por id_alerta (1..14) según tu pantalla
export const RULES: Record<number, { nombre: string; run: RuleFn }> = {
  1: {
    nombre: "error de lectura (Sensor)",
    run: async (m) => {
      const bad = m.meta?.bad_read || Number.isNaN(m.value);
      if (!bad) return null;
      return {
        catalog_id: 1, nombre_alerta: "error de lectura (Sensor)",
        level: "info", message: `Lectura inválida en ${m.sensor_id}/${m.variable}`,
        meta: { reason: "bad_read" },
      };
    },
  },
  2: {
    nombre: "Cuando haya un valor anormal",
    run: async (m, { getStats }) => {
      if (!getStats) return null;
      const { mean, sd } = await getStats(m.variable, 60); // 60 min
      const z = sd > 0 ? (m.value - mean) / sd : 0;
      if (Math.abs(z) >= TH.co2.zScore) {
        return {
          catalog_id: 2, nombre_alerta: "Valor anormal",
          level: "warning",
          message: `Valor anómalo (${m.variable}) z≈${z.toFixed(2)} vs μ=${mean.toFixed(1)}`,
          meta: { z, mean, sd },
        };
      }
      return null;
    },
  },
  3: {
    nombre: "Errores de lectura en múltiples sensores",
    run: async (_m, { getRecentErrorCount }) => {
      const n = (await getRecentErrorCount?.("*", 10)) ?? 0; // 10 min
      if (n >= 3) {
        return {
          catalog_id: 3, nombre_alerta: "Errores de lectura en múltiples sensores",
          level: "warning",
          message: `Se detectaron ${n} errores de lectura en 10 minutos (múltiples sensores)`,
        };
      }
      return null;
    },
  },
  4: {
    nombre: "Frío de entre 0° y -4°",
    run: async (m) => {
      if (m.variable !== "temperatura") return null;
      if (m.value <= 0 && m.value >= TH.temp.rangeLowMin) {
        return {
          catalog_id: 4, nombre_alerta: "Frío de entre 0° y -4°",
          level: "warning", message: `Temperatura entre 0° y ${TH.temp.rangeLowMin}°C`, threshold: 0,
        };
      }
      return null;
    },
  },
  5: {
    nombre: "Calor entre 33° y 36°",
    run: async (m) => {
      if (m.variable !== "temperatura") return null;
      if (m.value >= TH.temp.warnHighLo && m.value < TH.temp.warnHighHi) {
        return {
          catalog_id: 5, nombre_alerta: "Calor entre 33° y 36°",
          level: "warning", message: `Temperatura ${m.value.toFixed(1)}°C (33–36)`, threshold: TH.temp.warnHighLo,
          open_modal: false,
        };
      }
      return null;
    },
  },
  6: {
    nombre: "Concentración de material particulado (Pre-Emergencia)",
    run: async (m) => {
      if (!["pm25", "pm10"].includes(m.variable)) return null;
      // Placeholder: usa tu índice/umbral local (ej: norma local 24h)
      if (m.value >= TH.pm.preEmerg) {
        return {
          catalog_id: 6, nombre_alerta: "Pre-Emergencia material particulado",
          level: "warning", message: `${m.variable.toUpperCase()} en pre-emergencia (${m.value})`,
          open_modal: true,
        };
      }
      return null;
    },
  },
  7: {
    nombre: "Aumento sobre el promedio del CO2 en el ambiente",
    run: async (m, { getStats }) => {
      if (m.variable !== "co2" || !getStats) return null;
      const { mean } = await getStats("co2", 60);
      if (m.value - mean >= TH.co2.deltaPPM) {
        return {
          catalog_id: 7, nombre_alerta: "Aumento sobre el promedio de CO2",
          level: "warning", message: `CO₂ +${(m.value - mean).toFixed(0)} ppm sobre μ(${mean.toFixed(0)})`,
        };
      }
      return null;
    },
  },
  8: {
    nombre: "Calores desde 37°",
    run: async (m) => {
      if (m.variable !== "temperatura") return null;
      if (m.value >= TH.temp.critHigh) {
        return {
          catalog_id: 8, nombre_alerta: "Calores desde 37°",
          level: "critical", message: `Temperatura crítica ${m.value.toFixed(1)}°C (≥${TH.temp.critHigh})`,
          threshold: TH.temp.critHigh, open_modal: true,
        };
      }
      return null;
    },
  },
  9: {
    nombre: "Fríos desde los -5°",
    run: async (m) => {
      if (m.variable !== "temperatura") return null;
      if (m.value <= TH.temp.critLow) {
        return {
          catalog_id: 9, nombre_alerta: "Fríos desde -5°",
          level: "critical", message: `Temperatura crítica ${m.value.toFixed(1)}°C (≤${TH.temp.critLow})`,
          threshold: TH.temp.critLow, open_modal: true,
        };
      }
      return null;
    },
  },
  10: {
    nombre: "Lluvias sobre 80ml en la superficie",
    run: async (m, { getDailyAccum }) => {
      if (m.variable !== "lluvia" || !getDailyAccum) return null;
      const acc = await getDailyAccum(m.sensor_id, "lluvia", m.ts.toISOString().slice(0, 10));
      if (acc >= TH.rain.critDailyMM) {
        return {
          catalog_id: 10, nombre_alerta: "Lluvias sobre 80mm en la superficie",
          level: "critical", message: `Acumulado diario ${acc} mm (≥${TH.rain.critDailyMM})`,
          threshold: TH.rain.critDailyMM, open_modal: true,
        };
      }
      return null;
    },
  },
  11: {
    nombre: "Ventiscas y/o Granizos",
    run: async (m) => {
      const hail = !!m.meta?.hail;
      const gust = m.variable === "viento" && m.value >= TH.wind.galeGust;
      if (hail || gust) {
        return {
          catalog_id: 11, nombre_alerta: "Ventiscas y/o Granizos",
          level: "critical", message: hail ? "Granizo detectado" : `Ráfagas fuertes (≥${TH.wind.galeGust} m/s)`,
          open_modal: true,
        };
      }
      return null;
    },
  },
  12: {
    nombre: "Olas de calor (Días)",
    run: async (m, { getConsecutiveDaysAbove }) => {
      if (m.variable !== "temperatura" || !getConsecutiveDaysAbove) return null;
      const days = await getConsecutiveDaysAbove(m.sensor_id, "temperatura", TH.hotWave.minTemp);
      if (days >= TH.hotWave.days) {
        return {
          catalog_id: 12, nombre_alerta: "Olas de calor",
          level: "critical", message: `≥${TH.hotWave.days} días con T ≥ ${TH.hotWave.minTemp}°C`,
          open_modal: true,
        };
      }
      return null;
    },
  },
  13: {
    nombre: "Emergencias provocada por Material particulado",
    run: async (m) => {
      if (!["pm25", "pm10"].includes(m.variable)) return null;
      if (m.value >= TH.pm.emerg) {
        return {
          catalog_id: 13, nombre_alerta: "Emergencia material particulado",
          level: "critical", message: `${m.variable.toUpperCase()} en EMERGENCIA (${m.value})`,
          open_modal: true,
        };
      }
      return null;
    },
  },
  14: {
    nombre: "Alerta de Huracán",
    run: async (m) => {
      // Requiere viento sostenido (no ráfaga): usa "viento_sostenido" en km/h
      if (m.variable !== "viento_sostenido") return null;
      if (m.value >= TH.wind.hurricaneSustainedKmh) {
        return {
          catalog_id: 14, nombre_alerta: "Alerta de Huracán",
          level: "critical", message: `Viento sostenido ${m.value} km/h (≥${TH.wind.hurricaneSustainedKmh})`,
          open_modal: true,
        };
      }
      return null;
    },
  },
};

// Evaluador único: corre todas las reglas relevantes según variable/ctx
export async function evaluateMeasurement(
  m: Measurement,
  ctx: Parameters<RuleFn>[1]
): Promise<AlertCandidate[]> {
  const out: AlertCandidate[] = [];
  for (const id of Object.keys(RULES)) {
    const n = Number(id);
    const hit = await RULES[n].run(m, ctx);
    if (hit) out.push(hit);
  }
  return out;
}
