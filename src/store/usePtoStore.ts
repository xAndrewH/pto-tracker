import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  AccrualTier,
  LeaveType,
  PtoEntry,
  PtoState,
  RequestStatus,
  YearOverride,
} from "../types";
import { createDefaultState } from "./defaults";

interface PtoActions {
  setSettings: (patch: Partial<PtoState["settings"]>) => void;
  setSelectedYear: (year: number) => void;

  addLeaveType: (type: Omit<LeaveType, "id">) => void;
  updateLeaveType: (id: string, patch: Partial<LeaveType>) => void;
  archiveLeaveType: (id: string) => void;

  addAccrualTier: (tier: Omit<AccrualTier, "id">) => void;
  updateAccrualTier: (id: string, patch: Partial<AccrualTier>) => void;
  removeAccrualTier: (id: string) => void;

  addEntry: (entry: Omit<PtoEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateEntry: (id: string, patch: Partial<PtoEntry>) => void;
  removeEntry: (id: string) => void;
  setEntryStatus: (id: string, status: RequestStatus) => void;
  importEntries: (entries: PtoEntry[]) => void;

  setRollover: (year: number, hours: number) => void;
  setYearOverride: (year: number, leaveTypeId: string, days: number | undefined) => void;

  replaceAll: (state: PtoState) => void;
  resetAll: () => void;
}

export type PtoStore = PtoState & PtoActions;

const STORAGE_KEY = "pto-tracker-state";

export const usePtoStore = create<PtoStore>()(
  persist(
    (set) => ({
      ...createDefaultState(),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setSelectedYear: (year) => set({ selectedYear: year }),

      addLeaveType: (type) =>
        set((s) => ({ leaveTypes: [...s.leaveTypes, { ...type, id: uuid() }] })),
      updateLeaveType: (id, patch) =>
        set((s) => ({
          leaveTypes: s.leaveTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      archiveLeaveType: (id) =>
        set((s) => ({
          leaveTypes: s.leaveTypes.map((t) => (t.id === id ? { ...t, archived: true } : t)),
        })),

      addAccrualTier: (tier) =>
        set((s) => ({ accrualTiers: [...s.accrualTiers, { ...tier, id: uuid() }] })),
      updateAccrualTier: (id, patch) =>
        set((s) => ({
          accrualTiers: s.accrualTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeAccrualTier: (id) =>
        set((s) => ({ accrualTiers: s.accrualTiers.filter((t) => t.id !== id) })),

      addEntry: (entry) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { ...entry, id: uuid(), createdAt: Date.now(), updatedAt: Date.now() },
          ],
        })),
      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
          ),
        })),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      setEntryStatus: (id, status) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, status, updatedAt: Date.now() } : e)),
        })),
      importEntries: (entries) => set((s) => ({ entries: [...s.entries, ...entries] })),

      setRollover: (year, hours) =>
        set((s) => {
          const existing = s.rollovers.find((r) => r.year === year);
          return {
            rollovers: existing
              ? s.rollovers.map((r) => (r.year === year ? { ...r, hours } : r))
              : [...s.rollovers, { year, hours }],
          };
        }),
      setYearOverride: (year, leaveTypeId, days) =>
        set((s) => {
          const existing = s.yearOverrides.find((o) => o.year === year);
          const daysAvailable = { ...(existing?.daysAvailable ?? {}) };
          if (days === undefined) delete daysAvailable[leaveTypeId];
          else daysAvailable[leaveTypeId] = days;
          const next: YearOverride = { year, daysAvailable };
          return {
            yearOverrides: existing
              ? s.yearOverrides.map((o) => (o.year === year ? next : o))
              : [...s.yearOverrides, next],
          };
        }),

      replaceAll: (state) => set({ ...state }),
      resetAll: () => set({ ...createDefaultState() }),
    }),
    { name: STORAGE_KEY }
  )
);
