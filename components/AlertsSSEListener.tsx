"use client";
import React, { useEffect, useState } from "react";
import AlertModal, { type AlertRow } from "./AlertModal";

export default function AlertsSSEListener() {
  const [detail, setDetail] = useState<AlertRow | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/alerts/stream");
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data) as { alert: AlertRow; open_modal?: boolean };
        if (payload.open_modal) setDetail(payload.alert);
      } catch (e) {
        console.error(e);
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const acknowledge = async (id: string) => {
    await fetch(`/api/alerts/${id}/ack`, { method: "POST" });
  };

  const closeDetail = async () => {
    if (detail) await fetch(`/api/alerts/${detail.id}/close`, { method: "POST" });
    setDetail(null);
  };

  return (
    <AlertModal
      open={!!detail}
      alert={detail}
      onClose={closeDetail}
      onAcknowledge={acknowledge}
    />
  );
}
