import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  tipsCash: number;
  tipsCard: number;
  guests: number;
  venue: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  period: Period;
  shiftCount: number;
  totalTips: number;
  totalCash: number;
  totalCard: number;
  totalHours: number;
  tipsPerHour: number;
}

export type Period = "week" | "month" | "all";

export interface ShiftInput {
  date: string;
  startTime: string;
  endTime: string;
  tipsCash: number;
  tipsCard: number;
  guests: number;
  venue?: string;
  note?: string;
}

async function http<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api${url}`, {
    // credentials: "include" → preglednik šalje (i prima) kolačiće. Kroz Vite
    // proxy je sve same-origin pa bi išlo i bez ovoga, ali eksplicitno je
    // otpornije (npr. ako se ikad pređe na pravi cross-origin API).
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
    const msg =
      typeof body?.error === "string" ? body.error : `Greška ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function useStats(period: Period) {
  return useQuery({
    queryKey: ["stats", period],
    queryFn: () => http<Stats>(`/stats?period=${period}`),
  });
}

export function useShifts() {
  return useQuery({ queryKey: ["shifts"], queryFn: () => http<Shift[]>("/shifts") });
}

export function useShift(id: string | undefined) {
  return useQuery({
    queryKey: ["shifts", id],
    queryFn: () => http<Shift>(`/shifts/${id}`),
    enabled: Boolean(id),
  });
}

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["shifts"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
  };
}

export function useCreateShift() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: ShiftInput) =>
      http<Shift>("/shifts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: invalidate,
  });
}

export function useUpdateShift(id: string) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: ShiftInput) =>
      http<Shift>(`/shifts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: invalidate,
  });
}

export function useDeleteShift() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => http<void>(`/shifts/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

/**
 * Dohvati trenutnog korisnika. VAŽNO: 401 (nisam prijavljen) NIJE greška nego
 * legitimno stanje "user = null", pa ga ne bacamo — inače bi useQuery stalno bio
 * u errored stanju za odjavljene korisnike.
 */
async function fetchMe(): Promise<User | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Greška ${res.status}`);
  const body = (await res.json()) as { user: User };
  return body.user;
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: Credentials) =>
      http<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(creds) }),
    // Upisom u cache ["me"] odmah znamo tko je prijavljen, bez novog requesta.
    onSuccess: (data) => qc.setQueryData(["me"], data.user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: Credentials) =>
      http<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(creds) }),
    onSuccess: (data) => qc.setQueryData(["me"], data.user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http<void>("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      // Očisti tuđe podatke iz cachea i postavi "nema korisnika".
      qc.removeQueries({ queryKey: ["shifts"] });
      qc.removeQueries({ queryKey: ["stats"] });
      qc.setQueryData(["me"], null);
    },
  });
}
