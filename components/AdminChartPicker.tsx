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
}

export default function AdminChartPicker(props: AdminChartPickerProps) {
  const { title, chartVisibility, onToggleChart } = props;
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
            htmlFor="firstCheckbox"
          >
            Area Chart
          </label>
        </div>
      </li>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="AreaChartComp"
            checked={chartVisibility.BarChartComp}
            onChange={() => onToggleChart("BarChartComp")}
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="secondCheckbox"
          >
            Bar Chart
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
            htmlFor="thirdCheckbox"
          >
            Line Chart
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
            htmlFor="thirdCheckbox"
          >
            Pie Chart
          </label>
        </div>
      </li>
    </ul>
  );
}
