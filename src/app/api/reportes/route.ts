import { NextRequest } from "next/server";
import { query } from "../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id_tipo_reporte, id_dashboard, titulo_reporte } = body as {
      id_tipo_reporte?: number;
      id_dashboard?: number;
      titulo_reporte?: string;
    };

    if (typeof id_tipo_reporte !== "number") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "id_tipo_reporte es requerido y debe ser numerico",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let dashboardResult;
    if (typeof id_dashboard === "number") {
      dashboardResult = await query(
        "SELECT id_dashboard, titulo_dashboard FROM dashboard WHERE id_dashboard = $1 LIMIT 1",
        [id_dashboard]
      );
    } else {
      dashboardResult = await query(
        "SELECT id_dashboard, titulo_dashboard FROM dashboard ORDER BY id_dashboard ASC LIMIT 1"
      );
    }

    if (!dashboardResult.rows?.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se encontro ningun dashboard",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const {
      id_dashboard: dashboardId,
      titulo_dashboard,
    } = dashboardResult.rows[0] as {
      id_dashboard: number;
      titulo_dashboard: string;
    };

    const defaultTitulo = `Informe Ambiental ${titulo_dashboard} EcoPulse`;
    const finalTitulo =
      typeof titulo_reporte === "string" && titulo_reporte.trim() !== ""
        ? titulo_reporte
        : defaultTitulo;

    await query(
      "INSERT INTO reporte (titulo_reporte, id_tipo_reporte, id_dashboard) VALUES ($1, $2, $3)",
      [finalTitulo, id_tipo_reporte, dashboardId]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

