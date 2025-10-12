"use client";
import React, { useEffect, useMemo, useState } from "react";
import AlertModal, { type AlertRow } from "../../../components/AlertModal";

export default function AlertsTable() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [detail, setDetail] = useState<AlertRow | null>(null);

  useEffect(() => {
    fetch("/api/alerts").then((r) => r.json()).then(setAlerts);
    const es = new EventSource("/api/alerts/stream");
    es.onmessage = (ev) => {
      const { alert, open_modal } = JSON.parse(ev.data);
      setAlerts((prev) => [alert, ...prev]);
      if (open_modal) setDetail(alert);
    };
    return () => es.close();
  }, []);

  const acknowledge = async (id: string) => {
    await fetch(`/api/alerts/${id}/ack`, { method: "POST" });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a)));
  };

  const closeDetail = async () => {
    if (detail) await fetch(`/api/alerts/${detail.id}/close`, { method: "POST" });
    setDetail(null);
  };

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th>Nivel</th><th>Mensaje</th><th>Variable</th><th>Valor</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id}>
              <td>{a.level}</td>
              <td>{a.message}</td>
              <td>{a.variable}</td>
              <td>{a.value}</td>
              <td>{a.status}</td>
              <td><button onClick={() => setDetail(a)}>Ver</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <AlertModal open={!!detail} alert={detail} onClose={closeDetail} onAcknowledge={acknowledge} />
    </div>
  );
}
