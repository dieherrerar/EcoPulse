import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = "https://www.meteosource.com/api/v1/free/point";
    const lat = -32.9220036;
    const lon = -71.5159565;
    const apiKey = process.env.APIKEY;

    if (!apiKey) {
      console.error("METEOSOURCE APIKEY NO DEFINIDA EN EL ENTORNO");
      return NextResponse.json(
        { error: "Falta la Api key en el entorno" },
        { status: 500 }
      );
    }

    const url = `${baseUrl}?lat=${lat}&lon=${lon}&sections=current,hourly&timezone=America/Santiago&language=en&units=metric&key=${apiKey}`;

    console.log("Llamando a Meteosource con URL:", url);

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Meteosource respondió con error:", res.status, errText);
      throw new Error(
        `Error al consultar Meteosource: ${res.status} ${errText}`
      );
    }

    const data = await res.json();

    const temperatura = data?.current?.temperature ?? null;
    const summary = data?.current?.summary ?? null;
    const icon = data?.current?.icon ?? null;

    return NextResponse.json({ temperatura, summary, icon, lat, lon });
  } catch (error: any) {
    console.error("Error Meteosource:", error); // <--- aquí ya no se rompe
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}
