import type { AccrualTier, LeaveType, PtoState } from "../types";
import { fullCalendarYearsCompleted } from "./date";

export function findAccrualTier(tiers: AccrualTier[], fullYears: number): AccrualTier | undefined {
  return tiers.find((t) => fullYears >= t.minYears && (t.maxYears === null || fullYears <= t.maxYears));
}

/** Base days granted to a leave type for a year, before rollover, before any usage. */
export function baseDaysAvailable(state: PtoState, leaveType: LeaveType, year: number): number {
  const override = state.yearOverrides.find((o) => o.year === year)?.daysAvailable[leaveType.id];
  if (override !== undefined) return override;

  if (leaveType.accrualMode === "fixed") return leaveType.fixedDaysPerYear ?? 0;

  if (leaveType.accrualMode === "tenure") {
    if (!state.settings.hireDate) return 0;
    const fullYears = fullCalendarYearsCompleted(state.settings.hireDate, year);
    const tier = findAccrualTier(state.accrualTiers, fullYears);
    return tier?.daysPerYear ?? 0;
  }

  return 0;
}

/** Rollover hours credited into `year` for a given leave type (only types with rollsOver get any). */
export function rolloverHoursFor(state: PtoState, leaveType: LeaveType, year: number): number {
  if (!leaveType.rollsOver) return 0;
  return state.rollovers.find((r) => r.year === year)?.hours ?? 0;
}

export interface YearTypeBalance {
  leaveType: LeaveType;
  baseDays: number;
  rolloverHours: number;
  availableHours: number;
  availableDays: number;
  usedHours: number;
  usedDays: number;
  remainingHours: number;
  remainingDays: number;
}

export function computeYearBalance(state: PtoState, leaveType: LeaveType, year: number): YearTypeBalance {
  const hoursPerDay = state.settings.hoursPerDay || 7.5;
  const baseDays = baseDaysAvailable(state, leaveType, year);
  const rollover = rolloverHoursFor(state, leaveType, year);
  const availableHours = baseDays * hoursPerDay + rollover;

  const usedHours = state.entries
    .filter((e) => e.leaveTypeId === leaveType.id && e.date && new Date(e.date).getFullYear() === year)
    .reduce((sum, e) => sum + e.hours, 0);

  return {
    leaveType,
    baseDays,
    rolloverHours: rollover,
    availableHours,
    availableDays: availableHours / hoursPerDay,
    usedHours,
    usedDays: usedHours / hoursPerDay,
    remainingHours: availableHours - usedHours,
    remainingDays: (availableHours - usedHours) / hoursPerDay,
  };
}
