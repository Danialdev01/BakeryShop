export const BRAND = {
  name: "Loong's Bakehouse",
  short: "Loong's",
  tagline: "Baked at dawn. Run with ease.",
  currency: "RM",
  outlet: "Bangsar Kitchen",
  // Sample details shown on the landing page. Replace with the real ones.
  area: "Bangsar, Kuala Lumpur",
  hours: "Tuesday to Sunday, 8am to 6pm",
  closed: "Closed Mondays",
} as const

export const money = (n: number) =>
  `${BRAND.currency} ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const moneyShort = (n: number) =>
  `${BRAND.currency} ${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0)}`
