import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Omotač za zaštićene rute. Dok provjeravamo sesiju (isLoading) pokažemo kratko
 * "Učitavanje…" da ne bljesne login. Ako korisnik nije prijavljen → preusmjeri
 * na /login. Inače renderaj traženu rutu (<Outlet/> = ugniježđena ruta).
 *
 * VAŽNO: ovo je samo UX zaštita. Prava sigurnost je na serveru — svaka
 * /api/shifts i /api/stats ruta ionako traži valjanu sesiju (requireAuth).
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p className="muted">Učitavanje…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
