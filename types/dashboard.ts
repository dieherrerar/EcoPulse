// types/dashboard.ts
export interface KPIs {
  alertsToday: number;
  avgAQI24h: number;
}

export interface TimePoint {
  date: string; // ISO date 'YYYY-MM-DD' o ISO datetime
  aqi?: number;
  temp?: number;
}

export interface StationDatum {
  station: string;
  value: number;
}

export interface CompositionDatum {
  name: string;
  value: number;
}

export interface StackedDatum {
  date: string;
  co2?: number;
  nh3?: number;
}

export interface DashboardPayload {
  kpis: KPIs;
  timeseries: TimePoint[];
  stationData: StationDatum[];
  composition: CompositionDatum[];
  stacked: StackedDatum[];
}
