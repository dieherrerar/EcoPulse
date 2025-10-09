"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import KpiCard from "../../../components/KpiCard";
import LineChartComp from "../../../components/charts/LineChartComp";
import BarChartComp from "../../../components/charts/BarChartComp";
import PieChartComp from "../../../components/charts/PieChartComp";
import AreaChartComp from "../../../components/charts/AreaChartComp";
import type { DashboardPayload } from "../../../types/dashboard";
import Table from "../../../components/Table";
import DownloadButton from "../../../components/DownloadCSV";
import DownloadPDF from "../../../components/DownloadPDF";
import "./dashboard.css";

const DashboardPage: NextPage = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [datosDiccionario, setDatosDiccionario] = useState<
    { variable: String; descripcion: String; rango: String }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/dates");
        const jsonr = await response.json();
        if (jsonr.success && jsonr.dates.length > 0) {
          setDates(jsonr.dates);
          setSelectedDate(jsonr.dates[jsonr.dates.length - 1]); // Selecciona la última fecha
        }
      } catch (error) {
        console.error("Error fetching dates", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (selectedDate) {
          const res = await fetch(`/api/dashboard-data?date=${selectedDate}`);
          if (!res.ok) throw new Error("Error fetching dashboard data");
          const json = (await res.json()) as DashboardPayload;
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  useEffect(() => {
    (async () => {
      const resp = await fetch("api/diccionario-datos");
      const jsronres = await resp.json();
      if (jsronres.success) {
        setDatosDiccionario(jsronres.datos);
      }
    })();
  }, []);

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

      {/* KPIs */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <KpiCard
            title="MP2.5 promedio hoy"
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
            <LineChartComp data={timeseries} xKey="date" yKey="pm25" />
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="dashboard-chart-container">
            <BarChartComp data={timeseries} xKey="date" yKey="temp" />
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

      {/* Diccionario de Datos title */}
      <h2 className="mt-5 mb-3">Diccionario de Datos</h2>
      <div className="table-responsive mt-3 mb-5 dashboard-chart-container">
        <Table datos={datosDiccionario} />
      </div>
    </div>
  );
};

export default DashboardPage;
