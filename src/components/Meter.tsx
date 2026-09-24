interface MeterProps {
  color: string;
  fraction: number; // 0-1, used portion
  overCap?: boolean;
}

export function Meter({ color, fraction, overCap }: MeterProps) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <div
      className="h-2.5 w-full rounded-full overflow-hidden"
      style={{ background: `color-mix(in oklab, ${color} 18%, var(--surface-2))` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${pct}%`,
          background: overCap ? "var(--critical)" : color,
        }}
      />
    </div>
  );
}

export function LeaveTypeDot({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${className}`}
      style={{ background: color }}
    />
  );
}
