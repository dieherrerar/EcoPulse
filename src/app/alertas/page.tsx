"use client";

import React, { useEffect, useState } from "react";
import "./alertas.css";

type Alerta = {
  id_dato_dispositivo: number;
  nombre_alerta: string;
  fecha_hora_alerta: string;
  valor_anomalo: string;
};

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // 🌟 nuevo estado

  const fetchAlertas = async () => {
    try {
      setIsRefreshing(true); // 🚀 comienza animación
      const res = await fetch("/api/mostrar_alertas", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Error desconocido");
      setAlertas(json.data);
    } catch (e: any) {
      setErr(e?.message ?? "Error de red");
    } finally {
      setLoading(false);
      // ⏳ detenemos la animación luego de 3 s
      setTimeout(() => setIsRefreshing(false), 3000);
    }
  };

  useEffect(() => {
    fetchAlertas(); // primera carga
    const interval = setInterval(fetchAlertas, 60000); // cada 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="al-container">
      <h1 className="al-title">Alertas</h1>

      {isRefreshing && <div className="refresh-banner">🔄 Actualizando alertas...</div>}

      {loading && <p>Cargando alertas…</p>}
      {err && <p className="al-error">{err}</p>}

      {!loading && !err && (
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>ID Dato Dispositivo</th>
                <th>Alerta</th>
                <th>Valor Anómalo</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a, i) => (
                <tr key={i}>
                  <td>{a.fecha_hora_alerta}</td>
                  <td>{a.id_dato_dispositivo}</td>
                  <td>{a.nombre_alerta}</td>
                  <td>{a.valor_anomalo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="al-hint">
            Mostrando las últimas 20 alertas — refresco automático cada 1 minuto 🔄
          </p>
        </div>
      )}
    </div>
  );
}