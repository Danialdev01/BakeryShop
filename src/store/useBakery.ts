import { create } from "zustand"
import { persist } from "zustand/middleware"
import { startOfDay, startOfWeek } from "date-fns"
import {
  customers as seedCustomers,
  ingredients as seedIngredients,
  orders as seedOrders,
  preorders as seedPreorders,
  products as seedProducts,
  vouchers as seedVouchers,
  rewards,
  customers,
  nextOrderId,
  priceOf,
  products,
  type Customer,
  type Ingredient,
  type Order,
  type OrderStatus,
  type Product,
  type RecipeLine,
  type Tier,
  type Voucher,
} from "@/data/mock"

export const statusFlow = (o: Order): OrderStatus[] =>
  o.fulfilment === "pickup" ? ["new", "baking", "ready", "completed"] : ["new", "baking", "ready", "dispatched", "completed"]

export const nextStatus = (o: Order): OrderStatus | null => {
  const flow = statusFlow(o)
  const i = flow.indexOf(o.status)
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null
}

export const tierFor = (points: number): Tier => (points >= 1500 ? "Gâteau" : points >= 500 ? "Croissant" : "Crumb")

export const roundQty = (n: number) => Math.round(n * 1000) / 1000

export type Shortage = { ingredient: Ingredient; need: number }

/** Ingredients that can't cover `batch` units of a recipe. Empty means the batch can be made. */
export const shortagesFor = (recipe: RecipeLine[], batch: number, ingredients: Ingredient[]): Shortage[] =>
  recipe.flatMap((line) => {
    const ingredient = ingredients.find((i) => i.id === line.ingredientId)
    const need = roundQty(line.qty * batch)
    return ingredient && need > ingredient.stock ? [{ ingredient, need }] : []
  })

const consume = (recipe: RecipeLine[], batch: number, ingredients: Ingredient[]) =>
  ingredients.map((i) => {
    const line = recipe.find((l) => l.ingredientId === i.id)
    return line ? { ...i, stock: roundQty(i.stock - line.qty * batch) } : i
  })

export type ChecklistPeriod = "daily" | "weekly"

/** A saved item stays hidden until the current day or week (Monday start) rolls over. */
export const isChecked = (checkedAt: string | undefined, period: ChecklistPeriod, now = new Date()) => {
  if (!checkedAt) return false
  const start = period === "daily" ? startOfDay(now) : startOfWeek(now, { weekStartsOn: 1 })
  return new Date(checkedAt) >= start
}

type State = {
  orders: Order[]
  preorders: Order[]
  products: Product[]
  ingredients: Ingredient[]
  customers: Customer[]
  vouchers: Voucher[]
  /** Last stock check per item, keyed `ingredient:<id>` or `product:<id>`. */
  checks: Record<string, string>
  checklistPeriod: ChecklistPeriod
  advanceOrder: (id: string) => Order | undefined
  setStatus: (id: string, status: OrderStatus) => void
  adjustProduct: (id: string, delta: number) => void
  adjustIngredient: (id: string, delta: number) => void
  addProduct: (p: Omit<Product, "id">) => Shortage[]
  updateProduct: (id: string, patch: Partial<Omit<Product, "id">>) => void
  deleteProduct: (id: string) => void
  produceBatch: (id: string, qty: number) => Shortage[]
  addIngredient: (i: Omit<Ingredient, "id">) => void
  updateIngredient: (id: string, patch: Partial<Omit<Ingredient, "id">>) => void
  deleteIngredient: (id: string) => void
  saveCheck: (key: string) => void
  unhideAll: () => void
  setChecklistPeriod: (period: ChecklistPeriod) => void
  redeem: (customerId: string, rewardId: string) => boolean
  addPoints: (customerId: string, pts: number) => void
  createVoucher: (v: Omit<Voucher, "id" | "used">) => void
  toggleVoucher: (id: string) => void
  convertPreorder: (id: string) => void
  addPreorder: (o: Omit<Order, "id" | "total" | "status" | "createdMinsAgo">) => Order
  simulateIncoming: () => Order
}

export const useBakery = create<State>()(
  persist(
    (set, get) => ({
  orders: seedOrders,
  preorders: seedPreorders,
  products: seedProducts,
  ingredients: seedIngredients,
  customers: seedCustomers,
  vouchers: seedVouchers,
  checks: {},
  checklistPeriod: "daily",

  advanceOrder: (id) => {
    let updated: Order | undefined
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== id) return o
        const ns = nextStatus(o)
        updated = ns ? { ...o, status: ns } : o
        return updated
      }),
    }))
    return updated
  },

  setStatus: (id, status) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),

  adjustProduct: (id, delta) =>
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)) })),

  adjustIngredient: (id, delta) =>
    set((s) => ({
      ingredients: s.ingredients.map((i) =>
        i.id === id ? { ...i, stock: Math.max(0, roundQty(i.stock + delta)) } : i,
      ),
    })),

  addProduct: (input) => {
    const short = shortagesFor(input.recipe, input.stock, get().ingredients)
    if (short.length) return short
    set((s) => ({
      products: [{ ...input, id: `p${Date.now()}` }, ...s.products],
      ingredients: consume(input.recipe, input.stock, s.ingredients),
    }))
    return []
  },

  updateProduct: (id, patch) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  produceBatch: (id, qty) => {
    const p = get().products.find((x) => x.id === id)
    if (!p) return []
    const short = shortagesFor(p.recipe, qty, get().ingredients)
    if (short.length) return short
    set((s) => ({
      products: s.products.map((x) => (x.id === id ? { ...x, stock: x.stock + qty } : x)),
      ingredients: consume(p.recipe, qty, s.ingredients),
    }))
    return []
  },

  addIngredient: (input) => set((s) => ({ ingredients: [{ ...input, id: `i${Date.now()}` }, ...s.ingredients] })),

  updateIngredient: (id, patch) => set((s) => ({ ingredients: s.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

  deleteIngredient: (id) =>
    set((s) => ({
      ingredients: s.ingredients.filter((i) => i.id !== id),
      products: s.products.map((p) => ({ ...p, recipe: p.recipe.filter((l) => l.ingredientId !== id) })),
    })),

  saveCheck: (key) => set((s) => ({ checks: { ...s.checks, [key]: new Date().toISOString() } })),

  unhideAll: () => set({ checks: {} }),

  setChecklistPeriod: (checklistPeriod) => set({ checklistPeriod }),

  redeem: (customerId, rewardId) => {
    const r = rewards.find((x) => x.id === rewardId)
    const c = get().customers.find((x) => x.id === customerId)
    if (!r || !c || c.points < r.cost) return false
    set((s) => ({
      customers: s.customers.map((x) =>
        x.id === customerId ? { ...x, points: x.points - r.cost, tier: tierFor(x.points - r.cost) } : x,
      ),
    }))
    return true
  },

  addPoints: (customerId, pts) =>
    set((s) => ({
      customers: s.customers.map((x) => (x.id === customerId ? { ...x, points: x.points + pts, tier: tierFor(x.points + pts) } : x)),
    })),

  createVoucher: (v) =>
    set((s) => ({ vouchers: [{ ...v, id: `v${Date.now()}`, used: 0 }, ...s.vouchers] })),

  toggleVoucher: (id) => set((s) => ({ vouchers: s.vouchers.map((v) => (v.id === id ? { ...v, active: !v.active } : v)) })),

  convertPreorder: (id) =>
    set((s) => {
      const po = s.preorders.find((p) => p.id === id)
      if (!po) return s
      return {
        preorders: s.preorders.filter((p) => p.id !== id),
        orders: [{ ...po, preorderFor: undefined, status: "baking", createdMinsAgo: 0 }, ...s.orders],
      }
    }),

  addPreorder: (input) => {
    const o: Order = { ...input, id: `PO-${2300 + get().preorders.length}`, total: priceOf(input.items, get().products), status: "new", createdMinsAgo: 0 }
    set((s) => ({ preorders: [o, ...s.preorders] }))
    return o
  },

  simulateIncoming: () => {
    const i = Math.floor(Math.random() * 1000)
    const live = get().products.length ? get().products : products
    const items = [
      { productId: live[i % live.length].id, qty: (i % 3) + 1 },
      { productId: live[(i + 4) % live.length].id, qty: (i % 2) + 1 },
    ]
    const fulfilment = i % 2 === 0 ? "pickup" : "delivery"
    const o: Order = {
      id: nextOrderId(),
      customerId: customers[i % customers.length].id,
      items,
      total: priceOf(items, live),
      channel: i % 3 === 0 ? "Shopify POS" : "Shopify Web",
      fulfilment,
      provider: fulfilment === "delivery" ? (["Grab", "Lalamove", "foodpanda"] as const)[i % 3] : undefined,
      slot: ["10:30", "11:00", "12:00", "13:30"][i % 4],
      status: "new",
      createdMinsAgo: 0,
      payment: "Paid",
      address: fulfilment === "delivery" ? "Jalan Telawi 3, Bangsar" : undefined,
      riderEta: fulfilment === "delivery" ? 12 : undefined,
    }
    set((s) => ({ orders: [o, ...s.orders] }))
    return o
  },
    }),
    {
      name: "bakery-inventory",
      version: 1,
      // Only stock and checklist survive a reload: "hidden until tomorrow" means nothing otherwise.
      partialize: (s) => ({ products: s.products, ingredients: s.ingredients, checks: s.checks, checklistPeriod: s.checklistPeriod }),
    },
  ),
)

export const useCustomer = (id?: string) => useBakery((s) => s.customers.find((c) => c.id === id))
/** Orders outlive catalog edits, so fall back to the seed entry, then a placeholder, for deleted items. */
export const productById = (id: string): Product =>
  useBakery.getState().products.find((p) => p.id === id) ??
  products.find((p) => p.id === id) ?? { id, name: "Deleted item", emoji: "📦", category: "Bread", price: 0, stock: 0, par: 1, recipe: [] }
