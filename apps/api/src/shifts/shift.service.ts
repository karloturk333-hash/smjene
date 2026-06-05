import { prisma } from "../db";
import { computeHours, startOfMonth, startOfWeek } from "../lib/time";
import type { ShiftInput, ShiftUpdate } from "./shift.schema";

// SVAKA funkcija sada prima userId i filtrira po njemu. Tako jedan korisnik
// nikad ne može pročitati ni promijeniti tuđu smjenu — izolacija podataka se
// provodi na razini upita prema bazi, ne samo u UI-u.

export function listShifts(userId: string, from?: string, to?: string) {
  const date: { gte?: Date; lte?: Date } = {};
  if (from) date.gte = new Date(from);
  if (to) date.lte = new Date(to);
  return prisma.shift.findMany({
    where: { userId, ...(from || to ? { date } : {}) },
    orderBy: { date: "desc" },
  });
}

export function getShift(userId: string, id: string) {
  // findFirst s userId u where → tuđu smjenu ni ne pronađemo (vrati null).
  return prisma.shift.findFirst({ where: { id, userId } });
}

export function createShift(userId: string, input: ShiftInput) {
  return prisma.shift.create({
    data: {
      userId, // vlasnik = trenutno prijavljeni korisnik
      date: new Date(input.date),
      startTime: input.startTime,
      endTime: input.endTime,
      hours: computeHours(input.startTime, input.endTime),
      tipsCash: input.tipsCash,
      tipsCard: input.tipsCard,
      guests: input.guests,
      venue: input.venue,
      note: input.note,
    },
  });
}

export async function updateShift(userId: string, id: string, input: ShiftUpdate) {
  // Prvo provjeri da smjena postoji I pripada ovom korisniku.
  const existing = await prisma.shift.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const startTime = input.startTime ?? existing.startTime;
  const endTime = input.endTime ?? existing.endTime;

  return prisma.shift.update({
    where: { id }, // id je unique; vlasništvo smo već potvrdili gore
    data: {
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      startTime,
      endTime,
      hours: computeHours(startTime, endTime),
      ...(input.tipsCash !== undefined ? { tipsCash: input.tipsCash } : {}),
      ...(input.tipsCard !== undefined ? { tipsCard: input.tipsCard } : {}),
      ...(input.guests !== undefined ? { guests: input.guests } : {}),
      ...(input.venue !== undefined ? { venue: input.venue } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    },
  });
}

export async function deleteShift(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.shift.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.shift.delete({ where: { id } });
  return true;
}

export type Period = "week" | "month" | "all";

const round = (n: number) => Math.round(n * 100) / 100;

export async function getStats(userId: string, period: Period) {
  const now = new Date();
  const from =
    period === "week" ? startOfWeek(now) : period === "month" ? startOfMonth(now) : undefined;

  const shifts = await prisma.shift.findMany({
    where: { userId, ...(from ? { date: { gte: from } } : {}) },
  });

  const totalCash = round(shifts.reduce((s, x) => s + x.tipsCash, 0));
  const totalCard = round(shifts.reduce((s, x) => s + x.tipsCard, 0));
  const totalTips = round(totalCash + totalCard);
  const totalHours = round(shifts.reduce((s, x) => s + x.hours, 0));

  return {
    period,
    shiftCount: shifts.length,
    totalTips,
    totalCash,
    totalCard,
    totalHours,
    tipsPerHour: totalHours ? round(totalTips / totalHours) : 0,
  };
}
