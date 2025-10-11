import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import scalerParams from "@/app/data/scaler_minmax.json";
import centroidsScaled from "@/app/data/centroides_scaled.json";
import {
  MinMaxParams,
  ScaledCentroid,
  minMaxScale,
  minMaxInverse,
  assignClusterScaled,
} from "@/app/lib/clustering";

type Row = {
  tem_BME280: number | null;
  MP1_0_AtE: number | null;
  fecha_registro: string;
};

const P = scalerParams as MinMaxParams;
const C = centroidsScaled as ScaledCentroid[];
const [F1, F2] = P.feature_order;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");

  let result;
  if (!dateParam) {
    return NextResponse.json(
      { error: "Falta el parametro 'date' (YYYY-MM-DD)" },
      { status: 400 }
    );
  } else {
    result = await query(
      `SELECT
        "${F1}" AS "Tem_BME280",
        "${F2}" AS "MP1_0_AtE",
        "fecha_registro"
      FROM datos_dispositivo
      WHERE "fecha_registro"::date = $1
        AND "${F1}" IS NOT NULL
        AND "${F2}" IS NOT NULL
      ORDER BY "fecha_registro" ASC;
    `,
      [dateParam]
    );
  }

  const rows = result.rows || [];

  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { error: "No hay datos para la fecha indicada" },
      { status: 404 }
    );
  }
}
