import { createContext, useContext, type ReactNode } from "react";
import { useMe, type User } from "../api";

/**
 * AuthContext — jedan izvor istine o tome tko je prijavljen. Pozadinski je samo
 * TanStack Query poziv na /api/auth/me. Bilo koja komponenta dobije korisnika
 * preko useAuth() bez da sama radi fetch.
 */
interface AuthValue {
  user: User | null;
  isLoading: boolean; // dok ne znamo (prvi /me još traje) izbjegavamo "trzaj" na /login
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const value: AuthValue = {
    user: me.data ?? null,
    isLoading: me.isLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth se mora koristiti unutar <AuthProvider>");
  return ctx;
}
