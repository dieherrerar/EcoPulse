import type { NextRequest } from "next/server";
import { DashboardPayload } from "../../../../types/dashboard";
import { query } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const result = await query(
      "SELECT * FROM datos_dispositivo ORDER BY fecha_registro ASC"
    );

    const rows = result.rows;

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No Data Found" }), {
        status: 404,
      });
    }


    // Helper to round to 2 decimals
    const round2 = (n: number) => Math.round(n * 100) / 100;

    const avgPM25 = round2(
      rows.reduce((acc, row) => acc + parseFloat(row["mp25_stp"] || "0"), 0) /
      rows.length
    );
    const avgTemp = round2(
      rows.reduce((acc, row) => acc + parseFloat(row["tem_bme280"] || "0"), 0) /
      rows.length
    );
    const maxCO2 = round2(
      Math.max(...rows.map((row) => parseFloat(row["co2_mhz19"] || "0")))
    );
    const pm10 = round2(
      rows.reduce((acc, row) => acc + parseFloat(row["mp10_stp"] || "0"), 0) /
      rows.length
    );
    const totalConsumo = round2(
      rows.reduce(
        (acc, row) =>
          acc +
          parseFloat(row["consumo_1"] || "0") +
          parseFloat(row["consumo_2"] || "0") +
          parseFloat(row["consumo_3"] || "0"),
        0
      )
    );

    const kpis = { avgPM25, avgTemp, maxCO2, totalConsumo };

    const timeseries = rows.map((row) => ({
      date: row.fecha_registro,
      pm25: round2(parseFloat(row["mp2.5_stp"] || "0")),
      temp: round2(parseFloat(row["tem_bme280"] || "0")),
      co2: round2(parseFloat(row["co2_mhz19"] || "0")),
    }));

    const composition = [
      { name: "PM2.5", value: avgPM25 },
      { name: "PM10", value: pm10 },
      { name: "CO2", value: maxCO2 },
    ];

    const stacked = timeseries.map((d) => ({
      date: d.date,
      co2: d.co2,
      consumo: round2(totalConsumo / timeseries.length),
    }));

    const payload: DashboardPayload = {
      kpis,
      timeseries,
      composition,
      stacked,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
