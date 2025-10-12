"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

export type AlertLevel = "info" | "warning" | "critical";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface AlertRow {
  id: string;
  sensor_id: string;
  variable: string;
  level: AlertLevel;
  message: string;
  value: number;
  threshold: number | null;
  status: AlertStatus;
  created_at: string;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
}

const levelBadge: Record<AlertLevel, string> = {
  info: "bg-blue-100 text-blue-700 border-blue-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

export default function AlertModal({
  open,
  alert,
  onClose,
  onAcknowledge,
}: {
  open: boolean;
  alert: AlertRow | null;
  onClose: () => void;
  onAcknowledge: (id: string) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const container = document.body;

  return createPortal(
    <AnimatePresence>
      {open && alert && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={onClose} />
          <motion.div
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl outline-none dark:bg-neutral-900"
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
          >
            <div className="flex justify-between border-b pb-3">
              <h2 className="text-lg font-semibold">Detalle de alerta</h2>
              <button onClick={onClose} className="rounded-full p-2 border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm ${levelBadge[alert.level]}`}>
                  <AlertTriangle className="h-4 w-4" /> {alert.level.toUpperCase()}
                </span>
                <span className="text-xs text-neutral-500">{new Date(alert.created_at).toLocaleString()}</span>
              </div>

              <p>{alert.message}</p>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="border p-2 rounded">Sensor: {alert.sensor_id}</div>
                <div className="border p-2 rounded">Variable: {alert.variable}</div>
                <div className="border p-2 rounded">Valor: {alert.value}</div>
                <div className="border p-2 rounded">Umbral: {alert.threshold ?? "—"}</div>
              </div>

              {alert.status === "open" && (
                <button onClick={() => onAcknowledge(alert.id)} className="rounded-xl border px-4 py-2">
                  Marcar como atendida
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    container
  );
}
