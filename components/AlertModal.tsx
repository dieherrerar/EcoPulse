export type AlertRow = {
  id_alerta: number;
  id_dato_dispositivo: number;
  title: string;
  message: string;
  value?: number | string; // <-- acepta ambos
  variable?: string;
  level: "info" | "warning" | "critical";
  ts?: string;
  // Campos opcionales desde detalle_alerta
  detalle_tipo_alerta?: string;
  detalle_fecha_hora_alerta?: string;
  detalle_valor_anomalo?: string | number;
  detalle_columnas_afectadas?: string;
};

export default function AlertModal({
  open,
  alert,
  onClose,
}: {
  open: boolean;
  alert: AlertRow | null;
  onClose: () => void;
}) {
  if (!open || !alert) return null;

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40" style={{ zIndex: 9998 }}>
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg" style={{ zIndex: 9999 }}>
        <h3 className="mb-2 text-lg font-semibold">{alert.title}</h3>
        <p className="text-sm mb-2">{alert.message}</p>

        {alert.value && (
          <p className="text-xs text-gray-600 mb-2">
            {alert.variable}: <b>{alert.value}</b> — {alert.ts}
          </p>
        )}

        {(alert.detalle_tipo_alerta ||
          alert.detalle_fecha_hora_alerta ||
          alert.detalle_valor_anomalo ||
          alert.detalle_columnas_afectadas) && (
          <div className="mt-3 border-t pt-3 text-xs text-gray-700 space-y-1">
            {alert.detalle_tipo_alerta && (
              <p>
                Tipo de alerta: <b>{alert.detalle_tipo_alerta}</b>
              </p>
            )}
            {alert.detalle_fecha_hora_alerta && (
              <p>
                Fecha/Hora: <b>{alert.detalle_fecha_hora_alerta}</b>
              </p>
            )}
            {typeof alert.detalle_valor_anomalo !== "undefined" && alert.detalle_valor_anomalo !== null && (
              <p>
                Valor anómalo: <b>{String(alert.detalle_valor_anomalo)}</b>
              </p>
            )}
            {alert.detalle_columnas_afectadas && (
              <p>
                Columnas afectadas: <b>{alert.detalle_columnas_afectadas}</b>
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-3 py-1 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
