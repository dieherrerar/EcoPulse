import { query } from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Lee directamente desde la tabla real del diccionario
    // Tabla: diccionario_dato
    // Columnas: nombre_variable, descripcion_variable, rango_variable
    // Se renombran a los nombres esperados por el frontend
    const result = await query(
      `SELECT
         nombre_variable      AS variable,
         descripcion_variable AS descripcion,
         rango_variable       AS rango_observado
       FROM diccionario_dato;`
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
