"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./estilos_componentes.css";
import React, { ReactNode } from "react";

interface CardProps {
  title: String;
  description: String;
  imageUrl?: String;
}

export default function Card(props: CardProps) {
  const { title, description, imageUrl } = props;
  return (
    <div className="card" style={{ width: "18rem", height: "24rem" }}>
      <img
        src={imageUrl?.toString()}
        className="card-img-top"
        alt="..."
        style={{ height: "12rem", objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
      </div>
    </div>
  );
}
