import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { Check, ChevronRight, Clock, Columns3, MapPin, Rows3, Search, StickyNote } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmojiTile, PageHeader, ProviderChip, StatusBadge, statusMeta, Avatar, TierBadge } from "@/components/common/bits"
import { nextStatus, productById, statusFlow, useBakery } from "@/store/useBakery"
import type { Order, OrderStatus } from "@/data/mock"
import { money } from "@/config/brand"
import { cn } from "@/lib/utils"

const columns: OrderStatus[] = ["new", "baking", "ready", "dispatched", "completed"]

export function advanceLabel(o: Order) {
  switch (o.status) {
    case "new":
      return "Start baking"
    case "baking":
      return "Mark ready"
    case "ready":
      return o.fulfilment === "pickup" ? "Picked up" : "Hand to rider"
    case "dispatched":
      return "Delivered"
    default:
      return null
  }
}

function useAdvance() {
  const advance = useBakery((s) => s.advanceOrder)
  return (o: Order) => {
    const u = advance(o.id)
    if (u) {
      const m = statusMeta[u.status]
      toast.success(`${o.id} → ${u.status === "completed" && u.fulfilment === "pickup" ? "Picked up" : m.label}`, {
        description: u.status === "dispatched" ? `${u.provider} rider is on the way` : u.status === "ready" ? "Customer notified via WhatsApp & email" : undefined,
      })
    }
  }
}

function OrderCard({ o, onOpen }: { o: Order; onOpen: () => void }) {
  const customer = useBakery((s) => s.customers.find((c) => c.id === o.customerId))!
  const advance = useAdvance()
  const label = advanceLabel(o)
  const first = productById(o.items[0].productId)
  return (
    <motion.div
      layoutId={o.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="group cursor-pointer rounded-2xl border bg-card p-3.5 shadow-warm transition-shadow hover:shadow-warm-lg"
      onClick={onOpen}
    >
      <div className="flex items-start gap-3">
        <EmojiTile emoji={first.emoji} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold whitespace-nowrap">{o.id}</p>
            <span className="text-sm font-semibold whitespace-nowrap tabular-nums">{money(o.total)}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{customer.name}</p>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 text-xs text-espresso/80">
        {o.items.map((it) => `${it.qty}× ${productById(it.productId).name}`).join(" · ")}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Clock className="size-3" /> {o.fulfilment === "pickup" ? "Pickup" : "Deliver"} {o.slot}
        </span>
        {o.provider ? <ProviderChip provider={o.provider} /> : <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-bold text-espresso">Pickup</span>}
      </div>
      {o.note && (
        <p className="mt-2 flex items-start gap-1 rounded-lg bg-gold/15 px-2 py-1 text-[11px] text-gold-ink">
          <StickyNote className="mt-0.5 size-3 shrink-0" /> {o.note}
        </p>
      )}
      {label && (
        <Button
          size="sm"
          className="mt-3 h-8 w-full rounded-lg bg-espresso text-flour opacity-90 hover:bg-espresso-soft group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            advance(o)
          }}
        >
          {label} <ChevronRight />
        </Button>
      )}
    </motion.div>
  )
}

function OrderSheet({ order, onClose }: { order?: Order; onClose: () => void }) {
  const customer = useBakery((s) => s.customers.find((c) => c.id === order?.customerId))
  const live = useBakery((s) => s.orders.find((o) => o.id === order?.id))
  const advance = useAdvance()
  const o = live ?? order
  return (
    <Sheet open={!!order} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {o && customer && (
          <>
            <SheetHeader className="border-b bg-secondary/60">
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} pickup={o.fulfilment === "pickup"} />
                <span className="text-xs text-muted-foreground">{o.channel}</span>
              </div>
              <SheetTitle className="font-display text-2xl">Order {o.id}</SheetTitle>
              <SheetDescription>
                Placed {o.createdMinsAgo === 0 ? "just now" : `${o.createdMinsAgo} min ago`} · {o.payment}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              {/* timeline */}
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Progress</p>
                <div className="flex items-center">
                  {statusFlow(o).map((s, i, arr) => {
                    const idx = arr.indexOf(o.status)
                    const done = i <= idx
                    return (
                      <div key={s} className="flex flex-1 items-center last:flex-none">
                        <motion.div
                          animate={{ scale: 1 }}
                          className={cn(
                            "grid size-8 place-items-center rounded-full text-xs font-semibold transition-colors",
                            done ? "bg-espresso text-gold" : "bg-muted text-muted-foreground",
                          )}
                          title={statusMeta[s].label}
                        >
                          {i < idx ? <Check className="size-4" /> : i + 1}
                        </motion.div>
                        {i < arr.length - 1 && (
                          <div className="mx-1 h-1 flex-1 overflow-hidden rounded-full bg-muted">
                            <motion.div className="h-full bg-espresso" initial={false} animate={{ width: i < idx ? "100%" : "0%" }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} />
                  <div className="flex-1">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                  <TierBadge tier={customer.tier} />
                </div>
                {o.address && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-paprika" /> {o.address}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Items</p>
                <ul className="space-y-2">
                  {o.items.map((it) => {
                    const p = productById(it.productId)
                    return (
                      <li key={it.productId} className="flex items-center gap-3">
                        <EmojiTile emoji={p.emoji} size="sm" />
                        <span className="flex-1 text-sm">
                          {it.qty}× {p.name}
                        </span>
                        <span className="text-sm tabular-nums">{money(p.price * it.qty)}</span>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span>{money(o.total)}</span>
                </div>
              </div>

              {o.note && <p className="rounded-xl bg-gold/15 p-3 text-sm text-gold-ink">{o.note}</p>}

              {nextStatus(o) && (
                <Button className="h-11 w-full rounded-xl bg-paprika text-white hover:bg-paprika-dark" onClick={() => advance(o)}>
                  {advanceLabel(o)} <ChevronRight />
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default function Orders() {
  const orders = useBakery((s) => s.orders)
  const customers = useBakery((s) => s.customers)
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<"board" | "table">("board")
  const [q, setQ] = useState("")
  const [type, setType] = useState<string>("all")
  const [channel, setChannel] = useState<string>("all")

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const c = customers.find((x) => x.id === o.customerId)
        const hit = !q || o.id.toLowerCase().includes(q.toLowerCase()) || c?.name.toLowerCase().includes(q.toLowerCase())
        return hit && (type === "all" || o.fulfilment === type) && (channel === "all" || o.channel === channel)
      }),
    [orders, customers, q, type, channel],
  )

  const openId = params.get("o")
  const openOrder = orders.find((o) => o.id === openId)
  const open = (id: string) => setParams({ o: id })
  const close = () => setParams({})

  return (
    <>
      <PageHeader
        eyebrow="Kitchen board"
        title="Orders"
        description="Every Shopify order in one place. Move them from oven to doorstep and customers get notified automatically."
        actions={
          <div className="flex rounded-xl border bg-card p-1 shadow-warm">
            {(["board", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium capitalize", view === v ? "text-flour" : "text-muted-foreground")}
              >
                {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-lg bg-espresso" />}
                <span className="relative flex items-center gap-1.5">
                  {v === "board" ? <Columns3 className="size-4" /> : <Rows3 className="size-4" />} {v}
                </span>
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order or customer" className="h-10 rounded-xl bg-card pl-9" />
        </div>
        <Select value={type} onValueChange={(v) => setType(v ?? "all")}>
          <SelectTrigger className="h-10! rounded-xl bg-card">
            <SelectValue>{(v: string) => (v === "all" ? "All fulfilment" : v === "pickup" ? "Pickup" : "Delivery")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fulfilment</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={(v) => setChannel(v ?? "all")}>
          <SelectTrigger className="h-10! rounded-xl bg-card">
            <SelectValue>{(v: string) => (v === "all" ? "All channels" : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="Shopify Web">Shopify Web</SelectItem>
            <SelectItem value="Shopify POS">Shopify POS</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} orders</span>
      </div>

      <AnimatePresence mode="wait">
        {view === "board" ? (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LayoutGroup>
              <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8 2xl:mx-0 2xl:grid 2xl:grid-cols-5 2xl:overflow-visible 2xl:px-0">
                {columns.map((col) => {
                  const items = filtered.filter((o) => o.status === col)
                  const m = statusMeta[col]
                  return (
                    <div key={col} className="w-72 shrink-0 snap-start rounded-3xl bg-secondary/60 p-3 2xl:w-auto">
                      <div className="mb-3 flex items-center justify-between px-1">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <span className={cn("size-2 rounded-full", m.dot)} /> {col === "completed" ? "Completed" : m.label}
                        </span>
                        <motion.span key={items.length} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="grid min-w-6 place-items-center rounded-full bg-card px-1.5 text-xs font-bold shadow-warm">
                          {items.length}
                        </motion.span>
                      </div>
                      <div className="flex min-h-32 flex-col gap-3">
                        <AnimatePresence>
                          {items.map((o) => (
                            <OrderCard key={o.id} o={o} onOpen={() => open(o.id)} />
                          ))}
                        </AnimatePresence>
                        {items.length === 0 && (
                          <div className="grid flex-1 place-items-center rounded-2xl border-2 border-dashed border-border py-8 text-xs text-muted-foreground">
                            Nothing here yet
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </LayoutGroup>
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-2xl border bg-card shadow-warm">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead>Fulfilment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o, i) => {
                  const c = customers.find((x) => x.id === o.customerId)!
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => open(o.id)}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/70"
                    >
                      <TableCell className="pl-4 font-semibold">{o.id}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Avatar name={c.name} className="size-7 text-[10px]" /> {c.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-60 truncate text-muted-foreground md:table-cell">
                        {o.items.map((it) => `${productById(it.productId).emoji} ${it.qty}`).join("  ")}
                      </TableCell>
                      <TableCell>{o.provider ? <ProviderChip provider={o.provider} /> : <span className="text-xs">{o.slot}</span>}</TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} pickup={o.fulfilment === "pickup"} />
                      </TableCell>
                      <TableCell className="pr-4 text-right font-semibold tabular-nums">{money(o.total)}</TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderSheet order={openOrder} onClose={close} />
    </>
  )
}
