"use client";

import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./estilos_componentes.css";
import React from "react";

interface AccordionProps {
  title: string;
  description: string;
  imageUrl?: string;
}

function FeatureIcon({ title }: { title: string }) {
  const key = title.toLowerCase();

  if (key.includes("patron")) {
    // Ícono de clustering / patrones
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <circle cx="9" cy="10" r="3" fill="#1d6d1b" />
        <circle cx="21" cy="9" r="3" fill="#2ecc71" />
        <circle cx="16" cy="21" r="3" fill="#66bb6a" />
        <line
          x1="9"
          y1="10"
          x2="21"
          y2="9"
          stroke="#98d8aa"
          strokeWidth="1.6"
        />
        <line
          x1="9"
          y1="10"
          x2="16"
          y2="21"
          stroke="#98d8aa"
          strokeWidth="1.6"
        />
        <line
          x1="21"
          y1="9"
          x2="16"
          y2="21"
          stroke="#98d8aa"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (key.includes("reporte")) {
    // Ícono de documento / reporte
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <rect
          x="8"
          y="6"
          width="16"
          height="20"
          rx="2"
          fill="#e8f5e9"
          stroke="#1d6d1b"
          strokeWidth="1.5"
        />
        <line
          x1="11"
          y1="11"
          x2="21"
          y2="11"
          stroke="#1d6d1b"
          strokeWidth="1.4"
        />
        <line
          x1="11"
          y1="15"
          x2="18"
          y2="15"
          stroke="#1d6d1b"
          strokeWidth="1.4"
        />
        <line
          x1="11"
          y1="19"
          x2="19"
          y2="19"
          stroke="#1d6d1b"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  if (key.includes("dashboard")) {
    // Ícono de dashboard / gráfica
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <rect
          x="6"
          y="7"
          width="20"
          height="14"
          rx="2"
          fill="#e8f5e9"
          stroke="#1d6d1b"
          strokeWidth="1.5"
        />
        <path
          d="M9 18l4-5 4 3 4-6"
          fill="none"
          stroke="#2ecc71"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="12" y="23" width="8" height="2" rx="1" fill="#1d6d1b" />
      </svg>
    );
  }

  if (key.includes("alerta")) {
    // Ícono de alerta
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M16 5l10 18H6L16 5z"
          fill="#ffebee"
          stroke="#c62828"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="15" y="12" width="2" height="7" rx="1" fill="#c62828" />
        <circle cx="16" cy="21" r="1.3" fill="#c62828" />
      </svg>
    );
  }

  // Ícono genérico
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 32 32"
      aria-hidden="true"
      role="img"
    >
      <circle cx="16" cy="16" r="10" fill="#e8f5e9" />
      <path
        d="M12 16l3 3 5-7"
        fill="none"
        stroke="#1d6d1b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Accordion({ title, description }: AccordionProps) {
  // Cargar Bootstrap JS solo en el cliente
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <div className="card home-feature-card">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{description}</p>
        </div>
        <div className="home-feature-icon mt-3">
          <FeatureIcon title={title} />
        </div>
      </div>
    </div>
  );
}
