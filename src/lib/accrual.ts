import type { AccrualTier, LeaveType, PtoState } from "../types";
import { fullCalendarYearsCompleted } from "./date";

export function findAccrualTier(tiers: AccrualTier[], fullYears: number): AccrualTier | undefined {
  return tiers.find((t) => fullYears >= t.minYears && (t.maxYears === null || fullYears <= t.maxYears));
}

export function yearOverrideDays(state: PtoState, leaveType: LeaveType, year: number): number | undefined {
  return state.yearOverrides.find((o) => o.year === year)?.daysAvailable[leaveType.id];
}

/** Computed days granted to a leave type for a year from policy alone (tenure tier or fixed amount),
 *  ignoring any year override. Used as the starting point for years without one. */
export function computedDaysAvailable(state: PtoState, leaveType: LeaveType, year: number): number {
  if (leaveType.accrualMode === "fixed") return leaveType.fixedDaysPerYear ?? 0;

  if (leaveType.accrualMode === "tenure") {
    if (!state.settings.hireDate) return 0;
    const fullYears = fullCalendarYearsCompleted(state.settings.hireDate, year);
    const tier = findAccrualTier(state.accrualTiers, fullYears);
    return tier?.daysPerYear ?? 0;
  }

  return 0;
}

/** Base days granted to a leave type for a year, before rollover, before any usage. */
export function baseDaysAvailable(state: PtoState, leaveType: LeaveType, year: number): number {
  const override = yearOverrideDays(state, leaveType, year);
  return override !== undefined ? override : computedDaysAvailable(state, leaveType, year);
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
  const override = yearOverrideDays(state, leaveType, year);
  // An explicit override is the final, already-complete figure for that year (as recorded historically) —
  // rollover only gets added on top for years computed fresh from tenure/fixed policy, so it's never double-counted.
  const baseDays = override !== undefined ? override : computedDaysAvailable(state, leaveType, year);
  const rollover = override !== undefined ? 0 : rolloverHoursFor(state, leaveType, year);
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
