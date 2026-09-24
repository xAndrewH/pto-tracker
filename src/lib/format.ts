export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatDays(n: number): string {
  const r = round1(n);
  return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)}`;
}

export function formatHours(n: number): string {
  const r = round1(n);
  return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)}`;
}

export function pluralize(n: number, word: string): string {
  return `${word}${Math.abs(n) === 1 ? "" : "s"}`;
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
