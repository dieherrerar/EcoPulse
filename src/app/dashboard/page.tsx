"use client";

import React, { useEffect, useState, useRef } from "react";
import type { NextPage } from "next";
import KpiCard from "../../../components/KpiCard";
import LineChartComp from "../../../components/charts/LineChartComp";
import BarChartComp from "../../../components/charts/BarChartComp";
import PieChartComp from "../../../components/charts/PieChartComp";
import AreaChartComp from "../../../components/charts/AreaChartComp";
import type {
  CompositionDatum,
  DashboardPayload,
} from "../../../types/dashboard";
import Table from "../../../components/Table";
import DownloadButton from "../../../components/DownloadCSV";
import DownloadPDF from "../../../components/DownloadPDF";
import "./dashboard.css";
import dynamic from "next/dynamic";
import AdminChartPicker from "../../../components/AdminChartPicker";

// ⬇️ Listener de alertas (SSE) solo en cliente
const AlertsSSEListener = dynamic(
  () => import("../../../components/AlertsSSEListener"),
  { ssr: false }
);

const POLL_MS = 120_000; //2 minutos

const DashboardPage: NextPage = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [datosDiccionario, setDatosDiccionario] = useState<
    { variable: string; descripcion: string; rango: string }[]
  >([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const inFlight = useRef<AbortController | null>(null);

  //verificar si es admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/validate", { cache: "no-store" });
        const j = await res.json();
        setIsAdmin(j?.valid === true);
      } catch {
        setIsAdmin(false);
      }
    }
    checkAuth();
  }, []);

  //cargar fechas desde la BD
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/dates", { cache: "no-store" });
        const jsonr = await response.json();
        if (jsonr.success && jsonr.dates.length > 0) {
          setDates(jsonr.dates);
          setSelectedDate(jsonr.dates[jsonr.dates.length - 1]); // última fecha
          setError(null);
        } else {
          setError("No hay fechas disponibles.");
        }
      } catch (err) {
        setError("Error obteniendo fechas.");
      } finally {
      }
    })();
  }, []);

  //cargar los datos al dashboard segun la fecha seleccionada
  useEffect(() => {
    (async () => {
      if (!selectedDate) return; // evita setLoading(false) prematuro
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard-data?date=${selectedDate}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("No se pudo obtener el dashboard");
        const json = (await res.json()) as DashboardPayload;
        setData(json);
      } catch (err: any) {
        setError(err?.message || "Error cargando los datos del dashboard.");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  //Polling automatico cada 2 minutos
  useEffect(() => {
    if (!selectedDate) return;

    const intervalID = setInterval(async () => {
      try {
        const res = await fetch(`/api/dashboard-data?date=${selectedDate}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = (await res.json()) as DashboardPayload;
          setData(json);
        }
      } catch (err) {
        console.error("Error actualizando dashboard: ", err);
      }
    }, POLL_MS);

    return () => clearInterval(intervalID);
  }, [selectedDate]);

  //Diccionario de datos
  useEffect(() => {
    (async () => {
      const resp = await fetch("api/diccionario-datos");
      const jsronres = await resp.json();
      if (jsronres.success) {
        setDatosDiccionario(jsronres.datos);
      }
    })();
  }, []);

  const avg = data?.kpis?.avgPM10 ?? 0;

  const pm25Bars: CompositionDatum[] = [
    { name: "Promedio del día", value: avg },
    { name: "Límite OMS 24 h", value: 130 },
  ];

  if (loading)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="spinner-ecopulse" />
        <div
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#1e90ff",
            marginTop: "2rem",
            textAlign: "center",
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(30,144,255,0.10)",
          }}
        >
          Cargando el Dashboard Ambiental...
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="container py-4 text-danger">
        No se pudieron cargar los datos.
      </div>
    );

  const { kpis, timeseries, composition, stacked } = data;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Dashboard Ambiental</h2>

      {/* Dropdown para seleccionar fecha con leyenda */}
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

      <div className="row">
        <div className={isAdmin ? "col-12 col-lg-9" : "col-12"}>
          {/* KPIs */}
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <KpiCard
                title="MP2.5_ATE promedio hoy"
                value={kpis?.avgPM25 ?? "-"}
                subtitle="µg/m³"
              />
            </div>
            <div className="col-6 col-md-3">
              <KpiCard
                title="Temperatura promedio"
                value={kpis?.avgTemp ?? "-"}
                subtitle="°C"
              />
            </div>
            <div className="col-6 col-md-3">
              <KpiCard
                title="CO₂ máximo"
                value={kpis?.maxCO2 ?? "-"}
                subtitle="ppm"
              />
            </div>
            <div className="col-6 col-md-3">
              <KpiCard
                title="Precipitación acumulada"
                value={kpis?.aguaCaida ?? "-"}
                subtitle="mm"
              />
            </div>
          </div>

          {/* Gráficos */}
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="dashboard-chart-container">
                <LineChartComp
                  data={data.tempCo2Trend}
                  xKey="tempBin"
                  yKey="co2"
                  xType="number"
                  title={`Relación CO₂ vs Temperatura`}
                  xLabel="Temperatura (°C)"
                  yLabel="CO₂ (ppm)"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="dashboard-chart-container">
                <BarChartComp
                  data={pm25Bars}
                  title={`PM promedio del día vs límite OMS`}
                />
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="dashboard-chart-container">
                <PieChartComp
                  title="Distribución porcentual de partículas MP"
                  data={composition}
                  nameKey="name"
                  valueKey="value"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="dashboard-chart-container">
                <AreaChartComp
                  data={stacked}
                  xKey="date"
                  areas={[
                    { key: "co2", name: "CO2" },
                    { key: "consumo", name: "consumo" },
                  ]}
                  title="CO2 vs Consumo a lo largo del tiempo"
                />
              </div>
            </div>
          </div>

          {/* Si no es admin, mostrar botones de descarga. */}
          {!isAdmin && (
            <div className="mb-4 d-flex gap-3 flex-wrap">
              <DownloadButton label="Extraer reporte CSV" date={selectedDate} />
              <DownloadPDF
                targetId="container py-4"
                fileName={"eco_dashboard_" + selectedDate}
                hideSelectors={[
                  "#fecha",
                  ".dashboard-btn-blue",
                  ".download-controls",
                  "#table-responsive mt-3 mb-5 dashboard-chart-container",
                  "#mt-5 mb-3",
                  "#mb-4 d-flex gap-3 flex-wrap",
                ]}
                btnClassName="dashboard-btn-blue"
              />
            </div>
          )}

          {/* Si no es admin, mostrar diccionario de datos*/}
          {!isAdmin && (
            <>
              <h2 className="mt-5 mb-3">Diccionario de Datos</h2>
              <div className="table-responsive mt-3 mb-5 dashboard-chart-container">
                <Table datos={datosDiccionario} />
              </div>
            </>
          )}

          {!isAdmin && <AlertsSSEListener />}
        </div>

        {/* Right column: checklist / admin picker */}
        {isAdmin && (
          <aside className="col-12 col-lg-3">
            <div className="admin-checklist p-2 p-lg-3">
              <div className="sticky-side">
                <AdminChartPicker title={"Gráficos"} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
