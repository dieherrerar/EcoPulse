"use client";

import { useEffect, useState } from "react";

export default function HomeClient() {
  const [temp, setTemp] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  // Traer solo el valor de temperatura desde tu endpoint
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const r = await fetch("/api/temperatura/vina", {
          cache: "no-store",
        });
        const j = await r.json();
        setTemp(j?.temperatura);
        if (j?.lat === -33.02457 || j?.lon === -71.55183) {
          setNombre("Viña del mar");
        }
      } catch {
        setTemp(null);
      }
    };
    if (temp == null) fetchTemp();
  }, [temp]);

  return (
    <p>
      {temp !== null
        ? `${nombre ? `${nombre}: ` : ""}${temp} °C`
        : "Cargando temperatura..."}
    </p>
  );
}
