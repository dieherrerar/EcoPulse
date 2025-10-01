import React from "react";
import "./HomePage.css";
import Carousel from "../../../components/Carousel";
import Card from "../../../components/CardHome";
const HomePage = () => {
  return (
    <div
    className="home-container"
    style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Carousel />
      <h1 className="PreguntaInicio">¿Qué encontrarás acá?</h1>
      <div className="cards-container">
        <Card
          title={"Detección de Patrones"}
          description={
            "A través de un mdelo de clustering previamente entrenado, se detectan tendencias y patrones con los valores recolectados."
          }
        />
        <Card
          title={"Generación de Reportes"}
          description={
            "Podrás generar reportes en formato PDF con los datos recolectados y los patrones detectados."
          }
        />
        <Card
          title={"Visualización de Dashboard"}
          description={
            "Un dashboard interactivo te permitirá visualizar los datos en tiempo real y analizar las tendencias medioambientales."
          }
        />
        <Card
          title={"Análizis de Alertas"}
          description={
            "Consulta y analiza las alertas medioambientales emitidas en función de los datos recolectados en una fecha determinada."
          }
        />
      </div>
    </div>
  );
};

export default HomePage;
