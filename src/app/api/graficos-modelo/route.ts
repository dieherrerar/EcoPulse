import { NextResponse } from "next/server";
import { query } from "../../lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT id_grafico, descripcion_relacion, variables_utilizadas, activo
         FROM detalle_grafico_modelo
         ORDER BY id_grafico ASC;`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e?.message ?? "Error obteniendo detalle_grafico_modelo",
      },
      { status: 500 }
    );
  }
}
