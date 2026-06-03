/** Sati između "HH:MM" i "HH:MM". Prekonoćna smjena (kraj ≤ početak) → +24h. */
export function computeHours(start: string, end: string): number {
  const [sh = 0, sm = 0] = start.split(":").map(Number);
  const [eh = 0, em = 0] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

/** Ponedjeljak 00:00 tekućeg tjedna. */
export function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = ponedjeljak
  d.setDate(d.getDate() - day);
  return d;
}

/** Prvi dan tekućeg mjeseca 00:00. */
export function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
