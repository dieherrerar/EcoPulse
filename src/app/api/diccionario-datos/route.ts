import { query } from "../../../app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await query("SELECT * FROM diccionario_datos;");

    const datos = result.rows.map((row) => ({
      variable: row.variable,
      descripcion: row.descripcion,
      rango: row.rango_observado,
    }));

    return NextResponse.json({ success: true, datos });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage });
  }
}
