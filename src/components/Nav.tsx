import { useMemo } from "react";
import { LayoutDashboard, ListChecks, CalendarDays, Settings as SettingsIcon, Moon, Sun, Monitor } from "lucide-react";
import { usePtoStore } from "../store/usePtoStore";
import { availableYears } from "../lib/years";

export type Tab = "dashboard" | "requests" | "calendar" | "settings";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Requests", icon: ListChecks },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
      <defs>
        <linearGradient id="navg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a78d6" />
          <stop offset="1" stopColor="#1baf7a" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#navg)" />
      <rect x="8" y="9" width="16" height="15" rx="2.5" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M8 13.5h16" stroke="#fff" strokeWidth="2" />
      <path d="M12 7v4M20 7v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 18.5l2 2 4-4.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeToggle() {
  const theme = usePtoStore((s) => s.settings.theme);
  const setSettings = usePtoStore((s) => s.setSettings);
  const cycle = () => {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setSettings({ theme: next });
  };
  const Icon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
      className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export function Nav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const selectedYear = usePtoStore((s) => s.selectedYear);
  const setSelectedYear = usePtoStore((s) => s.setSelectedYear);
  const entries = usePtoStore((s) => s.entries);
  const rollovers = usePtoStore((s) => s.rollovers);
  const yearOverrides = usePtoStore((s) => s.yearOverrides);
  const years = useMemo(
    () => availableYears({ entries, rollovers, yearOverrides, selectedYear }),
    [entries, rollovers, yearOverrides, selectedYear]
  );

  return (
    <header className="sticky top-0 z-40 bg-page/85 backdrop-blur-md border-b border-border-c">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="font-bold tracking-tight text-ink hidden sm:inline">PTO Tracker</span>
          </div>

          <nav className="flex items-center gap-1 bg-surface-2 rounded-xl p-1 overflow-x-auto scrollbar-thin">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === id
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Selected year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-surface-2 border border-border-c text-ink text-sm font-medium rounded-lg px-2 py-1.5 focus:outline-none focus:border-pto/60"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
