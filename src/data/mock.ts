export type Category = "Viennoiserie" | "Bread" | "Cakes" | "Cookies" | "Tarts" | "Drinks"

/** Amount of one ingredient used per single finished item, in the ingredient's unit. */
export type RecipeLine = { ingredientId: string; qty: number }

export type Product = {
  id: string
  name: string
  emoji: string
  category: Category
  price: number
  stock: number
  par: number
  preorderOnly?: boolean
  recipe: RecipeLine[]
}

export type Ingredient = {
  id: string
  name: string
  emoji: string
  unit: string
  stock: number
  reorderAt: number
  max: number
  supplier: string
  costPerUnit: number
}

export type Tier = "Crumb" | "Croissant" | "Gâteau"

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  tier: Tier
  points: number
  lifetimeSpend: number
  orders: number
  lastOrderDaysAgo: number
  joined: string
  tags: string[]
  favourite: string
  notes: string
  birthday: string
}

export type OrderStatus = "new" | "baking" | "ready" | "dispatched" | "completed"
export type Fulfilment = "pickup" | "delivery"
export type Provider = "Grab" | "Lalamove" | "foodpanda" | "In-house"
export type Channel = "Shopify Web" | "Shopify POS" | "WhatsApp"

export type OrderItem = { productId: string; qty: number }

export type Order = {
  id: string
  customerId: string
  items: OrderItem[]
  total: number
  channel: Channel
  fulfilment: Fulfilment
  provider?: Provider
  slot: string
  status: OrderStatus
  createdMinsAgo: number
  preorderFor?: number // days from today
  payment: "Paid" | "Deposit 50%"
  note?: string
  address?: string
  riderEta?: number
}

export type Voucher = {
  id: string
  code: string
  description: string
  kind: "percent" | "fixed" | "freebie"
  value: number
  used: number
  limit: number
  expiresInDays: number
  active: boolean
  tierOnly?: Tier
}

export type Reward = {
  id: string
  name: string
  emoji: string
  cost: number
}

export const products: Product[] = [
  { id: "p1", name: "Butter Croissant", emoji: "🥐", category: "Viennoiserie", price: 8.5, stock: 42, par: 60, recipe: [{ ingredientId: "i1", qty: 0.05 }, { ingredientId: "i2", qty: 0.03 }] },
  { id: "p2", name: "Pain au Chocolat", emoji: "🍫", category: "Viennoiserie", price: 9.9, stock: 18, par: 48, recipe: [{ ingredientId: "i1", qty: 0.05 }, { ingredientId: "i2", qty: 0.03 }, { ingredientId: "i4", qty: 0.015 }] },
  { id: "p3", name: "Kouign-Amann", emoji: "🧈", category: "Viennoiserie", price: 11.0, stock: 6, par: 30, recipe: [{ ingredientId: "i1", qty: 0.05 }, { ingredientId: "i2", qty: 0.04 }, { ingredientId: "i10", qty: 0.03 }] },
  { id: "p4", name: "Country Sourdough", emoji: "🍞", category: "Bread", price: 18.0, stock: 14, par: 20, recipe: [{ ingredientId: "i1", qty: 0.45 }] },
  { id: "p5", name: "Pandan Chiffon", emoji: "🍰", category: "Cakes", price: 42.0, stock: 5, par: 8, recipe: [{ ingredientId: "i1", qty: 0.12 }, { ingredientId: "i3", qty: 0.2 }, { ingredientId: "i9", qty: 0.02 }, { ingredientId: "i10", qty: 0.15 }] },
  { id: "p6", name: "Strawberry Shortcake", emoji: "🍓", category: "Cakes", price: 128.0, stock: 3, par: 6, preorderOnly: true, recipe: [{ ingredientId: "i1", qty: 0.15 }, { ingredientId: "i3", qty: 0.15 }, { ingredientId: "i5", qty: 0.4 }, { ingredientId: "i6", qty: 0.4 }, { ingredientId: "i10", qty: 0.15 }] },
  { id: "p7", name: "Basque Burnt Cheesecake", emoji: "🧀", category: "Cakes", price: 98.0, stock: 4, par: 6, preorderOnly: true, recipe: [{ ingredientId: "i3", qty: 0.15 }, { ingredientId: "i5", qty: 0.3 }, { ingredientId: "i7", qty: 0.9 }, { ingredientId: "i10", qty: 0.25 }] },
  { id: "p8", name: "Sea-Salt Choc Cookie", emoji: "🍪", category: "Cookies", price: 6.5, stock: 64, par: 80, recipe: [{ ingredientId: "i1", qty: 0.03 }, { ingredientId: "i2", qty: 0.02 }, { ingredientId: "i4", qty: 0.015 }, { ingredientId: "i10", qty: 0.02 }] },
  { id: "p9", name: "Egg Tart", emoji: "🥧", category: "Tarts", price: 4.8, stock: 9, par: 40, recipe: [{ ingredientId: "i1", qty: 0.02 }, { ingredientId: "i2", qty: 0.01 }, { ingredientId: "i3", qty: 0.03 }, { ingredientId: "i10", qty: 0.01 }] },
  { id: "p10", name: "Glazed Doughnut", emoji: "🍩", category: "Viennoiserie", price: 5.9, stock: 27, par: 36, recipe: [{ ingredientId: "i1", qty: 0.05 }, { ingredientId: "i2", qty: 0.005 }, { ingredientId: "i3", qty: 0.01 }, { ingredientId: "i10", qty: 0.02 }] },
  { id: "p11", name: "Matcha Cupcake", emoji: "🧁", category: "Cakes", price: 7.9, stock: 21, par: 24, recipe: [{ ingredientId: "i1", qty: 0.03 }, { ingredientId: "i2", qty: 0.02 }, { ingredientId: "i3", qty: 0.02 }, { ingredientId: "i8", qty: 0.002 }, { ingredientId: "i10", qty: 0.03 }] },
  { id: "p12", name: "Iced Kopi Latte", emoji: "🧋", category: "Drinks", price: 12.0, stock: 99, par: 99, recipe: [{ ingredientId: "i5", qty: 0.05 }, { ingredientId: "i10", qty: 0.02 }] },
]

export const ingredients: Ingredient[] = [
  { id: "i1", name: "French T55 Flour", emoji: "🌾", unit: "kg", stock: 62, reorderAt: 50, max: 200, supplier: "Prima Flour Mills", costPerUnit: 6.2 },
  { id: "i2", name: "Cultured Butter (Lescure)", emoji: "🧈", unit: "kg", stock: 8, reorderAt: 15, max: 60, supplier: "Le Gourmet Imports", costPerUnit: 58 },
  { id: "i3", name: "Free-range Eggs", emoji: "🥚", unit: "tray", stock: 22, reorderAt: 10, max: 40, supplier: "LTK Farms", costPerUnit: 16 },
  { id: "i4", name: "Valrhona 70% Chocolate", emoji: "🍫", unit: "kg", stock: 4.5, reorderAt: 5, max: 20, supplier: "Le Gourmet Imports", costPerUnit: 145 },
  { id: "i5", name: "Fresh Cream 35%", emoji: "🥛", unit: "L", stock: 18, reorderAt: 12, max: 40, supplier: "Emborg Dairy", costPerUnit: 24 },
  { id: "i6", name: "Cameron Strawberries", emoji: "🍓", unit: "kg", stock: 2, reorderAt: 4, max: 12, supplier: "Highland Fresh", costPerUnit: 38 },
  { id: "i7", name: "Cream Cheese", emoji: "🧀", unit: "kg", stock: 11, reorderAt: 6, max: 24, supplier: "Emborg Dairy", costPerUnit: 42 },
  { id: "i8", name: "Uji Matcha Powder", emoji: "🍵", unit: "kg", stock: 1.2, reorderAt: 1, max: 5, supplier: "Kyoto Tea Co.", costPerUnit: 320 },
  { id: "i9", name: "Pandan Extract", emoji: "🌿", unit: "L", stock: 3, reorderAt: 2, max: 8, supplier: "Kampung Harvest", costPerUnit: 28 },
  { id: "i10", name: "Caster Sugar", emoji: "🍬", unit: "kg", stock: 48, reorderAt: 20, max: 100, supplier: "Prima Flour Mills", costPerUnit: 3.4 },
]

const names: [string, string][] = [
  ["Aisyah Rahman", "aisyah.r"],
  ["Daniel Tan", "dtan88"],
  ["Mei Ling Wong", "meiling.w"],
  ["Arjun Pillai", "arjun.p"],
  ["Sofia Lim", "sofialim"],
  ["Hafiz Ismail", "hafiz.i"],
  ["Chloe Ng", "chloe.ng"],
  ["Ryan Ong", "ryanong"],
  ["Nurul Huda", "nurulhuda"],
  ["Jasmine Teo", "jas.teo"],
  ["Kevin Chua", "kchua"],
  ["Priya Nair", "priya.n"],
  ["Farah Aziz", "farah.a"],
  ["Marcus Yeo", "marcusyeo"],
]

const tagPool = ["Cake lover", "Office catering", "Weekend regular", "Allergy: nuts", "VIP", "Birthday this month", "Corporate", "New"]
const favs = ["Butter Croissant", "Basque Burnt Cheesecake", "Pandan Chiffon", "Egg Tart", "Strawberry Shortcake", "Kouign-Amann"]

export const customers: Customer[] = names.map(([name, handle], i) => {
  const spend = Math.round((3200 - i * 210 + ((i * 137) % 400)) * 100) / 100
  const points = Math.max(40, Math.round(spend * 0.6 - i * 30))
  const tier: Tier = points >= 1500 ? "Gâteau" : points >= 500 ? "Croissant" : "Crumb"
  return {
    id: `c${i + 1}`,
    name,
    email: `${handle}@mail.com`,
    phone: `+60 1${(i % 9) + 1}-${String(2000000 + i * 734521).slice(0, 3)} ${String(4000 + i * 377).slice(0, 4)}`,
    tier,
    points,
    lifetimeSpend: spend,
    orders: Math.max(2, 46 - i * 3),
    lastOrderDaysAgo: (i * 3) % 19,
    joined: `${["Jan", "Mar", "Apr", "Jun", "Aug", "Sep"][i % 6]} 202${4 + (i % 2)}`,
    tags: [tagPool[i % tagPool.length], ...(i % 3 === 0 ? [tagPool[(i + 3) % tagPool.length]] : [])],
    favourite: favs[i % favs.length],
    notes: i % 2 === 0 ? "Prefers less sweet. Usually picks up before 9am." : "Likes handwritten birthday cards on cakes.",
    birthday: `${(i * 2 + 3) % 28 + 1} ${["Nov", "Dec", "Jan", "Feb"][i % 4]}`,
  }
})

const slotTimes = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
const providers: Provider[] = ["Grab", "Lalamove", "foodpanda", "In-house"]
const channels: Channel[] = ["Shopify Web", "Shopify Web", "Shopify POS", "WhatsApp"]
const addresses = ["Jalan Telawi 3, Bangsar", "Mont Kiara, Solaris", "Damansara Heights", "Bukit Bintang, KL", "TTDI, Jalan Datuk Sulaiman", "Petaling Jaya SS2"]
const statuses: OrderStatus[] = ["new", "new", "new", "baking", "baking", "baking", "ready", "ready", "dispatched", "dispatched", "completed", "completed"]

export const priceOf = (items: OrderItem[], catalog: Product[] = products) =>
  Math.round(items.reduce((s, it) => s + (catalog.find((p) => p.id === it.productId)?.price ?? 0) * it.qty, 0) * 100) / 100

function itemsFor(i: number): OrderItem[] {
  const n = (i % 3) + 1
  return Array.from({ length: n }, (_, k) => ({
    productId: products[(i * 5 + k * 3) % 11].id,
    qty: ((i + k) % 4) + 1,
  }))
}

let seq = 1040
export const nextOrderId = () => `LB-${++seq}`

export const orders: Order[] = Array.from({ length: 22 }, (_, i) => {
  const status = statuses[i % statuses.length]
  const fulfilment: Fulfilment = status === "dispatched" ? "delivery" : i % 3 === 0 ? "pickup" : i % 2 === 0 ? "pickup" : "delivery"
  const items = itemsFor(i)
  return {
    id: nextOrderId(),
    customerId: customers[(i * 5) % customers.length].id,
    items,
    total: priceOf(items),
    channel: channels[i % channels.length],
    fulfilment,
    provider: fulfilment === "delivery" ? providers[i % providers.length] : undefined,
    slot: slotTimes[i % slotTimes.length],
    status,
    createdMinsAgo: 4 + i * 11,
    payment: "Paid",
    address: fulfilment === "delivery" ? addresses[i % addresses.length] : undefined,
    riderEta: fulfilment === "delivery" ? 6 + (i % 5) * 4 : undefined,
    note: i % 5 === 0 ? "Please write 'Happy Birthday Mei' on the cake" : undefined,
  }
})

// Pre-orders for the coming two weeks
const cakeIds = ["p6", "p7", "p5", "p1", "p3", "p11"]
export const preorders: Order[] = Array.from({ length: 26 }, (_, i) => {
  const items: OrderItem[] = [
    { productId: cakeIds[i % cakeIds.length], qty: cakeIds[i % cakeIds.length].match(/p[567]/) ? 1 + (i % 2) : 6 + (i % 4) * 6 },
    ...(i % 3 === 0 ? [{ productId: "p8", qty: 12 }] : []),
  ]
  const fulfilment: Fulfilment = i % 3 === 1 ? "delivery" : "pickup"
  return {
    id: `PO-${2200 + i}`,
    customerId: customers[(i * 3) % customers.length].id,
    items,
    total: priceOf(items),
    channel: i % 4 === 3 ? "WhatsApp" : "Shopify Web",
    fulfilment,
    provider: fulfilment === "delivery" ? providers[i % 3] : undefined,
    slot: slotTimes[(i * 2) % slotTimes.length],
    status: "new",
    createdMinsAgo: 60 * 24 * ((i % 5) + 1),
    preorderFor: i < 3 ? i % 2 : 1 + ((i * 5) % 13),
    payment: i % 3 === 2 ? "Deposit 50%" : "Paid",
    address: fulfilment === "delivery" ? addresses[i % addresses.length] : undefined,
    note: i % 4 === 0 ? "Cake topper: 'Congrats Dr. Lim!'" : undefined,
  }
})

export const vouchers: Voucher[] = [
  { id: "v1", code: "FRESHBAKE10", description: "10% off first order", kind: "percent", value: 10, used: 182, limit: 500, expiresInDays: 42, active: true },
  { id: "v2", code: "CNY2027", description: "RM 20 off orders above RM 150", kind: "fixed", value: 20, used: 64, limit: 300, expiresInDays: 86, active: true },
  { id: "v3", code: "BDAYTREAT", description: "Free slice of cake on your birthday month", kind: "freebie", value: 0, used: 37, limit: 1000, expiresInDays: 365, active: true },
  { id: "v4", code: "GATEAUVIP", description: "15% off whole cakes", kind: "percent", value: 15, used: 21, limit: 100, expiresInDays: 30, active: true, tierOnly: "Gâteau" },
  { id: "v5", code: "RAINYDAY", description: "Free delivery under 5km", kind: "fixed", value: 8, used: 240, limit: 240, expiresInDays: 0, active: false },
]

export const rewards: Reward[] = [
  { id: "r1", name: "Free Egg Tart", emoji: "🥧", cost: 120 },
  { id: "r2", name: "Free Croissant", emoji: "🥐", cost: 200 },
  { id: "r3", name: "RM 15 Voucher", emoji: "🎟️", cost: 400 },
  { id: "r4", name: "Whole Pandan Chiffon", emoji: "🍰", cost: 900 },
]

export const tiers: { name: Tier; min: number; perks: string[] }[] = [
  { name: "Crumb", min: 0, perks: ["1 pt per RM 1", "Birthday treat", "Member-only drops"] },
  { name: "Croissant", min: 500, perks: ["1.25 pts per RM 1", "Priority pre-order slots", "Free delivery > RM 80"] },
  { name: "Gâteau", min: 1500, perks: ["1.5 pts per RM 1", "15% off whole cakes", "Tasting events invite"] },
]

// 14-day sales trend
export const salesTrend = Array.from({ length: 14 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (13 - i))
  const weekend = d.getDay() === 0 || d.getDay() === 6
  const base = 2600 + Math.sin(i / 2) * 420 + (weekend ? 1400 : 0) + i * 45
  return {
    day: d.toLocaleDateString("en-MY", { day: "numeric", month: "short" }),
    pickup: Math.round(base * 0.58),
    delivery: Math.round(base * 0.42),
  }
})

export const topSellers = [
  { name: "Croissant", sold: 412, fill: "var(--color-chart-1)" },
  { name: "Egg Tart", sold: 356, fill: "var(--color-chart-3)" },
  { name: "Cookie", sold: 298, fill: "var(--color-chart-2)" },
  { name: "Basque", sold: 121, fill: "var(--color-chart-4)" },
  { name: "Doughnut", sold: 188, fill: "var(--color-chart-5)" },
].sort((a, b) => b.sold - a.sold)

export const notifications = [
  { id: 1, title: "Cultured butter below reorder level", time: "5m" },
  { id: 2, title: "3 cake pre-orders due tomorrow", time: "22m" },
  { id: 3, title: "Grab rider arrived for LB-1043", time: "31m" },
  { id: 4, title: "Sofia Lim reached Gâteau tier", time: "1h" },
]
