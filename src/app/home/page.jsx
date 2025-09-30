import React from "react";
import "./HomePage.css";
import Carousel from "../../../components/Carousel";
import Card from "../../../components/Card";
const HomePage = () => {
  return (
    <div className="home-container">
      <Carousel />
      <Card
        title={"Detección de Patrones"}
        description={
          "A través de un mdelo de clustering previamente entrenado, se detectan tendencias y patrones con los valores recolectados."
        }
      />
    </div>
  );
};

export default HomePage;
