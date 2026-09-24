import type { PtoState } from "../types";

type YearInputs = Pick<PtoState, "entries" | "rollovers" | "yearOverrides" | "selectedYear">;

export function availableYears(state: YearInputs): number[] {
  const now = new Date().getFullYear();
  const years = new Set<number>([now - 1, now, now + 1, state.selectedYear]);
  for (const e of state.entries) {
    if (e.date) years.add(new Date(e.date).getFullYear());
  }
  for (const r of state.rollovers) years.add(r.year);
  for (const o of state.yearOverrides) years.add(o.year);
  return [...years].sort((a, b) => b - a);
}
