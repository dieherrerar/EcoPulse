"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import KpiCard from "../../../components/KpiCard";
import LineChartComp from "../../../components/charts/LineChartComp";
import BarChartComp from "../../../components/charts/BarChartComp";
import PieChartComp from "../../../components/charts/PieChartComp";
import AreaChartComp from "../../../components/charts/AreaChartComp";
import type { DashboardPayload } from "../../../types/dashboard";
import "./dashboard.css";

const DashboardPage: NextPage = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard-data");
        if (!res.ok) throw new Error("Error fetching dashboard data");
        const json = (await res.json()) as DashboardPayload;
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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
            title="Consumo total"
            value={kpis?.totalConsumo ?? "-"}
            subtitle="Unidades"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <LineChartComp data={timeseries} xKey="date" yKey="pm25" />
        </div>
        <div className="col-12 col-lg-6">
          <BarChartComp data={timeseries} xKey="date" yKey="temp" />
        </div>

        <div className="col-12 col-lg-6">
          <PieChartComp data={composition} nameKey="name" valueKey="value" />
        </div>
        <div className="col-12 col-lg-6">
          <AreaChartComp
            data={stacked}
            xKey="date"
            areas={[
              { key: "co2", name: "CO2" },
              { key: "consumo", name: "consumo" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
