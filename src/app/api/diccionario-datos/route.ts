import { query } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Consulta explícita a la tabla y columnas indicadas
    const result = await query(
      "SELECT variable, descripcion, rango_observado FROM diccionario_datos;"
    );

    const datos = result.rows.map((row: any) => ({
      variable: row.variable,
      descripcion: row.descripcion,
      rango_observado: row.rango_observado,
    }));

    return NextResponse.json({ success: true, datos });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage });
  }
}
