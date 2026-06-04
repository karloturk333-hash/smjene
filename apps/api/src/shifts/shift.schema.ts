import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Očekuje se format HH:MM");

export const shiftInputSchema = z.object({
  /** ISO datum, npr. "2026-06-03". */
  date: z.string().min(1, "Datum je obavezan"),
  startTime: time,
  endTime: time,
  tipsCash: z.number().min(0).default(0),
  tipsCard: z.number().min(0).default(0),
  guests: z.number().int().min(0).default(0),
  venue: z.string().max(120).optional(),
  note: z.string().max(500).optional(),
});

export const shiftUpdateSchema = shiftInputSchema.partial();

export type ShiftInput = z.infer<typeof shiftInputSchema>;
export type ShiftUpdate = z.infer<typeof shiftUpdateSchema>;
