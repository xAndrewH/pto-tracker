import { useEffect, useState } from "react";
import { Nav, type Tab } from "./components/Nav";
import { Dashboard } from "./pages/Dashboard";
import { RequestsPage } from "./pages/RequestsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { SettingsPage } from "./pages/SettingsPage";
import { usePtoStore } from "./store/usePtoStore";

function useTheme() {
  const theme = usePtoStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const onChange = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    apply(theme === "dark");
  }, [theme]);
}

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  useTheme();

  return (
    <div className="min-h-screen bg-page">
      <Nav tab={tab} onChange={setTab} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "dashboard" && <Dashboard onNavigate={setTab} />}
        {tab === "requests" && <RequestsPage />}
        {tab === "calendar" && <CalendarPage />}
        {tab === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
