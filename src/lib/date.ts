const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Formats a Date as a local (not UTC) yyyy-mm-dd string. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/**
 * Best-effort parse of messy free-text dates found in real-world spreadsheets:
 * weekday names, ordinal suffixes, stray commas/spaces, typos in the weekday,
 * and dates missing a year (falls back to `fallbackYear`).
 */
export function parseLooseDate(raw: string, fallbackYear?: number): string | null {
  let s = raw.trim();
  if (!s) return null;

  // Strip a leading weekday word (tolerate typos: keep only letters, compare loosely)
  s = s.replace(/^[A-Za-z]+\.?,?\s+/, (match) => {
    const word = match.replace(/[.,]/g, "").trim().toLowerCase();
    const looksLikeWeekday = /^(mon|tue|wed|thu|fri|sat|sun)/.test(word) || word.length <= 8;
    return looksLikeWeekday && !MONTHS.some((m) => m.startsWith(word.slice(0, 3))) ? "" : match;
  });

  // Normalize ordinal suffixes (1st, 22nd, 3rd, 4th) and stray commas/double spaces
  s = s
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();

  const monthDayYear = s.match(/([A-Za-z]+)\.?\s+(\d{1,2}),?\s*(\d{4})?/);
  if (monthDayYear) {
    const monthWord = monthDayYear[1].toLowerCase();
    const monthIdx = MONTHS.findIndex((m) => m.startsWith(monthWord.slice(0, 3)));
    if (monthIdx >= 0) {
      const day = parseInt(monthDayYear[2], 10);
      const year = monthDayYear[3] ? parseInt(monthDayYear[3], 10) : fallbackYear;
      if (year && day >= 1 && day <= 31) {
        const d = new Date(year, monthIdx, day);
        if (d.getMonth() === monthIdx && d.getDate() === day) return toIsoDate(d);
      }
    }
  }

  const native = new Date(s);
  if (!isNaN(native.getTime())) return toIsoDate(native);

  return null;
}

export function daysBetweenInclusive(startIso: string, endIso: string): number {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export function yearsOfService(hireDateIso: string, asOfYear: number): number {
  const hire = parseIsoDate(hireDateIso);
  return asOfYear - hire.getFullYear();
}

export function fullCalendarYearsCompleted(hireDateIso: string, asOfYear: number): number {
  const hire = parseIsoDate(hireDateIso);
  // "full calendar years" counts complete Jan1-Dec31 years after the hire year.
  return Math.max(0, asOfYear - hire.getFullYear() - 1);
}
