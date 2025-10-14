import { NextResponse } from "next/server";
import { query } from "../../lib/db";
import scalerParams from "../../data/scaler_minmax.json";
import centroidsScaled from "../../data/centroides_scaled.json";
import {
  MinMaxParams,
  ScaledCentroid,
  minMaxScale,
  minMaxInverse,
  assignClusterScaled,
} from "../../lib/clustering";

type Row = {
  tem_BME280: number | null;
  MP1_0_AtE: number | null;
  fecha_registro: string;
};

const P = scalerParams as MinMaxParams;
const C = centroidsScaled as ScaledCentroid[];
const [F1, F2] = P.feature_order;

const DB_COLS: Record<string, string> = {
  Tem_BME280: "tem_bme280",
  "MP1.0_AtE": `"mp1.0_ate"`,
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Falta el parametro 'date' (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const sql = `
      SELECT
        ${DB_COLS[F1]} AS "Tem_BME280",
        ${DB_COLS[F2]} AS "MP1_0_AtE",
        "fecha_registro"
      FROM datos_dispositivo
      WHERE "fecha_registro"::date = $1
        AND ${DB_COLS[F1]} IS NOT NULL
        AND ${DB_COLS[F2]} IS NOT NULL
      ORDER BY "fecha_registro" ASC;
    `;

    const result = await query(sql, [dateParam]);
    const rows = result.rows || [];

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "No hay datos para la fecha indicada" },
        { status: 404 }
      );
    }

    //construcción de puntos mas asignación de cluster
    const points = rows.map((r) => {
      const x = [Number(r.Tem_BME280), Number(r.MP1_0_AtE)];
      const z = minMaxScale(x, P);
      const cl = assignClusterScaled(z, C);
      return {
        Tem_BME280: x[0],
        MP1_0_AtE: x[1],
        cluster: cl,
        timestamp: r.fecha_registro,
      };
    });

    //centroides en unidades originales (para tooltip/leyenda)
    const centroids = C.map((c) => {
      const inv = minMaxInverse(c.values, P);
      return {
        cluster: c.cluster,
        Tem_BME280: inv[0],
        MP1_0_AtE: inv[1],
      };
    });

    return NextResponse.json(
      { date: dateParam, points, centroids },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
