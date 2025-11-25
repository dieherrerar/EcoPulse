import { NextResponse } from "next/server";
import { query } from "../../lib/db";

// Configuración: id_data base para leer/escribir el estado "activo" de los gráficos.
// Si más adelante quieres manejar varios datasets, se puede hacer dinámico.
const DEFAULT_DATA_ID = 1;

type GraficoRow = {
  id_grafico: number;
  titulo_grafico: string;
  activo: number;
};

export async function GET() {
  try {
    const result = await query(
      `SELECT
         g.id_grafico,
         g.titulo_grafico,
         COALESCE(dgd.activo, 1) AS activo
       FROM grafico g
       LEFT JOIN detalle_grafico_data dgd
         ON dgd.id_grafico = g.id_grafico
        AND dgd.id_data = $1
       WHERE g.id_grafico BETWEEN 1 AND 10
       ORDER BY g.id_grafico ASC;`,
      [DEFAULT_DATA_ID]
    );

    const dbRows = result.rows as GraficoRow[];

    return NextResponse.json({ success: true, data: dbRows });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Error obteniendo graficos" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Array<{
      id_grafico: number;
      activo: number;
    }>;

    if (
      !Array.isArray(body) ||
      body.some(
        (x) =>
          typeof x.id_grafico !== "number" ||
          typeof x.activo !== "number" ||
          ![1, 2].includes(x.activo)
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Payload inválido" },
        { status: 400 }
      );
    }

    try {
      await query("BEGIN;");

      for (const { id_grafico, activo } of body) {
        // Actualiza si existe registro para (id_data, id_grafico)
        const upd = await query(
          `UPDATE detalle_grafico_data
             SET activo = $1,
                 fecha_modificacion = CURRENT_DATE
           WHERE id_data = $2
             AND id_grafico = $3;`,
          [activo, DEFAULT_DATA_ID, id_grafico]
        );

        // Si no existe, inserta uno mínimo (sin pisar descripciones de otros id_data)
        if ((upd as any)?.rowCount === 0) {
          await query(
            `INSERT INTO detalle_grafico_data
               (id_data, id_grafico, fecha_modificacion, descripcion_relacion, variables_utilizadas, activo)
             VALUES ($1, $2, CURRENT_DATE, NULL, '{}'::jsonb, $3);`,
            [DEFAULT_DATA_ID, id_grafico, activo]
          );
        }
      }

      await query("COMMIT;");
      return NextResponse.json({ success: true });
    } catch (e: any) {
      await query("ROLLBACK;");
      return NextResponse.json(
        { success: false, error: e?.message ?? "Error actualizando graficos" },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Error procesando solicitud" },
      { status: 500 }
    );
  }
}

