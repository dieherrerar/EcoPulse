"use client";
import { useEffect, useState } from "react";
import ClusterScatter, {
  Point,
  Centroid,
} from "../../../components/charts/ClusterScatter";

const POLL_MS = 120_000;

export default function ClusterrPage() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dates", { cache: "no-store" });
        const json = await res.json();
        if (
          json.success &&
          Array.isArray(json.dates) &&
          json.dates.length > 0
        ) {
          setDates(json.dates);
          setSelectedDate(json.dates[json.dates.length - 1]); // última fecha
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedDate) return;
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(`/api/clusters?date=${selectedDate}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Error al cargar clusters");
        setPoints(j.points ?? []);
        setCentroids(j.centroids ?? []);
      } catch (e: any) {
        setErr(e.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;

    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/clusters?date=${selectedDate}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (r.ok) {
          setPoints(j.points ?? []);
          setCentroids(j.centroids ?? []);
        }
      } catch (err) {
        console.warn("Error actualizando clusters:", err);
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [selectedDate]);

  return (
    <div className="container py-4" id="cluster-root">
      {/* Título con misma jerarquía visual */}
      <h2 className="mb-3">
        Patrones Ambientales Detectados (Clusters y Centroides)
      </h2>

      {/* Selector de fecha con el mismo estilo del dashboard */}
      <div className="mb-4">
        <select
          id="fecha"
          className="form-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="" disabled>
            Selecciona fecha
          </option>
          {dates.map((date) => {
            const formatted = new Date(date).toLocaleDateString("es-CL");
            return (
              <option key={date} value={date}>
                {formatted}
              </option>
            );
          })}
        </select>
      </div>

      {/* Gráfico dentro del mismo contenedor estilizado */}
      <div className="dashboard-chart-container">
        <ClusterScatter points={points} centroids={centroids} />
      </div>
    </div>
  );
}
