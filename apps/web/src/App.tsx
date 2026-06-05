import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useLogout } from "./api";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { ShiftFormPage } from "./pages/ShiftFormPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

/** Zaglavlje: navigacija + (kad je prijavljen) email i gumb za odjavu. */
function Header() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  return (
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
          {user && (
            <>
              <Link to="/" className="nav__link">Pregled</Link>
              <Link to="/smjene/nova" className="btn btn--primary">+ Nova smjena</Link>
              <span className="nav__user muted">{user.email}</span>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/login") })}
                disabled={logout.isPending}
              >
                Odjava
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    // AuthProvider je unutar Routera (iz main.tsx) i QueryClienta, pa smije
    // koristiti useQuery i useNavigate. Sve ispod njega zna tko je prijavljen.
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="container app-main">
          <Routes>
            {/* Javne rute */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Zaštićene rute — ProtectedRoute prvo provjeri sesiju */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/smjene/nova" element={<ShiftFormPage />} />
              <Route path="/smjene/:id" element={<ShiftFormPage />} />
            </Route>

            {/* Sve ostalo → na početnu (koja je i sama zaštićena) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
