// Pure date utility functions - no localStorage access

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function parseYmd(s: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

export function ymd(year: number, month: number, day: number): string {
  return String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Monday=1 ... Sunday=7
export function dayOfWeek(year: number, month: number, day: number): number {
  const d = new Date(year, month - 1, day);
  return d.getDay() === 0 ? 7 : d.getDay();
}

export function isSameDate(a: string, b: string): boolean {
  return a === b;
}

export function getStartOfWeek(date: string): string {
  const p = parseYmd(date);
  if (!p) return date;
  const d = new Date(p.year, p.month - 1, p.day);
  const dow = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - dow + 1);
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function getEndOfWeek(date: string): string {
  const p = parseYmd(date);
  if (!p) return date;
  const d = new Date(p.year, p.month - 1, p.day);
  const dow = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - dow + 7);
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
}