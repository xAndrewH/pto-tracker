export type LeaveTypeCode = "PTO" | "FLH" | "CMP" | string;

export interface LeaveType {
  id: string;
  code: LeaveTypeCode;
  name: string;
  /** CSS color, e.g. "var(--series-pto)" or a hex the user picked for a custom type. */
  color: string;
  /** Fixed types accrue by tenure automatically; custom types are manually funded per year. */
  accrualMode: "tenure" | "fixed" | "manual";
  /** For accrualMode "fixed": days granted every year regardless of tenure. */
  fixedDaysPerYear?: number;
  /** Whether unused balance can roll into the next year for this type. */
  rollsOver: boolean;
  archived?: boolean;
}

export type RequestStatus = "approved" | "pending" | "not_submitted";

export interface PtoEntry {
  id: string;
  /** ISO yyyy-mm-dd. Null when imported data couldn't be parsed and needs review. */
  date: string | null;
  /** ISO yyyy-mm-dd, inclusive. Present for multi-day requests; equals date for single days. */
  endDate: string | null;
  hours: number;
  leaveTypeId: string;
  status: RequestStatus;
  onCalendar: boolean;
  notes?: string;
  /** Set by the importer when something about the source row looked off. */
  needsReview?: boolean;
  reviewReason?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AccrualTier {
  id: string;
  label: string;
  minYears: number;
  /** null = unbounded ("10th year +") */
  maxYears: number | null;
  daysPerYear: number;
}

export interface YearRollover {
  year: number;
  hours: number;
}

export interface YearOverride {
  year: number;
  /** leaveTypeId -> days available override, bypassing tenure/fixed calculation. */
  daysAvailable: Record<string, number>;
}

export interface Settings {
  hoursPerDay: number;
  hireDate: string | null;
  rolloverCapHours: number;
  theme: "light" | "dark" | "system";
}

export interface PtoState {
  version: number;
  settings: Settings;
  leaveTypes: LeaveType[];
  accrualTiers: AccrualTier[];
  entries: PtoEntry[];
  rollovers: YearRollover[];
  yearOverrides: YearOverride[];
  selectedYear: number;
}

export interface ImportIssue {
  sheet: string;
  row: number;
  message: string;
}

export interface ImportResult {
  entries: PtoEntry[];
  issues: ImportIssue[];
  sheetsRead: string[];
}
