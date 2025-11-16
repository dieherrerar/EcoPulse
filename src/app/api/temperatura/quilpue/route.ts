import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = "https://www.meteosource.com/api/v1/free/point";
    const lat = -33.0498135;
    const lon = -71.4415282;
    const apiKey = process.env.APIKEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta la Api key en el entorno" },
        { status: 500 }
      );
    }

    const url = `${baseUrl}?lat=${lat}&lon=${lon}&sections=current,hourly&timezone=America/Santiago&language=en&units=metric&key=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const err = await res.text();
      throw new Error("Error al consultar Meteosource: ${err}");
    }

    const data = await res.json();

    const temperatura = data?.current?.temperature;
    const summary = data?.current?.summary ?? null;
    const icon = data?.current?.icon ?? null;

    return NextResponse.json({ temperatura, summary, icon, lat, lon });
  } catch (error: any) {
    console.error("Error Meteosource: ", error.messagge);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

