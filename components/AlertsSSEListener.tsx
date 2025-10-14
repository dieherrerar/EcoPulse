"use client";
import { useEffect, useState } from "react";
import AlertModal, { type AlertRow } from "./AlertModal";

type NotifyPayload = {
  alert: {
    id_alerta: number;
    nombre_alerta: string;
    id_dato_dispositivo: number;
    nivel_alerta: "bajo" | "medio" | "alto" | "extremo";
    message: string;
    valor: number | null;
    variable: string;
    timestamp: string;
  };
  open_modal: boolean;
};

function mapLevel(nivel: NotifyPayload["alert"]["nivel_alerta"]): AlertRow["level"] {
  if (nivel === "bajo") return "info";
  if (nivel === "medio") return "warning";
  return "critical";
}

export default function AlertsSSEListener() {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<AlertRow | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/alerts/stream");
    es.onmessage = (ev) => {
      try {
        const data: NotifyPayload = JSON.parse(ev.data);
        const a = data.alert;
        if (!a) return;

        const mapped: AlertRow = {
          id_alerta: a.id_alerta,
          id_dato_dispositivo: a.id_dato_dispositivo,
          title: a.nombre_alerta,
          message: a.message,
          value: a.valor ?? "",
          variable: a.variable,
          level: mapLevel(a.nivel_alerta),
          ts: a.timestamp,
        };

        setAlert(mapped);
        if (data.open_modal) setOpen(true);
      } catch (e) {
        console.error("Error SSE:", e);
      }
    };

    return () => es.close();
  }, []);

  if (!alert) return null;

  return <AlertModal open={open} onClose={() => setOpen(false)} alert={alert} />;
}
