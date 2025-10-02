import type { NextRequest } from "next/server";
import { DashboardPayload } from "../../../../types/dashboard";

export async function GET(req: NextRequest) {
  const kpis = { alertsToday: 7, avgAQI24h: 63 };

  const timeseries = [
    { date: "2025-09-25", aqi: 58, temp: 18 },
    { date: "2025-09-26", aqi: 61, temp: 19 },
    { date: "2025-09-27", aqi: 70, temp: 20 },
    { date: "2025-09-28", aqi: 55, temp: 17 },
    { date: "2025-09-29", aqi: 67, temp: 21 },
    { date: "2025-09-30", aqi: 62, temp: 20 },
    { date: "2025-10-01", aqi: 60, temp: 19 },
  ];

  const stationData = [
    { station: "Estación A", value: 34 },
    { station: "Estación B", value: 45 },
    { station: "Estación C", value: 22 },
  ];

  const composition = [
    { name: "PM2.5", value: 45 },
    { name: "PM10", value: 30 },
    { name: "O3", value: 25 },
  ];

  const stacked = timeseries.map((d) => ({
    date: d.date,
    co2: d.aqi ? d.aqi * 1.1 : 0,
    nh3: d.temp ? d.temp * 2 : 0,
  }));

  const payload: DashboardPayload = {
    kpis,
    timeseries,
    stationData,
    composition,
    stacked,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
