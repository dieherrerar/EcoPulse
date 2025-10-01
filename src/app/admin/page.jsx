"use client";
import React, { useState } from "react";

export default function Admin() {
  const [form, setForm] = useState({ email: "", password: "", rut: "" });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación
    alert("Login enviado: " + JSON.stringify(form));
  };
  return (
    <div
      className="login-admin-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #9dbb9e 0%, #1d6d1b 100%)",
      }}
    >
      <form
        className="login-admin-form"
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 32px rgba(30,80,60,0.10)",
          padding: 32,
          minWidth: 320,
          maxWidth: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h2 style={{ textAlign: "center", color: "#1d6d1b", marginBottom: 12 }}>
          Login Administrador
        </h2>
        <label style={{ color: "#184d2b", fontWeight: 500 }}>
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="form-control"
            style={{ marginTop: 4 }}
            placeholder="correo@ejemplo.com"
          />
        </label>
        <label style={{ color: "#184d2b", fontWeight: 500 }}>
          Contraseña
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="form-control"
            style={{ marginTop: 4 }}
            placeholder="********"
          />
        </label>
        <label style={{ color: "#184d2b", fontWeight: 500 }}>
          RUT
          <input
            type="text"
            name="rut"
            value={form.rut}
            onChange={handleChange}
            required
            className="form-control"
            style={{ marginTop: 4 }}
            placeholder="12.345.678-9"
          />
        </label>
        <button
          type="submit"
          className="btn btn-success"
          style={{ marginTop: 12, fontWeight: 600, letterSpacing: 1 }}
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
