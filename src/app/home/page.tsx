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
          title={"Detección de Patrones"}
          description={
            "A través de un modelo de clustering previamente entrenado, se detectan tendencias y patrones con los valores recolectados."
          }
        />
        <Card
          title={"Generación de Reportes"}
          description={
            "Podrás generar reportes en formato PDF del dashboard y en formato CSV de los datos recolectados en un día específico."
          }
        />
        <Card
          title={"Visualización de Dashboard"}
          description={
            "Un dashboard interactivo te permitirá visualizar los datos en tiempo real y analizar las tendencias medioambientales."
          }
        />
        <Card
          title={"Análisis de Alertas"}
          description={
            "Consulta y analiza las alertas medioambientales emitidas en función de los datos recolectados en una fecha determinada."
          }
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

