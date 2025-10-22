// src/app/api/mostrar_alertas/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ⚠️ Asegúrate que los nombres coincidan EXACTO con tu .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // ← revisa que tu .env tenga DB_PASSWORD (sin typos)
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // si tu Postgres está en GCP/Cloud, déjalo activado
});

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        d.id_dato_dispositivo,
        a.nombre_alerta,
        to_char(d.fecha_hora_alerta, 'YYYY-MM-DD HH24:MI:SS') AS fecha_hora_alerta,
        d.valor_anomalo::text AS valor_anomalo
      FROM public.detalle_alerta d
      JOIN public.alerta a ON d.id_alerta = a.id_alerta
      ORDER BY d.fecha_hora_alerta DESC
      LIMIT 20;
    `);

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (err: any) {
    console.error("API /api/mostrar_alertas:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error consultando alertas",
        detail: process.env.NODE_ENV === "development" ? String(err?.message ?? err) : undefined,
      },
      { status: 500 }
    );
  }
}
