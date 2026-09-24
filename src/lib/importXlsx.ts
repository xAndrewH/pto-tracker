import type { ImportIssue, ImportResult, PtoEntry, RequestStatus } from "../types";
import { parseLooseDate, toIsoDate } from "./date";

const HEADER_ALIASES: Record<string, string> = {
  date: "date",
  hours: "hours",
  hrs: "hours",
  day: "days",
  days: "days",
  "approved?": "approved",
  approved: "approved",
  "put in calendar?": "calendar",
  "put in calendar": "calendar",
  type: "type",
};

function normalizeHeader(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? null;
}

function normalizeStatus(raw: unknown): RequestStatus {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "yes") return "approved";
  if (s === "pending") return "pending";
  return "not_submitted";
}

function cellToText(v: unknown): string {
  if (v instanceof Date) return toIsoDate(v);
  return String(v ?? "").trim();
}

interface ImportOptions {
  hoursPerDay: number;
  /** Leave type code (e.g. "PTO") -> leaveTypeId in the current app state. */
  typeCodeToId: Record<string, string>;
  defaultTypeId: string;
}

export function isPtoTrackingSheet(sheetName: string): boolean {
  return /pto.*track/i.test(sheetName);
}

export function sheetYear(sheetName: string): number | null {
  const m = sheetName.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

/** Finds the contiguous span of header columns starting at "Date", stopping at the first blank
 *  header cell (which separates the log table from the side summary tables in these workbooks). */
function findHeaderSpan(headerRow: unknown[]): { start: number; end: number } | null {
  const dateIdx = headerRow.findIndex((c) => normalizeHeader(c) === "date");
  if (dateIdx === -1) return null;
  let end = dateIdx;
  for (let i = dateIdx; i < headerRow.length; i++) {
    if (headerRow[i] === undefined || String(headerRow[i]).trim() === "") break;
    end = i;
  }
  return { start: dateIdx, end };
}

function parseSheet(
  sheetName: string,
  rows: unknown[][],
  opts: ImportOptions
): { entries: PtoEntry[]; issues: ImportIssue[] } {
  const entries: PtoEntry[] = [];
  const issues: ImportIssue[] = [];
  const fallbackYear = sheetYear(sheetName) ?? new Date().getFullYear();

  let headerRowIdx = -1;
  let span: { start: number; end: number } | null = null;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const found = findHeaderSpan(rows[i] ?? []);
    if (found) {
      headerRowIdx = i;
      span = found;
      break;
    }
  }
  if (headerRowIdx === -1 || !span) {
    issues.push({ sheet: sheetName, row: 0, message: 'Could not find a "Date" header row — sheet skipped.' });
    return { entries, issues };
  }

  const colRole: Record<number, string> = {};
  for (let c = span.start; c <= span.end; c++) {
    const role = normalizeHeader(rows[headerRowIdx][c]);
    if (role) colRole[c] = role;
  }
  const colOf = (role: string) => Object.entries(colRole).find(([, r]) => r === role)?.[0];
  const dateCol = colOf("date");
  const hoursCol = colOf("hours");
  const daysCol = colOf("days");
  const typeCol = colOf("type");
  const approvedCol = colOf("approved");
  const calendarCol = colOf("calendar");
  if (!dateCol) return { entries, issues };

  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const dateRaw = row[Number(dateCol)];
    const typeRaw = typeCol ? row[Number(typeCol)] : undefined;
    const dateText = cellToText(dateRaw);
    const typeText = cellToText(typeRaw);
    if (!dateText && !typeText) continue; // blank spacer / totals row

    const reasons: string[] = [];

    let iso: string | null = null;
    if (dateRaw instanceof Date) {
      iso = toIsoDate(dateRaw);
    } else if (dateText) {
      iso = parseLooseDate(dateText, fallbackYear);
    }
    if (!iso) {
      reasons.push(dateText ? `Could not parse date "${dateText}"` : "Missing date");
    } else if (iso.slice(0, 4) !== String(fallbackYear)) {
      reasons.push(`Date "${dateText}" parsed as ${iso} but is on the "${sheetName}" tab — likely a typo in the year`);
    }

    const code = typeText.toUpperCase();
    let leaveTypeId = opts.typeCodeToId[code];
    if (!leaveTypeId) {
      leaveTypeId = opts.defaultTypeId;
      reasons.push(code ? `Unrecognized type "${typeText}", defaulted to PTO` : "Missing type, defaulted to PTO");
    }

    let hours: number | null = hoursCol ? parseFloat(String(row[Number(hoursCol)])) : NaN;
    if (hours === null || isNaN(hours)) {
      const days = daysCol ? parseFloat(String(row[Number(daysCol)])) : NaN;
      hours = !isNaN(days) ? days * opts.hoursPerDay : opts.hoursPerDay;
      if (isNaN(days)) {
        reasons.push("Missing hours/days, assumed one full day");
      }
    }

    const needsReview = reasons.length > 0;
    const reviewReason = reasons[0];
    for (const message of reasons) issues.push({ sheet: sheetName, row: r + 1, message });

    const status = approvedCol ? normalizeStatus(row[Number(approvedCol)]) : "not_submitted";
    const onCalendar = calendarCol ? normalizeStatus(row[Number(calendarCol)]) === "approved" : true;

    entries.push({
      id: crypto.randomUUID(),
      date: iso,
      endDate: iso,
      hours,
      leaveTypeId,
      status,
      onCalendar,
      needsReview,
      reviewReason,
      notes: needsReview ? `Imported from "${sheetName}" row ${r + 1}: "${dateText}"` : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return { entries, issues };
}

export async function importPtoWorkbook(file: File, opts: ImportOptions): Promise<ImportResult> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  const entries: PtoEntry[] = [];
  const issues: ImportIssue[] = [];
  const sheetsRead: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    if (!isPtoTrackingSheet(sheetName)) continue;
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: "" });
    const result = parseSheet(sheetName, rows, opts);
    entries.push(...result.entries);
    issues.push(...result.issues);
    sheetsRead.push(sheetName);
  }

  return { entries, issues, sheetsRead };
}
