"use client";
import { useEffect, useRef, useState } from "react";
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

function mapLevel(
  nivel: NotifyPayload["alert"]["nivel_alerta"]
): AlertRow["level"] {
  if (nivel === "bajo") return "info";
  if (nivel === "medio") return "warning";
  return "critical";
}

export default function AlertsSSEListener() {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<AlertRow | null>(null);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // cooldown de 10 minutos entre modales
  const initialLast = (() => {
    try {
      if (typeof window === "undefined") return 0;
      const v = window.localStorage.getItem("alert_modal_last_shown_at");
      return v ? Number(v) : 0;
    } catch {
      return 0;
    }
  })();
  const lastShownAtRef = useRef<number>(initialLast);

  // Persistir y comparar última alerta vista (para evitar repetir la misma)
  const getLastSeenKey = () => {
    try {
      if (typeof window === "undefined") return "";
      return window.localStorage.getItem("alert_modal_last_seen_key") || "";
    } catch {
      return "";
    }
  };
  const setLastSeenKey = (key: string) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("alert_modal_last_seen_key", key);
      }
    } catch {}
  };

  const TEN_MIN = 10 * 60 * 1000;
  const POLL_FALLBACK_MS = 10 * 60 * 1000; // fallback de polling cada 10 minutos

  const canOpenNow = () =>
    Date.now() - (lastShownAtRef.current || 0) >= TEN_MIN;
  const markOpenedNow = () => {
    const now = Date.now();
    lastShownAtRef.current = now;
    try {
      window.localStorage.setItem("alert_modal_last_shown_at", String(now));
    } catch {}
  };

  // Polling de respaldo: sólo abre si hay alerta nueva y se respeta cooldown
  const checkLatestAlert = async () => {
    try {
      const r = await fetch(`/api/mostrar_alertas`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      const list = (j?.data as any[]) || [];
      if (!list.length) return;
      const d = list[0] as {
        id_alerta: number;
        id_dato_dispositivo: number;
        nombre_alerta: string;
        tipo_alerta?: string;
        fecha_hora_alerta?: string;
        valor_anomalo?: string;
        columnas_afectadas?: string;
      };

      const key = `${d.id_alerta}:${d.id_dato_dispositivo}:${
        d.fecha_hora_alerta ?? ""
      }`;
      if (!key) return;

      const lastKey = getLastSeenKey();
      // Si es la misma alerta y no han pasado 10 minutos, no abrir
      if (key === lastKey && !canOpenNow()) return;

      const mapped: AlertRow = {
        id_alerta: d.id_alerta,
        id_dato_dispositivo: d.id_dato_dispositivo,
        title: d.nombre_alerta,
        message: `Nueva alerta detectada`,
        level: "warning",
        detalle_tipo_alerta: d.tipo_alerta,
        detalle_fecha_hora_alerta: d.fecha_hora_alerta,
        detalle_valor_anomalo: d.valor_anomalo,
        detalle_columnas_afectadas: d.columnas_afectadas,
      };
      setAlert(mapped);

      setOpen(true);
      markOpenedNow();
      setLastSeenKey(key);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    // Suscripción SSE
    const es = new EventSource("/api/alerts/stream");
    es.onmessage = (ev) => {
      try {
        const data: NotifyPayload = JSON.parse(ev.data);
        const a = data.alert;
        if (!a) return;

        const base: AlertRow = {
          id_alerta: a.id_alerta,
          id_dato_dispositivo: a.id_dato_dispositivo,
          title: a.nombre_alerta,
          message: a.message,
          value: a.valor ?? "",
          variable: a.variable,
          level: mapLevel(a.nivel_alerta),
          ts: a.timestamp,
        };

        fetch(
          `/api/mostrar_alertas/one?id_alerta=${encodeURIComponent(
            String(a.id_alerta)
          )}&id_dato_dispositivo=${encodeURIComponent(
            String(a.id_dato_dispositivo)
          )}`
        )
          .then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            const d = j?.data as
              | {
                  nombre_alerta: string;
                  tipo_alerta?: string;
                  fecha_hora_alerta?: string;
                  valor_anomalo?: string;
                  columnas_afectadas?: string;
                }
              | undefined;

            const enriched: AlertRow = {
              ...base,
              title: d?.nombre_alerta ?? base.title,
              detalle_tipo_alerta: d?.tipo_alerta,
              detalle_fecha_hora_alerta: d?.fecha_hora_alerta,
              detalle_valor_anomalo: d?.valor_anomalo,
              detalle_columnas_afectadas: d?.columnas_afectadas,
            };

            setAlert(enriched);
          })
          .catch(() => {
            setAlert(base);
          })
          .finally(() => {
            if (!data.open_modal) return;

            const eventKey = `${a.id_alerta}:${a.id_dato_dispositivo}:${
              a.timestamp ?? ""
            }`;
            if (!eventKey) return;

            const lastKey = getLastSeenKey();
            // Si es la misma alerta y no han pasado 10 minutos, no abrir
            if (eventKey === lastKey && !canOpenNow()) return;

            setOpen(true);
            markOpenedNow();
            setLastSeenKey(eventKey);
          });
      } catch (e) {
        console.error("Error SSE:", e);
      }
    };

    // Fallback polling alineado con el dashboard
    const tid = setInterval(checkLatestAlert, POLL_FALLBACK_MS);

    return () => {
      es.close();
      clearInterval(tid);
    };
  }, []);

  if (!alert) return null;

  return (
    <AlertModal open={open} onClose={() => setOpen(false)} alert={alert} />
  );
}
