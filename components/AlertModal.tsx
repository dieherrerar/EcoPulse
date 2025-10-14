export type AlertRow = {
  id_alerta: number;
  id_dato_dispositivo: number;
  title: string;
  message: string;
  value?: number | string; // <-- acepta ambos
  variable?: string;
  level: "info" | "warning" | "critical";
  ts?: string;
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">{alert.title}</h3>
        <p className="text-sm mb-2">{alert.message}</p>

        {alert.value && (
          <p className="text-xs text-gray-600 mb-2">
            {alert.variable}: <b>{alert.value}</b> — {alert.ts}
          </p>
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
