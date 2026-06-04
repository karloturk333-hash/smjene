import { prisma } from "../db";
import { computeHours, startOfMonth, startOfWeek } from "../lib/time";
import type { ShiftInput, ShiftUpdate } from "./shift.schema";

export function listShifts(from?: string, to?: string) {
  const date: { gte?: Date; lte?: Date } = {};
  if (from) date.gte = new Date(from);
  if (to) date.lte = new Date(to);
  return prisma.shift.findMany({
    where: from || to ? { date } : undefined,
    orderBy: { date: "desc" },
  });
}

export function getShift(id: string) {
  return prisma.shift.findUnique({ where: { id } });
}

export function createShift(input: ShiftInput) {
  return prisma.shift.create({
    data: {
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

export async function updateShift(id: string, input: ShiftUpdate) {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) return null;

  const startTime = input.startTime ?? existing.startTime;
  const endTime = input.endTime ?? existing.endTime;

  return prisma.shift.update({
    where: { id },
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

export async function deleteShift(id: string): Promise<boolean> {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.shift.delete({ where: { id } });
  return true;
}

export type Period = "week" | "month" | "all";

const round = (n: number) => Math.round(n * 100) / 100;

export async function getStats(period: Period) {
  const now = new Date();
  const from =
    period === "week" ? startOfWeek(now) : period === "month" ? startOfMonth(now) : undefined;

  const shifts = await prisma.shift.findMany({
    where: from ? { date: { gte: from } } : undefined,
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
