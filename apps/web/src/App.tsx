import { Link, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ShiftFormPage } from "./pages/ShiftFormPage";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container app-header__inner">
          <Link to="/" className="brand">
            <span className="brand__mark">€</span>
            <span>
              <strong>Napojnice</strong>
              <span className="brand__sub">smjene i bakšiš</span>
            </span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav__link">Pregled</Link>
            <Link to="/smjene/nova" className="btn btn--primary">+ Nova smjena</Link>
          </nav>
        </div>
      </header>

      <main className="container app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/smjene/nova" element={<ShiftFormPage />} />
          <Route path="/smjene/:id" element={<ShiftFormPage />} />
        </Routes>
      </main>
    </div>
  );
}
