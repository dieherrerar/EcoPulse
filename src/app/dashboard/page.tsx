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
import FullPageLoader from "../../../components/FullPageLoader";

// ⬇️ Listener de alertas (SSE) solo en cliente
const AlertsSSEListener = dynamic(
  () => import("../../../components/AlertsSSEListener"),
  { ssr: false }
);

const POLL_MS = 120_000; //2 minutos

const DEFAULT_VIS = {
  AreaChartComp: true,
  BarChartComp: true,
  LineChartComp: true,
  PieChartComp: true,
} as const;

const DashboardPage: NextPage = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [pendingStartDate, setPendingStartDate] = useState<string>("");
  const [pendingEndDate, setPendingEndDate] = useState<string>("");
  const [appliedStartDate, setAppliedStartDate] = useState<string>("");
  const [appliedEndDate, setAppliedEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [datosDiccionario, setDatosDiccionario] = useState<
    { variable: string; descripcion: string; rango: string }[]
  >([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chartVisibility, setChartVisibility] = useState(DEFAULT_VIS);
  const [saving, setSaving] = useState(false);

  

  //Carga visibilidad de los graficos desde el servidor
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chart-visibility", { cache: "no-store" });
        const j = await res.json();
        if (j?.success && j?.data) {
          setChartVisibility((prev) => ({ ...prev, ...j.data }));
        }
      } catch (e) {
        console.warn("Error cargando visibilidad de gráficos: ", e);
      }
    })();
  }, []);

  //Manejar guardado de visibilidad de graficos
  const handleToggleChart = (chartKey: keyof typeof chartVisibility) => {
    const next = { ...chartVisibility, [chartKey]: !chartVisibility[chartKey] };
    setChartVisibility(next);

    if (!isAdmin) return; // solo admins pueden guardar

    setSaving(true);
    fetch("/api/chart-visibility", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((res) => res.json())
      .then((j) => {
        if (!j?.success) {
          //rollback si falla
          setChartVisibility((prev) => ({
            ...prev,
            [chartKey]: !next[chartKey],
          }));
          console.error("Error guardando visibilidad de gráficos: ", j?.error);
        }
      })
      .catch((e) => {
        setChartVisibility((prev) => ({
          ...prev,
          [chartKey]: !next[chartKey],
        })); //rollback si falla
        console.error("Error guardando visibilidad de gráficos: ", e);
      })
      .finally(() => setSaving(false));
  };

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

  // Inicializa el rango con la fecha seleccionada por defecto
  useEffect(() => {
    if (selectedDate) {
      setPendingStartDate(selectedDate);
      setPendingEndDate(selectedDate);
      setAppliedStartDate(selectedDate);
      setAppliedEndDate(selectedDate);
    }
  }, [selectedDate]);

  // Acción del botón "Filtrar"
  const handleApplyFilter = () => {
    if (!pendingStartDate || !pendingEndDate) return;
    setAppliedStartDate(pendingStartDate);
    setAppliedEndDate(pendingEndDate);
  };

  // Cargar datos según rango aplicado
  useEffect(() => {
    (async () => {
      if (!appliedStartDate || !appliedEndDate) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ start: appliedStartDate, end: appliedEndDate });
        const res = await fetch(`/api/dashboard-data?${params.toString()}`, {
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
  }, [appliedStartDate, appliedEndDate]);

  //Polling automatico cada 2 minutos
  useEffect(() => {
    if (!appliedStartDate || !appliedEndDate) return;

    const intervalID = setInterval(async () => {
      try {
        const params = new URLSearchParams({ start: appliedStartDate, end: appliedEndDate });
        const res = await fetch(`/api/dashboard-data?${params.toString()}`, {
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
  }, [appliedStartDate, appliedEndDate]);

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
    { name: "Promedio del periodo", value: avg },
    { name: "Limite OMS 24 h", value: 130 },
  ];

  //mensaje de carga y errores
  if (loading)
    return <FullPageLoader message={"Cargando el Dashboard Ambiental..."} />;
  if (!data)
    return (
      <div className="container py-4 text-danger">
        No se pudieron cargar los datos.
      </div>
    );

  const { kpis, composition, stacked } = data;

  return (
    <div className="container py-4">
      <h2 className="mb-3 text-center">Dashboard Ambiental</h2>

      {/* Selector de rango de fechas y botón de filtrado */}
      <div className="mb-4 d-flex gap-2 align-items-end flex-wrap">
        <div>
          <label htmlFor="fecha-inicio" className="form-label small">Fecha inicio</label>
          <input
            id="fecha-inicio"
            type="date"
            className="form-control"
            min={dates[0]}
            max={dates[dates.length - 1]}
            value={pendingStartDate}
            onChange={(e) => setPendingStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="fecha-fin" className="form-label small">Fecha fin</label>
          <input
            id="fecha-fin"
            type="date"
            className="form-control"
            min={dates[0]}
            max={dates[dates.length - 1]}
            value={pendingEndDate}
            onChange={(e) => setPendingEndDate(e.target.value)}
          />
        </div>
        <div>
          <button
            className="dashboard-btn-blue"
            onClick={handleApplyFilter}
            disabled={!pendingStartDate || !pendingEndDate}
          >
            Filtrar
          </button>
        </div>
      </div>

      <div className="row">
        <div className={isAdmin ? "col-12 col-lg-9" : "col-12"}>
          {/* KPIs */}
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <KpiCard
                title="MP2.5_ATE promedio"
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
            {chartVisibility.LineChartComp && (
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
            )}

            {chartVisibility.BarChartComp && (
              <div className="col-12 col-lg-6">
                <div className="dashboard-chart-container">
                  <BarChartComp
                    data={pm25Bars}
                    title={`PM promedio del día vs límite OMS`}
                  />
                </div>
              </div>
            )}

            {chartVisibility.PieChartComp && (
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
            )}

            {chartVisibility.AreaChartComp && (
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
            )}
          </div>

          {/* Si no es admin, mostrar botones de descarga. */}
          {!isAdmin && (
            <div className="mb-4 d-flex gap-3 flex-wrap">
              <DownloadButton label="Extraer reporte CSV" start={appliedStartDate} end={appliedEndDate} />
              <DownloadPDF
                targetId="container py-4"
                fileName={"eco_dashboard_" + appliedStartDate + "_a_" + appliedEndDate}
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

          <h2 className="mt-5 mb-3">Diccionario de Datos</h2>
          <div className="table-responsive mt-3 mb-5 dashboard-chart-container">
            <Table datos={datosDiccionario} />
          </div>

          <AlertsSSEListener />
        </div>

        {/* Right column: checklist / admin picker */}
        {isAdmin && (
          <aside className="col-12 col-lg-3">
            <div className="admin-checklist p-2 p-lg-3">
              <div className="sticky-side">
                <AdminChartPicker
                  title={"Seleccionar Gráficos"}
                  chartVisibility={chartVisibility}
                  onToggleChart={handleToggleChart}
                />
                <div className="mt-2 small text-muted">
                  {saving ? "Guardando cambios..." : " "}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
