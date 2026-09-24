import { Check, Clock, CircleDashed } from "lucide-react";
import type { RequestStatus } from "../types";

const CONFIG: Record<RequestStatus, { label: string; icon: typeof Check; classes: string }> = {
  approved: {
    label: "Approved",
    icon: Check,
    classes: "bg-good/10 text-good-text border-good/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-warning/15 text-[#946200] dark:text-warning border-warning/30",
  },
  not_submitted: {
    label: "Not submitted",
    icon: CircleDashed,
    classes: "bg-surface-2 text-ink-muted border-border-c",
  },
};

export function StatusPill({ status }: { status: RequestStatus }) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.classes}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}
