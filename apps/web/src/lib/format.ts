const eurFmt = new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" });

export const eur = (n: number) => eurFmt.format(n);

export const hoursFmt = (n: number) =>
  `${n.toLocaleString("hr-HR", { maximumFractionDigits: 2 })} h`;

export const dateHr = (iso: string) =>
  new Date(iso).toLocaleDateString("hr-HR", { day: "numeric", month: "short", year: "numeric" });

export const weekdayHr = (iso: string) =>
  new Date(iso).toLocaleDateString("hr-HR", { weekday: "long" });
