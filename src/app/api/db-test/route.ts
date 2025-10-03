import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM datos_dispositivo WHERE fecha_registro = '2025-10-01'"
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage });
  }
}
