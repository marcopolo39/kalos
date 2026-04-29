export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr + "T12:00:00"));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr + "T12:00:00"));
}

export function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr + "T12:00:00"));
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(Math.abs(Date.parse(b) - Date.parse(a)) / msPerDay);
}

export function monthsBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.abs(Date.parse(b) - Date.parse(a)) / msPerDay;
  return Math.round(days / 30.44);
}

export function ordinal(n: number): string {
  const abs = Math.round(Math.abs(n));
  const s = ["th", "st", "nd", "rd"];
  const v = abs % 100;
  return abs + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
