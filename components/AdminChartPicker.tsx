"use client";
import React from "react";

interface AdminChartPickerProps {
  title: string;
}

export default function AdminChartPicker(props: AdminChartPickerProps) {
  const { title } = props;
  return (
    <ul className="list-group">
      <h5 className="mb-3 d-none d-lg-block">{title}</h5>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            value=""
            id="firstCheckbox"
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="firstCheckbox"
          >
            First checkbox
          </label>
        </div>
      </li>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            value=""
            id="secondCheckbox"
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="secondCheckbox"
          >
            Second checkbox
          </label>
        </div>
      </li>
      <li className="list-group-item">
        <div className="form-check">
          <input
            className="form-check-input me-2"
            type="checkbox"
            value=""
            id="thirdCheckbox"
          />
          <label
            className="form-check-label small text-muted"
            htmlFor="thirdCheckbox"
          >
            Third checkbox
          </label>
        </div>
      </li>
    </ul>
  );
}
