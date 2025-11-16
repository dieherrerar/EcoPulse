"use client";

import React, { useEffect, useState } from "react";

interface TemperatureCardProps {
  city: string;
}

type WeatherCategory =
  | "sunny"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "storm"
  | "wind"
  | "snow"
  | "unknown";

function categorizeCondition(text: string): WeatherCategory {
  const t = text.toLowerCase();

  if (t.includes("storm") || t.includes("thunder")) {
    return "storm";
  }

  if (t.includes("drizzle")) {
    return "drizzle";
  }

  if (t.includes("rain") || t.includes("precip")) {
    return "rain";
  }

  if (t.includes("snow")) {
    return "snow";
  }

  if (t.includes("fog") || t.includes("mist")) {
    return "fog";
  }

  if (t.includes("wind") || t.includes("breeze")) {
    return "wind";
  }

  if (t.includes("partly")) {
    return "partly";
  }

  if (t.includes("clear") || t.includes("sun")) {
    return "sunny";
  }

  if (t.includes("cloud") || t.includes("overcast")) {
    return "cloudy";
  }

  return "unknown";
}

function WeatherIcon({ category }: { category: WeatherCategory }) {
  if (category === "partly") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <circle cx="12" cy="12" r="5" fill="#FDB813" />
        <path
          d="M12 22h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 12 22z"
          fill="#B0BEC5"
        />
      </svg>
    );
  }

  if (category === "fog") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M7 14h18M6 18h20M7 22h18"
          stroke="#B0BEC5"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "drizzle") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#B0BEC5"
        />
        <path
          d="M12 20l-2 4M18 20l-2 4M24 20l-2 4"
          stroke="#81D4FA"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "rain") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#90A4AE"
        />
        <path
          d="M11 20l-2 5M16 20l-2 5M21 20l-2 5"
          stroke="#29B6F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "storm") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#90A4AE"
        />
        <path d="M16 18l-3 5h3l-1 5 4-7h-3l3-3z" fill="#FFCA28" />
      </svg>
    );
  }

  if (category === "wind") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M6 14h14a3 3 0 1 0-3-3"
          fill="none"
          stroke="#81D4FA"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 19h12a3 3 0 1 1-3 3"
          fill="none"
          stroke="#4FC3F7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "snow") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#B0BEC5"
        />
        <circle cx="12" cy="21" r="1.2" fill="#ECEFF1" />
        <circle cx="16" cy="23" r="1.2" fill="#ECEFF1" />
        <circle cx="20" cy="21" r="1.2" fill="#ECEFF1" />
      </svg>
    );
  }

  if (category === "sunny") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <circle cx="16" cy="16" r="6" fill="#FDB813" />
        <line
          x1="16"
          y1="3"
          x2="16"
          y2="9"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="23"
          x2="16"
          y2="29"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="3"
          y1="16"
          x2="9"
          y2="16"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="23"
          y1="16"
          x2="29"
          y2="16"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="6.5"
          y1="6.5"
          x2="10.5"
          y2="10.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="21.5"
          y1="21.5"
          x2="25.5"
          y2="25.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="21.5"
          y1="10.5"
          x2="25.5"
          y2="6.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="6.5"
          y1="21.5"
          x2="10.5"
          y2="17.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "cloudy") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 24h12a5 5 0 0 0 0-10 7 7 0 0 0-13-2 4 4 0 0 0 1 12z"
          fill="#B0BEC5"
        />
      </svg>
    );
  }

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 32 32"
      aria-hidden="true"
      role="img"
    >
      <circle cx="16" cy="16" r="10" fill="#ECEFF1" />
      <path
        d="M11 20h10a3 3 0 0 0 0-6 5 5 0 0 0-9-1.5A3 3 0 0 0 11 20z"
        fill="#B0BEC5"
      />
    </svg>
  );
}

export default function TemperatureCard({ city }: TemperatureCardProps) {
  const [temp, setTemp] = useState<number | null>(null);
  const [category, setCategory] = useState<WeatherCategory>("unknown");

  useEffect(() => {
    const fetchTemp = async () => {
      try {
        let endpoint = "";
        switch (city) {
          case "Viña del Mar":
            endpoint = "/api/temperatura/vina";
            break;
          case "Valparaíso":
            endpoint = "/api/temperatura/valparaiso";
            break;
          case "Concón":
            endpoint = "/api/temperatura/concon";
            break;
          case "Quilpué":
            endpoint = "/api/temperatura/quilpue";
            break;
          case "Limache":
            endpoint = "/api/temperatura/limache";
            break;
          default:
            endpoint = "";
        }

        if (!endpoint) {
          setTemp(null);
          setCategory("unknown");
          return;
        }

        const r = await fetch(endpoint, {
          cache: "no-store",
        });
        const j = await r.json();

        if (j?.temperatura !== null && j?.temperatura !== undefined) {
          const numericTemp = Number(j.temperatura);
          setTemp(Number.isNaN(numericTemp) ? null : numericTemp);
        } else {
          setTemp(null);
        }

        const summaryText = (j?.summary ?? j?.icon ?? "").toString();
        setCategory(
          summaryText ? categorizeCondition(summaryText) : "unknown"
        );
      } catch {
        setTemp(null);
        setCategory("unknown");
      }
    };

    fetchTemp();
    const interval = setInterval(fetchTemp, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  [[MARK]]return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <circle cx="12" cy="12" r="5" fill="#FDB813" />
        <path
          d="M12 22h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 12 22z"
          fill="#B0BEC5"
        />
      </svg>
    );
  }

  if (category === "fog") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M7 14h18M6 18h20M7 22h18"
          stroke="#B0BEC5"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "drizzle") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#B0BEC5"
        />
        <path
          d="M12 20l-2 4M18 20l-2 4M24 20l-2 4"
          stroke="#81D4FA"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "rain") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#90A4AE"
        />
        <path
          d="M11 20l-2 5M16 20l-2 5M21 20l-2 5"
          stroke="#29B6F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "storm") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#90A4AE"
        />
        <path d="M16 18l-3 5h3l-1 5 4-7h-3l3-3z" fill="#FFCA28" />
      </svg>
    );
  }

  if (category === "wind") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M6 14h14a3 3 0 1 0-3-3"
          fill="none"
          stroke="#81D4FA"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 19h12a3 3 0 1 1-3 3"
          fill="none"
          stroke="#4FC3F7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "snow") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.2-1.7A4 4 0 0 0 10 18z"
          fill="#B0BEC5"
        />
        <circle cx="12" cy="21" r="1.2" fill="#ECEFF1" />
        <circle cx="16" cy="23" r="1.2" fill="#ECEFF1" />
        <circle cx="20" cy="21" r="1.2" fill="#ECEFF1" />
      </svg>
    );
  }

  if (category === "sunny") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <circle cx="16" cy="16" r="6" fill="#FDB813" />
        <line
          x1="16"
          y1="3"
          x2="16"
          y2="9"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="23"
          x2="16"
          y2="29"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="3"
          y1="16"
          x2="9"
          y2="16"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="23"
          y1="16"
          x2="29"
          y2="16"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="6.5"
          y1="6.5"
          x2="10.5"
          y2="10.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="21.5"
          y1="21.5"
          x2="25.5"
          y2="25.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="21.5"
          y1="10.5"
          x2="25.5"
          y2="6.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="6.5"
          y1="21.5"
          x2="10.5"
          y2="17.5"
          stroke="#FDB813"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === "cloudy") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="img"
      >
        <path
          d="M10 24h12a5 5 0 0 0 0-10 7 7 0 0 0-13-2 4 4 0 0 0 1 12z"
          fill="#B0BEC5"
        />
      </svg>
    );
  }

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 32 32"
      aria-hidden="true"
      role="img"
    >
      <circle cx="16" cy="16" r="10" fill="#ECEFF1" />
      <path
        d="M11 20h10a3 3 0 0 0 0-6 5 5 0 0 0-9-1.5A3 3 0 0 0 11 20z"
        fill="#B0BEC5"
      />
    </svg>
  );
}

export default function TemperatureCard({ city }: TemperatureCardProps) {
  const [temp, setTemp] = useState<number | null>(null);
  const [category, setCategory] = useState<WeatherCategory>("unknown");

  useEffect(() => {
    const fetchTemp = async () => {
      try {
        let endpoint = "";
        switch (city) {
          case "Viña del Mar":
            endpoint = "/api/temperatura/vina";
            break;
          case "Valparaíso":
            endpoint = "/api/temperatura/valparaiso";
            break;
          case "Concón":
            endpoint = "/api/temperatura/concon";
            break;
          case "Quilpué":
            endpoint = "/api/temperatura/quilpue";
            break;
          case "Limache":
            endpoint = "/api/temperatura/limache";
            break;
          default:
            endpoint = "";
        }

        if (!endpoint) {
          setTemp(null);
          setCategory("unknown");
          return;
        }

        const r = await fetch(endpoint, {
          cache: "no-store",
        });
        const j = await r.json();

        if (j?.temperatura !== null && j?.temperatura !== undefined) {
          const numericTemp = Number(j.temperatura);
          setTemp(Number.isNaN(numericTemp) ? null : numericTemp);
        } else {
          setTemp(null);
        }

        const summaryText = (j?.summary ?? j?.icon ?? "").toString();
        setCategory(
          summaryText ? categorizeCondition(summaryText) : "unknown"
        );
      } catch {
        setTemp(null);
        setCategory("unknown");
      }
    };

    fetchTemp();
    const interval = setInterval(fetchTemp, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  const displayTemp =
    temp === null || Number.isNaN(temp) ? "N/A" : `${temp.toFixed(1)} °C`;

  const conditionLabel =
    category === "sunny"
      ? "Soleado"
      : category === "cloudy"
      ? "Nublado"
      : "Condición actual";

  return (
    <div className="Kpicard p-3 h-100">
      <div className="small text-muted">{city}</div>
      <div className="h3 fw-bold">{displayTemp}</div>
      <div className="d-flex align-items-center gap-2 mt-2">
        <WeatherIcon category={category} />
        <span className="small text-muted">{conditionLabel}</span>
      </div>
    </div>
  );
}

