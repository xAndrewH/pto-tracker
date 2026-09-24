import { v4 as uuid } from "uuid";
import type { AccrualTier, LeaveType, PtoState } from "../types";

export const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  { id: uuid(), code: "PTO", name: "PTO", color: "var(--series-pto)", accrualMode: "tenure", rollsOver: true },
  { id: uuid(), code: "FLH", name: "Floating Holiday", color: "var(--series-flh)", accrualMode: "fixed", fixedDaysPerYear: 2, rollsOver: false },
  { id: uuid(), code: "CMP", name: "Comp Time", color: "var(--series-cmp)", accrualMode: "manual", rollsOver: false },
];

export const DEFAULT_ACCRUAL_TIERS: AccrualTier[] = [
  { id: uuid(), label: "Less than 1 year", minYears: 0, maxYears: 0, daysPerYear: 18 },
  { id: uuid(), label: "1st & 2nd full calendar year", minYears: 1, maxYears: 2, daysPerYear: 18 },
  { id: uuid(), label: "3rd & 4th full calendar year", minYears: 3, maxYears: 4, daysPerYear: 21 },
  { id: uuid(), label: "5th - 9th full calendar year", minYears: 5, maxYears: 9, daysPerYear: 24 },
  { id: uuid(), label: "10th full calendar year +", minYears: 10, maxYears: null, daysPerYear: 30 },
];

export function createDefaultState(): PtoState {
  return {
    version: 1,
    settings: {
      hoursPerDay: 7.5,
      hireDate: null,
      rolloverCapHours: 37.5,
      theme: "system",
    },
    leaveTypes: DEFAULT_LEAVE_TYPES,
    accrualTiers: DEFAULT_ACCRUAL_TIERS,
    entries: [],
    rollovers: [],
    yearOverrides: [],
    selectedYear: new Date().getFullYear(),
  };
}
