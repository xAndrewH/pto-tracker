import { useMemo, useState } from "react";
import { Plus, AlertTriangle, Pencil } from "lucide-react";
import { usePtoStore } from "../store/usePtoStore";
import { RequestModal } from "../components/RequestModal";
import { StatusPill } from "../components/StatusPill";
import { LeaveTypeDot } from "../components/Meter";
import { formatDateLong, formatHours } from "../lib/format";
import type { PtoEntry, RequestStatus } from "../types";

type TypeFilter = "all" | string;
type StatusFilter = "all" | RequestStatus;

export function RequestsPage() {
  const selectedYear = usePtoStore((s) => s.selectedYear);
  const entries = usePtoStore((s) => s.entries);
  const leaveTypes = usePtoStore((s) => s.leaveTypes);
  const [editing, setEditing] = useState<PtoEntry | "new" | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [yearFilter, setYearFilter] = useState<"selected" | "all">("selected");

  const typeById = Object.fromEntries(leaveTypes.map((t) => [t.id, t]));

  const filtered = useMemo(() => {
    return entries
      .filter((e) => yearFilter === "all" || !e.date || new Date(e.date).getFullYear() === selectedYear)
      .filter((e) => typeFilter === "all" || e.leaveTypeId === typeFilter)
      .filter((e) => statusFilter === "all" || e.status === statusFilter)
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });
  }, [entries, selectedYear, typeFilter, statusFilter, yearFilter]);

  const selectClasses =
    "bg-surface-2 border border-border-c text-ink text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pto/60";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-ink">Requests</h1>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 bg-pto hover:opacity-90 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New request
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value as "selected" | "all")} className={selectClasses}>
          <option value="selected">{selectedYear} only</option>
          <option value="all">All years</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClasses}>
          <option value="all">All types</option>
          {leaveTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={selectClasses}>
          <option value="all">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="not_submitted">Not submitted</option>
        </select>
      </div>

      <div className="bg-surface border border-border-c rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-muted p-8 text-center">No requests match these filters.</p>
        ) : (
          <ul className="divide-y divide-border-c">
            {filtered.map((e) => {
              const type = typeById[e.leaveTypeId];
              return (
                <li key={e.id}>
                  <button
                    onClick={() => setEditing(e)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left group"
                  >
                    <LeaveTypeDot color={type?.color ?? "var(--series-pto)"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink truncate">
                          {e.date ? formatDateLong(e.date) : "Unknown date"}
                        </span>
                        {e.needsReview && <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />}
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {type?.name ?? "Unknown type"} · {formatHours(e.hours)}h
                        {e.notes ? ` · ${e.notes}` : ""}
                      </p>
                    </div>
                    <StatusPill status={e.status} />
                    <Pencil className="w-3.5 h-3.5 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editing && <RequestModal entry={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
