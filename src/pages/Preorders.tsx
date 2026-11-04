import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChefHat, Plus, Printer, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, EmojiTile, PageHeader, Panel, ProviderChip } from "@/components/common/bits"
import { productById, useBakery } from "@/store/useBakery"
import { money } from "@/config/brand"
import { cn } from "@/lib/utils"
import type { Fulfilment } from "@/data/mock"

const CAPACITY = 8 // whole cakes per day

const dayDate = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

function NewPreorderDialog({ open, setOpen, defaultDay }: { open: boolean; setOpen: (v: boolean) => void; defaultDay: number }) {
  const customers = useBakery((s) => s.customers)
  const products = useBakery((s) => s.products)
  const add = useBakery((s) => s.addPreorder)
  const [customerId, setCustomerId] = useState(customers[0].id)
  const [productId, setProductId] = useState(() => products.find((p) => p.id === "p6")?.id ?? products[0]?.id ?? "")
  const [qty, setQty] = useState(1)
  const [day, setDay] = useState(defaultDay)
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup")
  const [deposit, setDeposit] = useState(false)

  const total = (products.find((p) => p.id === productId)?.price ?? 0) * qty

  const submit = () => {
    const o = add({
      customerId,
      items: [{ productId, qty }],
      channel: "WhatsApp",
      fulfilment,
      provider: fulfilment === "delivery" ? "Lalamove" : undefined,
      slot: "11:00",
      preorderFor: day,
      payment: deposit ? "Deposit 50%" : "Paid",
    })
    toast.success(`Pre-order ${o.id} booked`, { description: `${dayDate(day).toDateString()} · payment link sent to customer` })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New pre-order</DialogTitle>
          <DialogDescription>For phone and WhatsApp orders. A Shopify payment link goes to the customer automatically.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(v: string) => customers.find((c) => c.id === v)?.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <div className="grid gap-1.5">
              <Label>Product</Label>
              <Select value={productId} onValueChange={(v) => v && setProductId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => { const p = products.find((x) => x.id === v); return p ? `${p.emoji} ${p.name}` : "" }}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.emoji} {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Qty</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Date</Label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium", day === d ? "border-paprika bg-paprika text-white" : "bg-card")}
                >
                  {dayDate(d).toLocaleDateString("en-MY", { weekday: "short", day: "numeric" })}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["pickup", "delivery"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFulfilment(f)}
                className={cn("rounded-xl border p-3 text-left text-sm font-medium capitalize transition", fulfilment === f ? "border-espresso bg-secondary ring-2 ring-espresso/20" : "bg-card")}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={deposit} onChange={(e) => setDeposit(e.target.checked)} className="size-4 accent-[var(--paprika)]" />
            Collect 50% deposit only
          </label>
        </div>
        <DialogFooter className="items-center sm:justify-between">
          <p className="text-sm">
            Total <span className="font-display text-xl font-semibold">{money(total)}</span>
          </p>
          <Button className="bg-paprika text-white hover:bg-paprika-dark" onClick={submit}>
            Book pre-order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Preorders() {
  const preorders = useBakery((s) => s.preorders)
  const customers = useBakery((s) => s.customers)
  const convert = useBakery((s) => s.convertPreorder)
  const [selected, setSelected] = useState(1)
  const [dialog, setDialog] = useState(false)

  const days = Array.from({ length: 14 }, (_, i) => i)
  const byDay = useMemo(() => {
    const m = new Map<number, typeof preorders>()
    preorders.forEach((p) => m.set(p.preorderFor ?? 0, [...(m.get(p.preorderFor ?? 0) ?? []), p]))
    return m
  }, [preorders])

  const dayOrders = byDay.get(selected) ?? []
  const bakeList = useMemo(() => {
    const m = new Map<string, number>()
    dayOrders.forEach((o) => o.items.forEach((it) => m.set(it.productId, (m.get(it.productId) ?? 0) + it.qty)))
    return [...m.entries()].map(([id, qty]) => ({ p: productById(id), qty })).sort((a, b) => b.qty - a.qty)
  }, [dayOrders])
  const cakesFor = (list: typeof preorders) =>
    list.reduce((s, o) => s + o.items.filter((i) => productById(i.productId).category === "Cakes").reduce((a, b) => a + b.qty, 0), 0)
  const deposits = preorders.filter((p) => p.payment !== "Paid")

  return (
    <>
      <PageHeader
        eyebrow="Plan ahead"
        title="Pre-orders"
        description="Custom cakes and bulk orders, booked up to 14 days ahead with daily capacity caps."
        actions={
          <>
            <Button variant="outline" className="h-10 rounded-xl bg-card" onClick={() => toast("Bake sheet sent to kitchen printer")}>
              <Printer /> Print bake sheet
            </Button>
            <Button className="h-10 rounded-xl bg-paprika text-white hover:bg-paprika-dark" onClick={() => setDialog(true)}>
              <Plus /> New pre-order
            </Button>
          </>
        }
      />

      {/* date strip */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
        {days.map((d) => {
          const list = byDay.get(d) ?? []
          const cakes = cakesFor(list)
          const load = Math.min(1, cakes / CAPACITY)
          const date = dayDate(d)
          const active = d === selected
          return (
            <motion.button
              key={d}
              onClick={() => setSelected(d)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative w-[84px] shrink-0 overflow-hidden rounded-2xl border p-3 text-left transition-colors",
                active ? "border-espresso bg-espresso text-flour shadow-warm-lg" : "bg-card shadow-warm hover:border-espresso/30",
              )}
            >
              <p className={cn("text-[11px] font-semibold uppercase", active ? "text-gold" : "text-muted-foreground")}>
                {d === 0 ? "Today" : d === 1 ? "Tmrw" : date.toLocaleDateString("en-MY", { weekday: "short" })}
              </p>
              <p className="font-display text-2xl font-semibold">{date.getDate()}</p>
              <p className={cn("text-[11px]", active ? "text-flour/70" : "text-muted-foreground")}>{list.length} orders</p>
              <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", active ? "bg-white/15" : "bg-muted")}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${load * 100}%` }}
                  className={cn("h-full rounded-full", load >= 1 ? "bg-destructive" : load > 0.6 ? "bg-gold" : "bg-sage")}
                />
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title={`${dayDate(selected).toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}`}
          description={`${dayOrders.length} pre-orders · ${cakesFor(dayOrders)}/${CAPACITY} cake slots used`}
          className="lg:col-span-2"
        >
          <AnimatePresence mode="popLayout">
            {dayOrders.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid place-items-center py-16 text-center">
                <p className="font-semibold">No pre-orders yet</p>
                <p className="text-sm text-muted-foreground">This day is wide open for bookings.</p>
              </motion.div>
            ) : (
              <motion.ul key={selected} className="space-y-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
                {dayOrders.map((o) => {
                  const c = customers.find((x) => x.id === o.customerId)!
                  return (
                    <motion.li
                      key={o.id}
                      layout
                      exit={{ opacity: 0, x: 60 }}
                      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border bg-background/60 p-3 transition-colors hover:border-espresso/30"
                    >
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {c.name} <span className="font-normal text-muted-foreground">· {o.id}</span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.items.map((it) => `${productById(it.productId).emoji} ${it.qty}× ${productById(it.productId).name}`).join(" · ")}
                        </p>
                        {o.note && <p className="mt-1 text-xs text-gold-ink">{o.note}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {o.provider ? <ProviderChip provider={o.provider} /> : <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-bold text-espresso">{o.slot}</span>}
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold",
                            o.payment === "Paid" ? "bg-sage/15 text-sage-ink" : "bg-gold/20 text-gold-ink",
                          )}
                        >
                          {o.payment}
                        </span>
                        <span className="w-20 text-right text-sm font-semibold tabular-nums">{money(o.total)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => {
                            convert(o.id)
                            toast.success(`${o.id} sent to the kitchen board`)
                          }}
                        >
                          <ChefHat /> Start
                        </Button>
                      </div>
                    </motion.li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </Panel>

        <div className="space-y-6">
          <Panel title="Bake list" description="Auto-totalled per product for the selected day">
            {bakeList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing to prep.</p>
            ) : (
              <ul className="space-y-2.5">
                {bakeList.map(({ p, qty }, i) => (
                  <motion.li
                    key={p.id + selected}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <EmojiTile emoji={p.emoji} size="sm" />
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    <span className="font-display text-xl font-semibold">×{qty}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Outstanding deposits" description={`${deposits.length} customers owe a balance`}>
            <div className="flex items-center gap-3 rounded-xl bg-gold/15 p-3">
              <Wallet className="size-5 text-gold-ink" />
              <div className="flex-1">
                <p className="text-xs text-gold-ink">Balance to collect</p>
                <p className="font-display text-2xl font-semibold text-espresso">{money(deposits.reduce((s, d) => s + d.total / 2, 0))}</p>
              </div>
              <Button size="sm" className="bg-espresso text-flour" onClick={() => toast.success(`Reminders sent to ${deposits.length} customers`)}>
                Remind
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <NewPreorderDialog open={dialog} setOpen={setDialog} defaultDay={Math.max(1, selected)} key={String(dialog)} />
    </>
  )
}
