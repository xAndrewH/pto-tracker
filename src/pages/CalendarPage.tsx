import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePtoStore } from "../store/usePtoStore";
import { RequestModal } from "../components/RequestModal";
import { LeaveTypeDot } from "../components/Meter";
import { toIsoDate, todayIso } from "../lib/date";
import type { PtoEntry } from "../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarPage() {
  const selectedYear = usePtoStore((s) => s.selectedYear);
  const entries = usePtoStore((s) => s.entries);
  const leaveTypes = usePtoStore((s) => s.leaveTypes);
  const [month, setMonth] = useState(() => (new Date().getFullYear() === selectedYear ? new Date().getMonth() : 0));
  const [editing, setEditing] = useState<PtoEntry | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);

  const typeById = Object.fromEntries(leaveTypes.map((t) => [t.id, t]));
  const entriesByDate = useMemo(() => {
    const map: Record<string, PtoEntry[]> = {};
    for (const e of entries) {
      if (!e.date) continue;
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [entries]);

  const first = new Date(selectedYear, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toIsoDate(new Date(selectedYear, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayIso();

  function shiftMonth(delta: number) {
    let m = month + delta;
    if (m < 0) m = 11;
    if (m > 11) m = 0;
    setMonth(m);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">
          {MONTH_NAMES[month]} {selectedYear}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs text-ink-secondary">
        {leaveTypes.map((t) => (
          <span key={t.id} className="flex items-center gap-1.5">
            <LeaveTypeDot color={t.color} />
            {t.name}
          </span>
        ))}
      </div>

      <div className="bg-surface border border-border-c rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border-c">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-ink-muted py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((iso, i) => {
            const dayEntries = iso ? entriesByDate[iso] ?? [] : [];
            const isToday = iso === today;
            return (
              <button
                key={i}
                disabled={!iso}
                onClick={() => {
                  if (!iso) return;
                  if (dayEntries.length === 1) setEditing(dayEntries[0]);
                  else if (dayEntries.length === 0) setAddingDate(iso);
                }}
                className={`min-h-20 border-b border-r border-border-c p-1.5 text-left align-top transition-colors ${
                  iso ? "hover:bg-surface-2 cursor-pointer" : "bg-page/50"
                }`}
              >
                {iso && (
                  <>
                    <span
                      className={`text-xs inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday ? "bg-pto text-white font-semibold" : "text-ink-secondary"
                      }`}
                    >
                      {Number(iso.slice(-2))}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEntries.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-1 text-[10px] rounded px-1 py-0.5 truncate"
                          style={{ background: `color-mix(in oklab, ${typeById[e.leaveTypeId]?.color ?? "gray"} 15%, transparent)` }}
                        >
                          <LeaveTypeDot color={typeById[e.leaveTypeId]?.color ?? "var(--series-pto)"} />
                          <span className="truncate text-ink-secondary">{typeById[e.leaveTypeId]?.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {editing && <RequestModal entry={editing} onClose={() => setEditing(null)} />}
      {addingDate && <RequestModal initialDate={addingDate} onClose={() => setAddingDate(null)} />}
    </div>
  );
}
