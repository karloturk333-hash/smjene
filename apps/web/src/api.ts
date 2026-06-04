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
