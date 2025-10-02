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
    return <div className="container py-4">Cargando dashboard...</div>;
  if (!data)
    return (
      <div className="container py-4 text-danger">
        No se pudieron cargar los datos.
      </div>
    );

  const { kpis, timeseries, stationData, composition, stacked } = data;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Dashboard Ambiental</h2>

      {/* KPIs */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <KpiCard
            title="Alertas hoy"
            value={kpis?.alertsToday ?? "-"}
            subtitle="Incidentes detectados"
          />
        </div>
        <div className="col-6 col-md-3">
          <KpiCard
            title="AQI promedio 24h"
            value={kpis?.avgAQI24h ?? "-"}
            subtitle="Promedio últimos 24h"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <LineChartComp data={timeseries} xKey="date" yKey="aqi" />
        </div>
        <div className="col-12 col-lg-6">
          <BarChartComp data={stationData} xKey="station" yKey="value" />
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
              { key: "nh3", name: "NH3" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
