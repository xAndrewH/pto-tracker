import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import { usePtoStore } from "../store/usePtoStore";
import type { PtoEntry, RequestStatus } from "../types";
import { parseIsoDate, toIsoDate, todayIso } from "../lib/date";

const inputClasses =
  "w-full bg-page border border-border-c text-ink text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-pto/60 transition-colors";
const labelClasses = "text-xs font-medium text-ink-secondary mb-1.5 block";

interface Props {
  entry?: PtoEntry;
  initialDate?: string;
  onClose: () => void;
}

export function RequestModal({ entry, initialDate, onClose }: Props) {
  const allLeaveTypes = usePtoStore((s) => s.leaveTypes);
  const leaveTypes = useMemo(() => allLeaveTypes.filter((t) => !t.archived), [allLeaveTypes]);
  const hoursPerDay = usePtoStore((s) => s.settings.hoursPerDay);
  const addEntry = usePtoStore((s) => s.addEntry);
  const updateEntry = usePtoStore((s) => s.updateEntry);
  const removeEntry = usePtoStore((s) => s.removeEntry);

  const isEdit = !!entry;
  const [startDate, setStartDate] = useState(entry?.date ?? initialDate ?? todayIso());
  const [endDate, setEndDate] = useState(entry?.endDate ?? entry?.date ?? initialDate ?? todayIso());
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [dayLength, setDayLength] = useState<"full" | "half" | "custom">(
    entry && entry.hours !== hoursPerDay && entry.hours !== hoursPerDay / 2 ? "custom" : entry?.hours === hoursPerDay / 2 ? "half" : "full"
  );
  const [customHours, setCustomHours] = useState(String(entry?.hours ?? hoursPerDay));
  const [leaveTypeId, setLeaveTypeId] = useState(entry?.leaveTypeId ?? leaveTypes[0]?.id ?? "");
  const [status, setStatus] = useState<RequestStatus>(entry?.status ?? "not_submitted");
  const [onCalendar, setOnCalendar] = useState(entry?.onCalendar ?? false);
  const [notes, setNotes] = useState(entry?.notes ?? "");

  const hoursForDay = dayLength === "full" ? hoursPerDay : dayLength === "half" ? hoursPerDay / 2 : parseFloat(customHours) || 0;

  function datesInRange(): string[] {
    const start = parseIsoDate(startDate);
    const end = parseIsoDate(endDate);
    const out: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (skipWeekends && (d.getDay() === 0 || d.getDay() === 6)) continue;
      out.push(toIsoDate(d));
    }
    return out;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveTypeId) return;

    if (isEdit) {
      updateEntry(entry.id, {
        date: startDate,
        endDate: startDate,
        hours: hoursForDay,
        leaveTypeId,
        status,
        onCalendar,
        notes: notes || undefined,
        needsReview: false,
        reviewReason: undefined,
      });
    } else {
      const dates = datesInRange();
      for (const date of dates) {
        addEntry({
          date,
          endDate: date,
          hours: hoursForDay,
          leaveTypeId,
          status,
          onCalendar,
          notes: notes || undefined,
        });
      }
    }
    onClose();
  }

  const dayCount = isEdit ? 1 : datesInRange().length;

  return (
    <Modal
      title={isEdit ? "Edit request" : "New request"}
      onClose={onClose}
      footer={
        <>
          {isEdit && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this request?")) {
                  removeEntry(entry.id);
                  onClose();
                }
              }}
              className="mr-auto text-sm font-medium text-critical hover:opacity-80 transition-opacity px-3 py-1.5"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="bg-surface-2 hover:bg-gridline border border-border-c text-ink text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
          >
            Cancel
          </button>
          <button
            form="request-form"
            type="submit"
            className="bg-pto hover:opacity-90 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition-opacity"
          >
            {isEdit ? "Save" : `Add ${dayCount} ${dayCount === 1 ? "day" : "days"}`}
          </button>
        </>
      }
    >
      <form id="request-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses} htmlFor="start-date">
              {isEdit ? "Date" : "Start date"}
            </label>
            <input
              id="start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!isEdit && e.target.value > endDate) setEndDate(e.target.value);
              }}
              className={inputClasses}
            />
          </div>
          {!isEdit && (
            <div>
              <label className={labelClasses} htmlFor="end-date">
                End date
              </label>
              <input
                id="end-date"
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClasses}
              />
            </div>
          )}
        </div>

        {!isEdit && (startDate !== endDate) && (
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={skipWeekends}
              onChange={(e) => setSkipWeekends(e.target.checked)}
              className="rounded accent-[var(--series-pto)]"
            />
            Skip weekends ({dayCount} {dayCount === 1 ? "day" : "days"} selected)
          </label>
        )}

        <div>
          <label className={labelClasses}>Length</label>
          <div className="flex gap-2">
            {(["full", "half", "custom"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDayLength(opt)}
                className={`flex-1 text-sm font-medium rounded-lg px-3 py-1.5 border transition-colors ${
                  dayLength === opt
                    ? "bg-pto/10 border-pto/50 text-pto"
                    : "bg-page border-border-c text-ink-secondary hover:text-ink"
                }`}
              >
                {opt === "full" ? `Full day (${hoursPerDay}h)` : opt === "half" ? `Half day (${hoursPerDay / 2}h)` : "Custom"}
              </button>
            ))}
          </div>
          {dayLength === "custom" && (
            <input
              type="number"
              step="0.25"
              min="0"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              placeholder="Hours"
              className={`${inputClasses} mt-2`}
            />
          )}
        </div>

        <div>
          <label className={labelClasses} htmlFor="leave-type">
            Type
          </label>
          <select
            id="leave-type"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className={inputClasses}
          >
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RequestStatus)}
              className={inputClasses}
            >
              <option value="not_submitted">Not submitted</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <input
                type="checkbox"
                checked={onCalendar}
                onChange={(e) => setOnCalendar(e.target.checked)}
                className="rounded accent-[var(--series-pto)]"
              />
              On calendar
            </label>
          </div>
        </div>

        <div>
          <label className={labelClasses} htmlFor="notes">
            Notes <span className="text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={`${inputClasses} resize-none`}
          />
        </div>
      </form>
    </Modal>
  );
}
