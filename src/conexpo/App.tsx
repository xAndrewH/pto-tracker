import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Cable,
  CalendarDays,
  Cone,
  Construction,
  Container,
  Cpu,
  Forklift,
  Layers,
  MapPin,
  Menu,
  Mountain,
  Pickaxe,
  Shovel,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  educationTracks,
  footer,
  industries,
  lastShow,
  nav,
  news,
  nextShow,
  plan,
  show,
  stats,
  type IndustryKey,
} from "./content";

const INDUSTRY_ICONS: Record<IndustryKey, LucideIcon> = {
  earthmoving: Shovel,
  aggregates: Mountain,
  concrete: Container,
  asphalt: Cone,
  lifting: Forklift,
  tech: Cpu,
  utilities: Cable,
  mining: Pickaxe,
};

function Wordmark() {
  return (
    <a href="#top" className="flex items-center gap-2.5 shrink-0" aria-label={`${show.name} home`}>
      <span className="grid place-items-center w-8 h-8 rounded-md bg-cx-yellow text-cx-yellow-ink">
        <Construction className="w-4.5 h-4.5" strokeWidth={2.5} />
      </span>
      <span className="font-[family-name:var(--font-display)] font-black tracking-tight text-[15px] leading-none">
        CONEXPO<span className="text-cx-yellow">-</span>CON/AGG
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled || open ? "bg-cx-page/90 backdrop-blur-md border-b border-cx-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Wordmark />

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-cx-ink-secondary hover:text-cx-ink hover:bg-cx-surface-2 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#updates"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-cx-yellow text-cx-yellow-ink text-sm font-bold hover:brightness-110 transition"
          >
            Get 2029 updates
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-md text-cx-ink hover:bg-cx-surface-2"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="lg:hidden border-t border-cx-border px-4 pb-4">
          <ul className="flex flex-col py-2">
            {nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-3 text-base font-semibold border-b border-cx-border"
                >
                  {item.label}
                  <ArrowRight className="w-4 h-4 text-cx-ink-muted" />
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#updates"
            onClick={() => setOpen(false)}
            className="mt-2 flex justify-center px-4 py-3 rounded-md bg-cx-yellow text-cx-yellow-ink font-bold"
          >
            Get 2029 updates
          </a>
        </nav>
      )}
    </header>
  );
}

function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (!target) return null;
  const ms = Math.max(0, new Date(target).getTime() - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

function Countdown() {
  const left = useCountdown(nextShow.start);
  if (!left) return null;
  const parts = [
    ["Days", left.days],
    ["Hrs", left.hours],
    ["Min", left.minutes],
    ["Sec", left.seconds],
  ] as const;
  return (
    <div className="flex gap-2" role="timer" aria-label={`${left.days} days until the show opens`}>
      {parts.map(([label, n]) => (
        <div key={label} className="w-16 text-center rounded-md bg-cx-surface border border-cx-border py-2">
          <div className="font-[family-name:var(--font-display)] text-2xl font-black tabular-nums">
            {String(n).padStart(2, "0")}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-cx-ink-muted">{label}</div>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden -mt-16 pt-16">
      <div className="cx-grid absolute inset-0 pointer-events-none" aria-hidden />
      <div
        className="absolute -right-40 -top-40 w-[640px] h-[640px] rounded-full bg-cx-yellow/15 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14">
        <p className="cx-rise inline-flex items-center gap-2 rounded-full border border-cx-border bg-cx-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cx-ink-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-cx-yellow" />
          Next show · {nextShow.year} · {nextShow.label}
        </p>

        <h1
          className="cx-rise mt-6 max-w-4xl font-[family-name:var(--font-display)] font-black tracking-tight leading-[0.95] text-5xl sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "80ms" }}
        >
          {show.tagline.replace(/\.$/, "")}
          <span className="text-cx-yellow">.</span>
        </h1>

        <p
          className="cx-rise mt-6 max-w-2xl text-lg text-cx-ink-secondary leading-relaxed"
          style={{ animationDelay: "160ms" }}
        >
          {show.intro}
        </p>

        <div className="cx-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
          <a
            href="#updates"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-cx-yellow text-cx-yellow-ink font-bold hover:brightness-110 transition"
          >
            Get notified when registration opens <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#plan"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-cx-border bg-cx-surface/60 font-semibold hover:bg-cx-surface-2 transition"
          >
            Exhibit in {nextShow.year}
          </a>
        </div>

        <div
          className="cx-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cx-ink-secondary"
          style={{ animationDelay: "320ms" }}
        >
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cx-yellow" /> {show.venue}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-cx-yellow" /> Every three years · Last held {lastShow.dates}
          </span>
        </div>

        <div className="mt-8">
          <Countdown />
        </div>
      </div>

      <div className="relative border-y border-cx-border bg-cx-surface/70 backdrop-blur-sm">
        <dl className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-7 px-2 sm:px-6 ${i % 2 === 1 ? "border-l border-cx-border" : ""} ${
                i >= 2 ? "border-t lg:border-t-0 border-cx-border" : ""
              } ${i === 2 ? "lg:border-l" : ""}`}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <div className="font-[family-name:var(--font-display)] font-black text-4xl sm:text-5xl tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-cx-ink-muted">{s.label}</div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cx-yellow">{eyebrow}</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] font-black tracking-tight text-3xl sm:text-5xl leading-[1.02]">
        {title}
      </h2>
      {children && <p className="mt-4 text-cx-ink-secondary text-lg leading-relaxed">{children}</p>}
    </div>
  );
}

function PlanYourVisit() {
  return (
    <section id="plan" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
      <SectionHeading eyebrow="Plan your visit" title="Everything you need, in four clicks.">
        Pick your path. Each one gets you straight to the next step — no hunting through menus.
      </SectionHeading>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plan.map((p, i) => (
          <a
            key={p.title}
            href={p.href}
            className={`group relative flex flex-col justify-between min-h-56 rounded-xl p-6 border transition ${
              i === 0
                ? "bg-cx-yellow text-cx-yellow-ink border-transparent"
                : "bg-cx-surface border-cx-border hover:border-cx-yellow/50 hover:bg-cx-surface-2"
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-[family-name:var(--font-display)] font-black text-2xl">{p.title}</h3>
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className={`mt-3 text-[15px] leading-relaxed ${i === 0 ? "text-cx-yellow-ink/80" : "text-cx-ink-secondary"}`}>
                {p.body}
              </p>
            </div>
            <span className="mt-6 text-sm font-bold underline-offset-4 group-hover:underline">{p.cta}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="border-t border-cx-border bg-cx-surface/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading eyebrow="Industries" title="Every sector of the job site, under one roof.">
            From the quarry to the finished road — find the exhibitors and equipment for your work.
          </SectionHeading>
          <a href="#plan" className="inline-flex items-center gap-2 text-sm font-bold text-cx-yellow hover:underline underline-offset-4">
            Browse exhibitors <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <ul className="mt-12 grid gap-px rounded-xl overflow-hidden border border-cx-border bg-cx-border sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind) => {
            const Icon = INDUSTRY_ICONS[ind.key];
            return (
              <li key={ind.key} className="group bg-cx-page p-6 hover:bg-cx-surface transition-colors">
                <span className="grid place-items-center w-11 h-11 rounded-lg bg-cx-surface-2 text-cx-yellow group-hover:bg-cx-yellow group-hover:text-cx-yellow-ink transition-colors">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="mt-5 font-bold text-lg">{ind.name}</h3>
                <p className="mt-1.5 text-sm text-cx-ink-muted leading-relaxed">{ind.blurb}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Education() {
  return (
    <section id="education" className="relative overflow-hidden scroll-mt-16">
      <div className="cx-hazard h-3" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <SectionHeading eyebrow="Education" title="150+ sessions. Learn what's next, then go see it on the floor.">
          Practical sessions led by contractors, producers and manufacturers — built around the problems you're
          solving this season.
        </SectionHeading>
        <ul className="flex flex-wrap gap-2.5">
          {educationTracks.map((t) => (
            <li
              key={t}
              className="inline-flex items-center gap-2 rounded-full border border-cx-border bg-cx-surface px-4 py-2.5 text-sm font-semibold"
            >
              <Layers className="w-4 h-4 text-cx-yellow" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function News() {
  return (
    <section id="news" className="border-t border-cx-border scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionHeading eyebrow="Newsroom" title="Latest from the show." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {news.map((n, i) => (
            <a
              key={n.title}
              href="#news"
              className="group flex flex-col rounded-xl overflow-hidden border border-cx-border bg-cx-surface hover:border-cx-yellow/50 transition"
            >
              <div
                className="aspect-[16/9] relative"
                style={{
                  background: `linear-gradient(135deg, var(--cx-surface-2), ${
                    ["var(--cx-yellow)", "var(--cx-orange)", "var(--cx-surface-2)"][i % 3]
                  } 260%)`,
                }}
                aria-hidden
              >
                <div className="cx-grid absolute inset-0 opacity-60" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cx-yellow">{n.tag}</span>
                <h3 className="mt-2 font-bold text-lg leading-snug group-hover:underline underline-offset-4">{n.title}</h3>
                <span className="mt-auto pt-4 text-sm text-cx-ink-muted">{n.date}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Updates() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  // Concept only: wire this to the real mailing-list endpoint.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <section id="updates" className="scroll-mt-16 px-4 sm:px-6 pb-20 sm:pb-28">
      <div className="max-w-7xl mx-auto rounded-2xl bg-cx-yellow text-cx-yellow-ink p-8 sm:p-14 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="font-[family-name:var(--font-display)] font-black tracking-tight text-3xl sm:text-5xl leading-[1.02]">
            Be first in line for {nextShow.year}.
          </h2>
          <p className="mt-4 text-cx-yellow-ink/80 text-lg">
            Dates, registration, housing and exhibitor news — straight to your inbox.
          </p>
        </div>
        {sent ? (
          <p role="status" className="text-lg font-bold">
            You're on the list. We'll be in touch.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 rounded-md bg-white/90 px-4 py-3.5 text-base text-cx-yellow-ink placeholder:text-cx-yellow-ink/50 focus:outline-none focus:ring-2 focus:ring-cx-yellow-ink"
            />
            <button
              type="submit"
              className="rounded-md bg-cx-yellow-ink text-cx-yellow px-6 py-3.5 font-bold hover:opacity-90 transition"
            >
              Notify me
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-cx-border bg-cx-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm text-cx-ink-muted leading-relaxed">
            {show.venue}
            <br />
            {show.city}
          </p>
        </div>
        {footer.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cx-ink-muted">{col.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#top" className="text-sm text-cx-ink-secondary hover:text-cx-ink">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-cx-border">
        <p className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs text-cx-ink-muted">
          Unofficial homepage redesign concept. Not affiliated with or endorsed by the show organizers.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-cx-yellow focus:px-4 focus:py-2 focus:text-cx-yellow-ink focus:font-bold"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <PlanYourVisit />
        <Industries />
        <Education />
        <News />
        <Updates />
      </main>
      <Footer />
    </>
  );
}
