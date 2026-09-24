import type { YearTypeBalance } from "../lib/accrual";
import { formatDays, formatHours, pluralize } from "../lib/format";
import { LeaveTypeDot, Meter } from "./Meter";

export function BalanceCard({ balance }: { balance: YearTypeBalance }) {
  const { leaveType, availableDays, usedDays, remainingDays, remainingHours } = balance;
  const overCap = remainingDays < 0;
  const fraction = availableDays > 0 ? usedDays / availableDays : usedDays > 0 ? 1 : 0;

  return (
    <div className="bg-surface border border-border-c rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LeaveTypeDot color={leaveType.color} />
        <span className="text-sm font-semibold text-ink">{leaveType.name}</span>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-semibold ${overCap ? "text-critical" : "text-ink"}`}>
            {formatDays(remainingDays)}
          </span>
          <span className="text-sm text-ink-secondary">{pluralize(remainingDays, "day")} left</span>
        </div>
        <p className="text-xs text-ink-muted mt-0.5">{formatHours(remainingHours)} hours remaining</p>
      </div>

      <Meter color={leaveType.color} fraction={fraction} overCap={overCap} />

      <div className="flex items-center justify-between text-xs text-ink-secondary">
        <span>
          <span className="font-medium text-ink">{formatDays(usedDays)}</span> used
        </span>
        <span>
          <span className="font-medium text-ink">{formatDays(availableDays)}</span> available
        </span>
      </div>
    </div>
  );
}
