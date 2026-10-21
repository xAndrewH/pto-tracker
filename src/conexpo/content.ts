// All homepage copy and figures live here so content editors can update the
// page without touching layout code.
//
// Figures are from public coverage of the 2026 show (March 3–7, 2026). The
// 2029 dates are not announced yet, so `nextShow.start` stays null and the
// countdown is hidden until it is set. News items are placeholders.

export const show = {
  name: "CONEXPO-CON/AGG",
  tagline: "Where the future of construction gets built.",
  intro:
    "North America's largest construction trade show returns to Las Vegas. Held every three years, it brings together equipment, technology and the people who build the world, all in one place.",
  venue: "Las Vegas Convention Center & Festival Grounds",
  city: "Las Vegas, NV",
};

export const nextShow = {
  year: 2029,
  label: "Dates to be announced",
  // ISO date string of opening day, e.g. "2029-03-06T09:00:00-08:00".
  start: null as string | null,
};

export const lastShow = {
  year: 2026,
  dates: "March 3–7, 2026",
};

export const stats = [
  { value: "2.9M", label: "sq ft of indoor & outdoor exhibits" },
  { value: "2,000", label: "exhibitors from every major sector" },
  { value: "139K+", label: "attendees at the 2023 show" },
  { value: "150+", label: "education sessions" },
];

export const nav = [
  { label: "Attend", href: "#plan" },
  { label: "Exhibit", href: "#plan" },
  { label: "Industries", href: "#industries" },
  { label: "Education", href: "#education" },
  { label: "News", href: "#news" },
];

export type IndustryKey =
  | "earthmoving"
  | "aggregates"
  | "concrete"
  | "asphalt"
  | "lifting"
  | "tech"
  | "utilities"
  | "mining";

export const industries: { key: IndustryKey; name: string; blurb: string }[] = [
  { key: "earthmoving", name: "Earthmoving", blurb: "Excavators, dozers, loaders and the attachments that move the job forward." },
  { key: "aggregates", name: "Aggregates", blurb: "Crushing, screening and material handling for quarries and pits." },
  { key: "concrete", name: "Concrete", blurb: "Mixing, placing, pumping and finishing — from ready-mix to precast." },
  { key: "asphalt", name: "Asphalt & Paving", blurb: "Plants, pavers, compactors and milling for roads that last." },
  { key: "lifting", name: "Lifting", blurb: "Cranes, aerial work platforms and telehandlers." },
  { key: "tech", name: "Construction Tech", blurb: "Autonomy, telematics, machine control and jobsite software." },
  { key: "utilities", name: "Utilities", blurb: "Trenching, directional drilling and underground infrastructure." },
  { key: "mining", name: "Mining", blurb: "Heavy-duty haulage and processing equipment at scale." },
];

export const plan = [
  {
    title: "Attend",
    body: "Get on the list for 2029 registration and early-bird pricing.",
    cta: "Get notified",
    href: "#updates",
  },
  {
    title: "Exhibit",
    body: "Put your equipment in front of the industry's decision makers.",
    cta: "Exhibitor info",
    href: "#updates",
  },
  {
    title: "Travel & Hotels",
    body: "Official housing blocks, shuttles and getting around Las Vegas.",
    cta: "Plan travel",
    href: "#updates",
  },
  {
    title: "Education",
    body: "Sessions on safety, workforce, technology and business strategy.",
    cta: "See tracks",
    href: "#education",
  },
];

export const educationTracks = [
  "Equipment Management",
  "Safety & Workforce",
  "Technology & Innovation",
  "Business & Leadership",
  "Aggregates & Materials",
  "Sustainability",
];

export const news = [
  {
    tag: "Show recap",
    title: "Looking back at CONEXPO-CON/AGG 2026",
    date: "Placeholder",
  },
  {
    tag: "Announcement",
    title: "Save the date: CONEXPO-CON/AGG 2029",
    date: "Placeholder",
  },
  {
    tag: "Industry",
    title: "Five technologies that stole the show on the Festival Grounds",
    date: "Placeholder",
  },
];

export const footer = [
  { heading: "Attend", links: ["Registration", "Travel & Hotels", "Education", "FAQ"] },
  { heading: "Exhibit", links: ["Why exhibit", "Floor plan", "Sponsorships", "Exhibitor resources"] },
  { heading: "About", links: ["About the show", "Press room", "Contact", "Code of conduct"] },
];
