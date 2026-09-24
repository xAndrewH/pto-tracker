import { useMemo, useState } from "react";
import { Plus, ArrowUpCircle, AlertTriangle } from "lucide-react";
import { usePtoStore } from "../store/usePtoStore";
import { computeYearBalance } from "../lib/accrual";
import { BalanceCard } from "../components/BalanceCard";
import { RequestModal } from "../components/RequestModal";
import { StatusPill } from "../components/StatusPill";
import { LeaveTypeDot } from "../components/Meter";
import { formatDateLong, formatDays, pluralize } from "../lib/format";
import { todayIso } from "../lib/date";
import type { Tab } from "../components/Nav";

export function Dashboard({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const selectedYear = usePtoStore((s) => s.selectedYear);
  const allLeaveTypes = usePtoStore((s) => s.leaveTypes);
  const entries = usePtoStore((s) => s.entries);
  const rollovers = usePtoStore((s) => s.rollovers);
  const state = usePtoStore((s) => s);
  const [showAdd, setShowAdd] = useState(false);

  const leaveTypes = useMemo(() => allLeaveTypes.filter((t) => !t.archived), [allLeaveTypes]);

  const balances = useMemo(
    () => leaveTypes.map((t) => computeYearBalance(state, t, selectedYear)),
    [state, leaveTypes, selectedYear]
  );

  const totalRemainingDays = balances.reduce((sum, b) => sum + b.remainingDays, 0);
  const rolloverIntoYear = rollovers.find((r) => r.year === selectedYear)?.hours ?? 0;

  const today = todayIso();
  const upcoming = entries
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1))
    .slice(0, 6);

  const needsReviewCount = entries.filter((e) => e.needsReview).length;
  const typeById = Object.fromEntries(leaveTypes.map((t) => [t.id, t]));

  return (
    <div className="space-y-6 animate-fade-in">
      {needsReviewCount > 0 && (
        <button
          onClick={() => onNavigate("requests")}
          className="w-full flex items-center gap-2.5 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 text-left hover:bg-warning/15 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <span className="text-sm text-ink">
            <strong>{needsReviewCount}</strong> imported {pluralize(needsReviewCount, "request")} need review — dates or types couldn't be read automatically.
          </span>
        </button>
      )}

      {rolloverIntoYear > 0 && (
        <div className="flex items-center gap-2.5 bg-pto/10 border border-pto/25 rounded-xl px-4 py-3">
          <ArrowUpCircle className="w-4 h-4 text-pto shrink-0" />
          <span className="text-sm text-ink">
            <strong>{formatDays(rolloverIntoYear / state.settings.hoursPerDay)} days</strong> rolled over into {selectedYear}.
          </span>
        </div>
      )}

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-1">{selectedYear} balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold text-ink">{formatDays(totalRemainingDays)}</span>
            <span className="text-lg text-ink-secondary">{pluralize(totalRemainingDays, "day")} remaining</span>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-pto hover:opacity-90 text-white text-sm font-semibold rounded-xl px-4 py-2 shadow-sm transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New request
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((b) => (
          <BalanceCard key={b.leaveType.id} balance={b} />
        ))}
        {balances.length === 0 && (
          <p className="text-sm text-ink-muted col-span-full">
            No leave types yet. Add one in Settings.
          </p>
        )}
      </div>

      <div className="bg-surface border border-border-c rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Upcoming time off</h2>
          <button
            onClick={() => onNavigate("requests")}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            View all
          </button>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing scheduled yet.</p>
        ) : (
          <ul className="divide-y divide-border-c">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <LeaveTypeDot color={typeById[e.leaveTypeId]?.color ?? "var(--series-pto)"} />
                  <span className="text-sm text-ink truncate">{e.date ? formatDateLong(e.date) : "Unknown date"}</span>
                </div>
                <StatusPill status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && <RequestModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
