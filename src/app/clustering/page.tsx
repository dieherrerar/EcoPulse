"use client";
import { useEffect, useState } from "react";
import DownloadPDF from "../../../components/DownloadPDF";
// ⬇️ nuevo: usa el componente 3D
import Cluster3D from "../../../components/charts/Cluster3D";
import FullPageLoader from "../../../components/FullPageLoader";

const POLL_MS = 120_000;

export default function ClusterrPage() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [points, setPoints] = useState<any[]>([]);
  const [centroids, setCentroids] = useState<any[]>([]);
  const [features, setFeatures] = useState<string[]>([
    "Tem_BME280",
    "MP1.0_AtE",
    "CO2_MHZ19",
    "Rap_Viento",
  ]);
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
        // si el backend envía features, úsalo
        if (Array.isArray(j.features) && j.features.length >= 4) {
          setFeatures(j.features);
        }
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
          if (Array.isArray(j.features) && j.features.length >= 4) {
            setFeatures(j.features);
          }
        }
      } catch (err) {
        console.warn("Error actualizando clusters:", err);
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [selectedDate]);

  if (loading) {
    return <FullPageLoader message={"Cargando gráfico de patrones..."} />;
  }

  return (
    <div>
      <div className="container py-4" id="cluster-root">
        {/* Título con misma jerarquía visual */}
        <h2 className="mb-3 text-center">
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

        {/* Gráfico 3D (X=Tem, Y=MP1.0, Z=CO2, Tamaño=Rap_Viento) */}
        <div className="dashboard-chart-container">
          <Cluster3D
            points={points}
            centroids={centroids}
            features={features}
            xKey="Tem_BME280"
            yKey="MP1.0_AtE"
            zKey="CO2_MHZ19"
            sizeKey="Rap_Viento"
            title=""
          />
        </div>
      </div>

      <div id="ButtonPDF" className="mb-4">
        <div className="container">
          <div className="d-flex gap-3 flex-wrap">
            <DownloadPDF
              targetId="container py-4"
              fileName={"eco_clustering" + selectedDate}
              hideSelectors={["#fecha", "#ButtonPDF"]}
              btnClassName="dashboard-btn-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
