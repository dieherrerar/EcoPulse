import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

type TipoReporteRow = {
  id_tipo_reporte: number;
  nombre_tipo_reporte: string;
  descripcion_tipo_reporte: string;
};

type DashboardRow = {
  id_dashboard: number;
  titulo_dashboard: string;
  estado_dashboard: number | null;
  fecha_creacion_dashboard: string | null;
  descripcion_dashboard: string | null;
};

type GraficoRow = {
  id_grafico: number;
  titulo_grafico: string;
  descripcion_relacion: string | null;
  variables_utilizadas: any;
  visualizacion: number | null;
  activo: number | null;
};

const DEFAULT_DATA_ID = 1;

function parseVariables(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v));

  if (typeof raw === "object") {
    const varsFromKey = (raw as any).variables;
    if (Array.isArray(varsFromKey)) {
      return varsFromKey.map((v) => String(v));
    }
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
      if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).variables)) {
        return (parsed as any).variables.map((v: any) => String(v));
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dashboardIdParam = searchParams.get("dashboardId");
    const reportTypeParam = searchParams.get("reportTypeId");

    const dashboardId =
      dashboardIdParam && !Number.isNaN(Number(dashboardIdParam))
        ? Number(dashboardIdParam)
        : undefined;

    const reportTypeId =
      reportTypeParam && !Number.isNaN(Number(reportTypeParam))
        ? Number(reportTypeParam)
        : 1;

    // Obtener dashboard base (el primero si no se especifica).
    const dashboardResult = dashboardId
      ? await query(
          `SELECT id_dashboard, titulo_dashboard, estado_dashboard, fecha_creacion_dashboard, descripcion_dashboard
           FROM dashboard
           WHERE id_dashboard = $1
           LIMIT 1`,
          [dashboardId]
        )
      : await query(
          `SELECT id_dashboard, titulo_dashboard, estado_dashboard, fecha_creacion_dashboard, descripcion_dashboard
           FROM dashboard
           ORDER BY id_dashboard ASC
           LIMIT 1`
        );

    if (!dashboardResult.rows?.length) {
      return NextResponse.json(
        { success: false, error: "No se encontraron dashboards" },
        { status: 404 }
      );
    }

    const dashboardRow = dashboardResult.rows[0] as DashboardRow;
    const targetDashboardId = dashboardRow.id_dashboard;

    // Informacion del tipo de reporte (PDF por defecto).
    const tipoResult = await query(
      `SELECT id_tipo_reporte, nombre_tipo_reporte, descripcion_tipo_reporte
       FROM tipo_reporte
       WHERE id_tipo_reporte = $1
       LIMIT 1`,
      [reportTypeId]
    ).catch(() => null);

    const tipoRow = tipoResult?.rows?.[0] as TipoReporteRow | undefined;

    // Graficos asociados al dashboard y sus descripciones/variables.
    const graficosResult = await query(
      `SELECT
         g.id_grafico,
         g.titulo_grafico,
         dgd.descripcion_relacion,
         dgd.variables_utilizadas,
         dd.visualizacion,
         dgd.activo
       FROM grafico g
       LEFT JOIN detalle_dashboard dd
         ON dd.id_grafico = g.id_grafico
        AND dd.id_dashboard = $1
       LEFT JOIN detalle_grafico_data dgd
         ON dgd.id_grafico = g.id_grafico
        AND dgd.id_data = $2
       WHERE g.id_grafico BETWEEN 1 AND 10
       ORDER BY g.id_grafico ASC`,
      [targetDashboardId, DEFAULT_DATA_ID]
    );

    const graficos = (graficosResult.rows || []).map((row) => {
      const g = row as GraficoRow;
      return {
        id_grafico: Number(g.id_grafico),
        titulo_grafico: g.titulo_grafico,
        descripcion_relacion: g.descripcion_relacion ?? "",
        variables: parseVariables(g.variables_utilizadas),
        visualizacion: g.visualizacion ?? 2,
        activo: g.activo ?? 1,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tipoReporte: tipoRow ?? null,
        dashboard: dashboardRow,
        graficos,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message ?? "Error obteniendo datos de reporte" },
      { status: 500 }
    );
  }
}
