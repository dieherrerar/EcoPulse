"use client";
import React from "react";

interface AdminChartPickerProps {
  title: string;
  chartVisibility: {
    AreaChartComp: boolean;
    BarChartComp: boolean;
    LineChartComp: boolean;
    PieChartComp: boolean;
  };
  onToggleChart: (
    chartKey:
      | "AreaChartComp"
      | "BarChartComp"
      | "LineChartComp"
      | "PieChartComp"
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  hasChanges?: boolean;
  saving?: boolean;
}

export default function AdminChartPicker(props: AdminChartPickerProps) {
  const {
    title,
    chartVisibility,
    onToggleChart,
    onSave,
    onCancel,
    hasChanges = false,
    saving = false,
  } = props;
  return (
    <ul className="list-group">
      <h5 className="mb-3 d-none d-lg-block">{title}</h5>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="AreaChartComp"
            checked={chartVisibility.AreaChartComp}
            onChange={() => onToggleChart("AreaChartComp")}
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="AreaChartComp"
          >
            CO₂ vs Consumo
          </label>
        </div>
      </li>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="BarChartComp"
            checked={chartVisibility.BarChartComp}
            onChange={() => onToggleChart("BarChartComp")}
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="BarChartComp"
          >
            PM promedio vs límite OMS
          </label>
        </div>
      </li>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="LineChartComp"
            checked={chartVisibility.LineChartComp}
            onChange={() => onToggleChart("LineChartComp")}
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="LineChartComp"
          >
            Relación CO₂ vs Temperatura
          </label>
        </div>
      </li>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="PieChartComp"
            checked={chartVisibility.PieChartComp}
            onChange={() => onToggleChart("PieChartComp")}
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="PieChartComp"
          >
            Distribución(%) de partículas MP
          </label>
        </div>
      </li>

      {/* BOTON DE GUARDAR/CANCELAR */}
      <li className="list-group-item d-flex gap-2 justify-content-end">
        <button
          className="btn btn-sm dashboard-btn-cancel"
          type="button"
          onClick={onCancel}
          disabled={!hasChanges || saving}
        >
          Cancelar
        </button>
        <button
          className="btn btn-sm dashboard-btn-save"
          type="button"
          onClick={onSave}
          disabled={!hasChanges || saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </li>
      {hasChanges && !saving && (
        <li className="list-group-item small text-muted save-hint">
          Tienes cambios sin guardar
        </li>
      )}
    </ul>
  );
}
