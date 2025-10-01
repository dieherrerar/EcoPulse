import "bootstrap/dist/css/bootstrap.min.css";
import "./estilos_componentes.css";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          href="/home"
        >
          <img
            src="/images/151-1514784_hojas-de-arbol-png-folhas-de-arvores-png-removebg-preview.png"
            alt="EcoPulse logo"
            style={{
              height: 36,
              width: 36,
              marginRight: 8,
              objectFit: "contain",
            }}
          />
          EcoPulse
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" href="/dashboard">
                Dashboards
              </Link>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link active" href="/alertas">
                Alertas
              </Link>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link active" href="/reportes">
                Reportes
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
