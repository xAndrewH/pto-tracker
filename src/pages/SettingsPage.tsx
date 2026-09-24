import { useRef, useState } from "react";
import { Plus, Trash2, Pencil, FileSpreadsheet, Download, Upload, RotateCcw, Archive } from "lucide-react";
import { usePtoStore } from "../store/usePtoStore";
import { ImportModal } from "../components/ImportModal";
import { LeaveTypeDot } from "../components/Meter";
import type { AccrualTier, LeaveType, PtoState } from "../types";

const inputClasses =
  "w-full bg-page border border-border-c text-ink text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pto/60 transition-colors";
const labelClasses = "text-xs font-medium text-ink-secondary mb-1 block";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border-c rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

const COLOR_OPTIONS = [
  { label: "Blue", value: "var(--series-pto)" },
  { label: "Orange", value: "var(--series-flh)" },
  { label: "Aqua", value: "var(--series-cmp)" },
  { label: "Violet", value: "#4a3aa7" },
  { label: "Magenta", value: "#e87ba4" },
  { label: "Yellow", value: "#eda100" },
];

function LeaveTypeEditor({ type, onSave, onCancel }: { type: LeaveType; onSave: (t: LeaveType) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(type);
  return (
    <div className="border border-pto/30 bg-pto/5 rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClasses}>Name</label>
          <input className={inputClasses} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div>
          <label className={labelClasses}>Code</label>
          <input
            className={inputClasses}
            value={draft.code}
            maxLength={8}
            onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Color</label>
        <div className="flex gap-1.5 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.label}
              onClick={() => setDraft({ ...draft, color: c.value })}
              className="w-6 h-6 rounded-full ring-offset-2 ring-offset-surface transition-all"
              style={{ background: c.value, outline: draft.color === c.value ? `2px solid ${c.value}` : "none", outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className={labelClasses}>How it's funded each year</label>
        <select
          className={inputClasses}
          value={draft.accrualMode}
          onChange={(e) => setDraft({ ...draft, accrualMode: e.target.value as LeaveType["accrualMode"] })}
        >
          <option value="tenure">By tenure (accrual table)</option>
          <option value="fixed">Fixed days every year</option>
          <option value="manual">Manual / earned as-needed</option>
        </select>
      </div>
      {draft.accrualMode === "fixed" && (
        <div>
          <label className={labelClasses}>Days per year</label>
          <input
            type="number"
            step="0.5"
            className={inputClasses}
            value={draft.fixedDaysPerYear ?? 0}
            onChange={(e) => setDraft({ ...draft, fixedDaysPerYear: parseFloat(e.target.value) || 0 })}
          />
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          checked={draft.rollsOver}
          onChange={(e) => setDraft({ ...draft, rollsOver: e.target.checked })}
          className="rounded accent-[var(--series-pto)]"
        />
        Unused balance can roll into next year
      </label>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-sm font-medium text-ink-secondary px-3 py-1.5">
          Cancel
        </button>
        <button
          onClick={() => onSave(draft)}
          className="bg-pto hover:opacity-90 text-white text-sm font-semibold rounded-lg px-3 py-1.5 transition-opacity"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function LeaveTypesSection() {
  const leaveTypes = usePtoStore((s) => s.leaveTypes);
  const addLeaveType = usePtoStore((s) => s.addLeaveType);
  const updateLeaveType = usePtoStore((s) => s.updateLeaveType);
  const archiveLeaveType = usePtoStore((s) => s.archiveLeaveType);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  return (
    <Section title="Leave types" description="What kinds of time off you track, and how each one is funded.">
      <div className="space-y-2">
        {leaveTypes.map((t) =>
          editingId === t.id ? (
            <LeaveTypeEditor key={t.id} type={t} onSave={(next) => { updateLeaveType(t.id, next); setEditingId(null); }} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={t.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-c ${t.archived ? "opacity-50" : ""}`}>
              <LeaveTypeDot color={t.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">
                  {t.name} <span className="text-ink-muted font-normal">({t.code})</span>
                </p>
                <p className="text-xs text-ink-muted">
                  {t.accrualMode === "tenure" ? "By tenure" : t.accrualMode === "fixed" ? `${t.fixedDaysPerYear} days/year fixed` : "Manual"}
                  {t.rollsOver ? " · rolls over" : ""}
                  {t.archived ? " · archived" : ""}
                </p>
              </div>
              {!t.archived && (
                <>
                  <button onClick={() => setEditingId(t.id)} aria-label="Edit" className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => archiveLeaveType(t.id)} aria-label="Archive" className="p-1.5 text-ink-muted hover:text-critical rounded-lg hover:bg-surface-2 transition-colors">
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )
        )}
        {editingId === "new" && (
          <LeaveTypeEditor
            type={{ id: "", code: "", name: "", color: COLOR_OPTIONS[0].value, accrualMode: "manual", rollsOver: false }}
            onSave={(t) => { addLeaveType(t); setEditingId(null); }}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
      {editingId !== "new" && (
        <button
          onClick={() => setEditingId("new")}
          className="flex items-center gap-1.5 text-sm font-medium text-pto hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add leave type
        </button>
      )}
    </Section>
  );
}

function AccrualSection() {
  const tiers = usePtoStore((s) => s.accrualTiers);
  const addTier = usePtoStore((s) => s.addAccrualTier);
  const updateTier = usePtoStore((s) => s.updateAccrualTier);
  const removeTier = usePtoStore((s) => s.removeAccrualTier);
  const hireDate = usePtoStore((s) => s.settings.hireDate);
  const setSettings = usePtoStore((s) => s.setSettings);
  const hoursPerDay = usePtoStore((s) => s.settings.hoursPerDay);

  function patch(id: string, field: keyof AccrualTier, value: string) {
    if (field === "label") return updateTier(id, { label: value });
    if (field === "maxYears") return updateTier(id, { maxYears: value === "" ? null : Number(value) });
    updateTier(id, { [field]: Number(value) } as Partial<AccrualTier>);
  }

  return (
    <Section title="PTO accrual by tenure" description="Used for any leave type set to “by tenure”.">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>Hire date</label>
          <input
            type="date"
            className={inputClasses}
            value={hireDate ?? ""}
            onChange={(e) => setSettings({ hireDate: e.target.value || null })}
          />
        </div>
        <div>
          <label className={labelClasses}>Hours per full day</label>
          <input
            type="number"
            step="0.25"
            className={inputClasses}
            value={hoursPerDay}
            onChange={(e) => setSettings({ hoursPerDay: parseFloat(e.target.value) || 7.5 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        {tiers.map((t) => (
          <div key={t.id} className="grid grid-cols-[1fr_4rem_4rem_4rem_auto] gap-2 items-center">
            <input className={inputClasses} value={t.label} onChange={(e) => patch(t.id, "label", e.target.value)} />
            <input
              type="number"
              className={inputClasses}
              value={t.minYears}
              title="Min years"
              onChange={(e) => patch(t.id, "minYears", e.target.value)}
            />
            <input
              type="number"
              className={inputClasses}
              value={t.maxYears ?? ""}
              placeholder="∞"
              title="Max years"
              onChange={(e) => patch(t.id, "maxYears", e.target.value)}
            />
            <input
              type="number"
              step="0.5"
              className={inputClasses}
              value={t.daysPerYear}
              title="Days/year"
              onChange={(e) => patch(t.id, "daysPerYear", e.target.value)}
            />
            <button onClick={() => removeTier(t.id)} aria-label="Remove tier" className="p-1.5 text-ink-muted hover:text-critical rounded-lg hover:bg-surface-2 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_4rem_4rem_4rem_auto] gap-2 text-xs text-ink-muted px-0.5">
          <span>Label</span>
          <span>Min yrs</span>
          <span>Max yrs</span>
          <span>Days/yr</span>
          <span />
        </div>
      </div>
      <button
        onClick={() => addTier({ label: "New tier", minYears: 0, maxYears: null, daysPerYear: 15 })}
        className="flex items-center gap-1.5 text-sm font-medium text-pto hover:opacity-80 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
        Add tier
      </button>
    </Section>
  );
}

function RolloverSection() {
  const rollovers = usePtoStore((s) => s.rollovers);
  const setRollover = usePtoStore((s) => s.setRollover);
  const rolloverCapHours = usePtoStore((s) => s.settings.rolloverCapHours);
  const setSettings = usePtoStore((s) => s.setSettings);
  const selectedYear = usePtoStore((s) => s.selectedYear);

  const years = Array.from({ length: 6 }, (_, i) => selectedYear - 4 + i);

  return (
    <Section title="Rollover" description="Hours of unused balance carried into each year.">
      <div className="max-w-[12rem]">
        <label className={labelClasses}>Rollover cap (hours)</label>
        <input
          type="number"
          step="0.5"
          className={inputClasses}
          value={rolloverCapHours}
          onChange={(e) => setSettings({ rolloverCapHours: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {years.map((y) => (
          <div key={y}>
            <label className={labelClasses}>{y}</label>
            <input
              type="number"
              step="0.25"
              className={inputClasses}
              value={rollovers.find((r) => r.year === y)?.hours ?? 0}
              onChange={(e) => setRollover(y, parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

function DataSection() {
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceAll = usePtoStore((s) => s.replaceAll);
  const resetAll = usePtoStore((s) => s.resetAll);
  const fullState = usePtoStore((s) => s);

  function exportJson() {
    const { version, settings, leaveTypes, accrualTiers, entries, rollovers, yearOverrides, selectedYear } = fullState;
    const blob = new Blob(
      [JSON.stringify({ version, settings, leaveTypes, accrualTiers, entries, rollovers, yearOverrides, selectedYear }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pto-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleJsonFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as PtoState;
      if (!parsed.entries || !parsed.leaveTypes) throw new Error("not a backup file");
      if (confirm("Replace all current data with this backup? This can't be undone.")) {
        replaceAll(parsed);
      }
    } catch {
      alert("That doesn't look like a valid PTO Tracker backup file.");
    }
  }

  return (
    <Section title="Data" description="Everything stays in this browser. Back it up as JSON, or import your old spreadsheet.">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 bg-surface-2 hover:bg-gridline border border-border-c text-ink text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Import from spreadsheet
        </button>
        <button
          onClick={exportJson}
          className="flex items-center gap-1.5 bg-surface-2 hover:bg-gridline border border-border-c text-ink text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 bg-surface-2 hover:bg-gridline border border-border-c text-ink text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Restore backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleJsonFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => confirm("Delete all data and start over? This can't be undone.") && resetAll()}
          className="flex items-center gap-1.5 text-sm font-medium text-critical hover:opacity-80 transition-opacity px-3 py-1.5 ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset all data
        </button>
      </div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </Section>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-xl font-semibold text-ink">Settings</h1>
      <LeaveTypesSection />
      <AccrualSection />
      <RolloverSection />
      <DataSection />
    </div>
  );
}
