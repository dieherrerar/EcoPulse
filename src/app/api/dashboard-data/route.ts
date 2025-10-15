import type { NextRequest } from "next/server";
import { DashboardPayload } from "../../../../types/dashboard";
import { query } from "../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "2025-10-01";
    const result = await query(
      "SELECT * FROM datos_dispositivo WHERE fecha_registro::date = $1 ORDER BY fecha_registro ASC",
      [date]
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
      rows.reduce((acc, row) => acc + parseFloat(row["mp2.5_ate"] || "0"), 0) /
        rows.length
    );
    const avgPM10 = round2(
      rows.reduce((acc, row) => acc + parseFloat(row["mp10_ate"] || "0"), 0) /
        rows.length
    );
    const avgTemp = round2(
      rows.reduce((acc, row) => acc + parseFloat(row["tem_bme280"] || "0"), 0) /
        rows.length
    );
    const maxCO2 = round2(
      Math.max(...rows.map((row) => parseFloat(row["co2_mhz19"] || "0")))
    );

    const aguaCaida = round2(
      rows.reduce((acc, row) => acc + parseFloat(row["agua_caida"] || "0"), 0)
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

    const kpis = { avgPM25, avgPM10, avgTemp, maxCO2, aguaCaida };

    const timeseries = rows.map((row) => ({
      date: row.fecha_registro,
      pm25: round2(parseFloat(row["mp2.5_stp"] || "0")),
      temp: round2(parseFloat(row["tem_bme280"] || "0")),
      co2: round2(parseFloat(row["co2_mhz19"] || "0")),
    }));

    const totalMP = rows.reduce(
      (acc, row) =>
        acc +
        parseFloat(row["mp1.0_ate"] || "0") +
        parseFloat(row["mp2.5_ate"] || "0") +
        parseFloat(row["mp10_ate"] || "0"),
      0
    );

    const composition = [
      {
        name: "mp1.0_ate",
        value: round2(
          (rows.reduce(
            (acc, row) => acc + parseFloat(row["mp1.0_ate"] || "0"),
            0
          ) /
            totalMP) *
            100
        ),
      },
      {
        name: "mp2.5_ate",
        value: round2(
          (rows.reduce(
            (acc, row) => acc + parseFloat(row["mp2.5_ate"] || "0"),
            0
          ) /
            totalMP) *
            100
        ),
      },
      {
        name: "mp10_ate",
        value: round2(
          (rows.reduce(
            (acc, row) => acc + parseFloat(row["mp10_ate"] || "0"),
            0
          ) /
            totalMP) *
            100
        ),
      },
    ];

    const tempBins = await query(
      `SELECT
          FLOOR(("tem_bme280")::numeric) AS temp_bin,
          AVG(("co2_mhz19")::numeric)    AS avg_co2,
          COUNT(*)                       AS n
        FROM datos_dispositivo
        WHERE fecha_registro::date = $1
          AND ("tem_bme280") IS NOT NULL
          AND ("co2_mhz19") IS NOT NULL
        GROUP BY 1
        ORDER BY 1`,
      [date]
    );

    const tempRows = tempBins.rows;

    const tempCo2Trend = tempRows.map((t: any) => ({
      tempBin: Number(t.temp_bin),
      co2: round2(parseFloat(t.avg_co2 || "0")),
      count: Number(t.n),
    }));

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
      tempCo2Trend,
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
