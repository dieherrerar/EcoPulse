"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./estilos_componentes.css";
import React, { ReactNode } from "react";

interface AccordionProps {
  title: String;
  description: String;
  imageUrl?: String;
}

export default function Accordion(props: AccordionProps) {
  const { title, description } = props;
  return (
    <div className="card" style={{ width: "18rem", height: "15rem" }}>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
      </div>
    </div>
  );
}
