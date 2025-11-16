import React from "react";
import "./HomePage.css";
import Carousel from "../../../components/Carousel";
import Card from "../../../components/CardHome";
import TemperatureCard from "../../../components/TemperatureCard";
import { checkAuth } from "../lib/checkAuth";

export default async function HomePage() {
  const { valid, user } = await checkAuth();

  const cities = [
    { name: "Viña del Mar", endpoint: "/api/temperatura/vina" },
    { name: "Valparaíso", endpoint: "/api/temperatura/valparaiso" },
    { name: "Concón", endpoint: "/api/temperatura/concon" },
    { name: "Quilpué", endpoint: "/api/temperatura/quilpue" },
    { name: "Limache", endpoint: "/api/temperatura/limache" },
  ];

  return (
    <div
      className="home-container"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {valid ? (
        <p className="welcome-admin">Bienvenido, {user?.name}</p>
      ) : (
        <p></p>
      )}

      <Carousel />
      <h1 className="PreguntaInicio">¿Qué encontrarás aquí?</h1>
      <div className="cards-container">
        <Card
          title="Detección de patrones"
          description="Identifica tendencias y agrupaciones relevantes mediante modelos de clustering entrenados con los datos recolectados."
        />
        <Card
          title="Generación de reportes"
          description="Crea reportes ejecutivos en PDF del dashboard y exporta datos históricos en formato CSV para análisis detallado."
        />
        <Card
          title="Visualización de dashboard"
          description="Explora un dashboard interactivo que actualiza cada 10 minutos el estado ambiental y sus principales indicadores."
        />
        <Card
          title="Análisis de alertas"
          description="Revisa y analiza alertas medioambientales generadas en función de umbrales definidos y fechas específicas."
        />
      </div>
      <h2 className="temperature-title">
        Temperatura en Viña y ciudades cercanas de la Quinta Región
      </h2>
      <div className="temperature-cards">
        {cities.map((c) => (
          <div className="kpi-card-wrapper" key={c.name}>
            <TemperatureCard city={c.name} endpoint={c.endpoint} />
          </div>
        ))}
      </div>
    </div>
  );
}

