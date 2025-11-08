import { NextResponse } from "next/server";
import { query } from "../../lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT id_grafico, titulo_grafico, activo FROM grafico WHERE id_grafico BETWEEN 2 AND 11 ORDER BY id_grafico ASC;"
    );

    const dbRows = result.rows as Array<{ id_grafico: number; titulo_grafico: string; activo: number }>;

    const defaults: Array<{ id_grafico: number; titulo_grafico: string; activo: number }> = [
      { id_grafico: 2, titulo_grafico: "Relación CO₂ vs Temperatura", activo: 1 },
      { id_grafico: 3, titulo_grafico: "Barras PM Promedio", activo: 1 },
      { id_grafico: 4, titulo_grafico: "Distribución de Partículas", activo: 1 },
      { id_grafico: 5, titulo_grafico: "CO₂ vs Consumo en el tiempo", activo: 1 },
      { id_grafico: 6, titulo_grafico: "Serie temporal CO₂", activo: 1 },
      { id_grafico: 7, titulo_grafico: "Serie temporal PM2.5", activo: 1 },
      { id_grafico: 8, titulo_grafico: "Serie temporal Temperatura", activo: 1 },
      { id_grafico: 9, titulo_grafico: "Serie temporal Humedad", activo: 1 },
    ];

    const byId = new Map(dbRows.map((r) => [Number(r.id_grafico), r]));
    const defaultMap = new Map(defaults.map((d) => [Number(d.id_grafico), d]));
    const allIds = Array.from(
      new Set<number>([
        ...defaults.map((d) => Number(d.id_grafico)),
        ...dbRows.map((r) => Number(r.id_grafico)),
      ])
    )
      .filter((id) => id !== 6)
      .sort((a, b) => a - b);

    const merged = allIds.map((id) => {
      const r = byId.get(id);
      const d = defaultMap.get(id);
      return {
        id_grafico: id,
        titulo_grafico: r?.titulo_grafico ?? d?.titulo_grafico ?? `Gráfico ${id}`,
        activo: typeof r?.activo === "number" ? r!.activo : d?.activo ?? 1,
      };
            
    });

    return NextResponse.json({ success: true, data: merged });
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
        { success: false, error: "Payload Inválido" },
        { status: 400 }
      );
    }

    try {
      await query("BEGIN;");
      let titles: Record<number, string> = {
        2: "Relación CO₂ vs Temperatura",
        3: "Barras PM Promedio",
        4: "Distribución de Partículas",
        5: "CO₂ vs Consumo en el tiempo",
        6: "Serie temporal CO₂",
        7: "Serie temporal PM2.5",
        8: "Serie temporal Temperatura",
        9: "Serie temporal Humedad",
      };
      (titles as any)[10] = "Serie temporal Humedad";
      (titles as any)[11] = "PM2.5 promedio por dia de semana";
      for (const { id_grafico, activo } of body) {
        const upd = await query(
          `UPDATE grafico
           SET activo = $1
           WHERE id_grafico = $2;`,
          [activo, id_grafico]
        );
        if ((upd as any)?.rowCount === 0) {
          const title = titles[id_grafico] ?? `Gráfico ${id_grafico}`;
          await query(
            `INSERT INTO grafico (id_grafico, titulo_grafico, activo)
             VALUES ($1, $2, $3);`,
            [id_grafico, title, activo]
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
