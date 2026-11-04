import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Bike, Check, MapPin, PackageCheck, Store } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, KpiCard, PageHeader, Panel, ProviderChip, StatusBadge } from "@/components/common/bits"
import { Item, Stagger } from "@/components/common/motion"
import { productById, useBakery } from "@/store/useBakery"
import type { Order, Provider } from "@/data/mock"
import { money } from "@/config/brand"
import { cn } from "@/lib/utils"

const SLOT_CAP = 3
const quotes: { p: Provider; price: number; eta: number }[] = [
  { p: "Grab", price: 9.5, eta: 6 },
  { p: "Lalamove", price: 8.2, eta: 9 },
  { p: "foodpanda", price: 10.0, eta: 5 },
  { p: "In-house", price: 5.0, eta: 15 },
]
const steps = ["Booked", "Rider assigned", "Picked up", "Delivered"]

function MiniMap({ active }: { active: boolean }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl border bg-muted">
      <svg className="absolute inset-0 size-full" viewBox="0 0 400 180" preserveAspectRatio="none">
        <defs>
          <pattern id="blocks" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="var(--muted)" />
            <rect x="4" y="4" width="32" height="32" rx="6" fill="var(--oat)" />
          </pattern>
        </defs>
        <rect width="400" height="180" fill="url(#blocks)" />
        <path d="M0 120 C 80 120, 120 40, 200 60 S 320 140, 400 50" stroke="var(--input)" strokeWidth="14" fill="none" />
        <motion.path
          id="route"
          d="M40 128 C 100 120, 130 52, 200 62 S 310 130, 360 58"
          stroke="var(--paprika)"
          strokeWidth="4"
          strokeDasharray="8 8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4 }}
        />
      </svg>
      <span className="absolute top-[64%] left-[7%] grid size-9 place-items-center rounded-full bg-espresso text-gold shadow-warm-lg"><Store className="size-4" /></span>
      <span className="absolute top-[22%] right-[7%] grid size-9 place-items-center rounded-full bg-paprika text-white shadow-warm-lg">
        <MapPin className="size-4" />
      </span>
      {active && (
        <motion.span
          className="absolute grid size-9 place-items-center rounded-full bg-espresso text-gold shadow-warm-lg ring-4 ring-card"
          style={{ marginLeft: -18, marginTop: -18 }}
          initial={{ left: "10%", top: "71%" }}
          animate={{
            left: ["10%", "22%", "32%", "50%", "64%", "78%", "90%"],
            top: ["71%", "64%", "38%", "34%", "52%", "62%", "32%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Bike className="size-4" />
        </motion.span>
      )}
    </div>
  )
}

function DispatchCard({ o }: { o: Order }) {
  const customer = useBakery((s) => s.customers.find((c) => c.id === o.customerId))!
  const setStatus = useBakery((s) => s.setStatus)
  const [provider, setProvider] = useState<Provider>(o.provider ?? "Grab")
  const [step, setStep] = useState(o.status === "dispatched" ? 2 : -1)

  useEffect(() => {
    if (step < 0 || step >= 3) return
    const t = setTimeout(() => {
      setStep((s) => s + 1)
      if (step === 1) setStatus(o.id, "dispatched")
      if (step === 2) {
        setStatus(o.id, "completed")
        toast.success(`${o.id} delivered to ${customer.name.split(" ")[0]}`)
      }
    }, step === 2 ? 4500 : 1800)
    return () => clearTimeout(t)
  }, [step, o.id, setStatus, customer.name])

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="rounded-2xl border bg-background/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={customer.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {o.id} · {customer.name}
          </p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3" /> {o.address}
          </p>
        </div>
        <StatusBadge status={o.status} />
        <span className="text-sm font-semibold tabular-nums">{money(o.total)}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{o.items.map((it) => `${productById(it.productId).emoji} ${it.qty}× ${productById(it.productId).name}`).join(" · ")}</p>

      {step < 0 ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Live quotes</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {quotes.map((q) => (
              <button
                key={q.p}
                onClick={() => setProvider(q.p)}
                className={cn(
                  "rounded-xl border p-2 text-left transition-all",
                  provider === q.p ? "border-espresso bg-card shadow-warm ring-2 ring-espresso/10" : "bg-card/50 hover:bg-card",
                )}
              >
                <ProviderChip provider={q.p} />
                <p className="mt-1.5 text-sm font-semibold">{money(q.price)}</p>
                <p className="text-[11px] text-muted-foreground">~{q.eta} min pickup</p>
              </button>
            ))}
          </div>
          <Button
            className="mt-3 w-full rounded-xl bg-espresso text-flour hover:bg-espresso-soft"
            onClick={() => {
              setStep(0)
              toast(`Booking ${provider} rider…`)
            }}
          >
            <Bike /> Book {provider} rider
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  animate={{ scale: i === step ? [1, 1.2, 1] : 1, backgroundColor: i <= step ? "#5F8466" : "#F1EADE" }}
                  transition={{ repeat: i === step && step < 3 ? Infinity : 0, duration: 1.2 }}
                  className="grid size-7 place-items-center rounded-full text-white"
                >
                  {i <= step ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-muted-foreground/30" />}
                </motion.span>
                <span className={cn("text-center text-[10px] font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-1 mb-4 h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full bg-sage" animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.6 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function Fulfilment() {
  const orders = useBakery((s) => s.orders)
  const customers = useBakery((s) => s.customers)
  const setStatus = useBakery((s) => s.setStatus)

  const pickups = orders.filter((o) => o.fulfilment === "pickup" && o.status !== "completed")
  const slots = [...new Set(orders.filter((o) => o.fulfilment === "pickup").map((o) => o.slot))].sort()
  const deliveries = orders.filter((o) => o.fulfilment === "delivery" && (o.status === "ready" || o.status === "dispatched"))
  const onRoad = orders.filter((o) => o.status === "dispatched").length

  return (
    <>
      <PageHeader
        eyebrow="Out the door"
        title="Pickup & Delivery"
        description="Plan pickup slots and book Grab, Lalamove or foodpanda riders without leaving the dashboard."
      />

      <Stagger className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Item>
          <KpiCard label="Pickups waiting" value={pickups.length} />
        </Item>
        <Item>
          <KpiCard label="Ready to dispatch" value={deliveries.filter((d) => d.status === "ready").length} />
        </Item>
        <Item>
          <KpiCard label="Riders on the road" value={onRoad} />
        </Item>
        <Item>
          <KpiCard label="Avg. delivery time" value={27} format={(n) => `${Math.round(n)} min`} hint="6 min faster than last week" />
        </Item>
      </Stagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel title="Pickup slots" description={`Up to ${SLOT_CAP} orders per 30-min slot`} className="lg:col-span-2">
          <ul className="space-y-3">
            {slots.map((slot) => {
              const inSlot = orders.filter((o) => o.fulfilment === "pickup" && o.slot === slot)
              const waiting = inSlot.filter((o) => o.status !== "completed")
              const full = inSlot.length >= SLOT_CAP
              return (
                <li key={slot} className="rounded-2xl border bg-background/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{slot}</span>
                    <span className="flex items-center gap-1">
                      {Array.from({ length: SLOT_CAP }).map((_, i) => (
                        <span key={i} className={cn("h-2 w-5 rounded-full", i < inSlot.length ? (full ? "bg-destructive" : "bg-gold") : "bg-muted")} />
                      ))}
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {waiting.map((o) => {
                      const c = customers.find((x) => x.id === o.customerId)!
                      return (
                        <motion.div
                          key={o.id}
                          layout
                          exit={{ opacity: 0, x: 40, height: 0 }}
                          className="mt-2 flex items-center gap-2 overflow-hidden rounded-xl bg-card p-2 text-sm shadow-warm"
                        >
                          <Avatar name={c.name} className="size-7 text-[10px]" />
                          <span className="min-w-0 flex-1 truncate">
                            <b>{o.id}</b> · {c.name}
                          </span>
                          {o.status === "ready" ? (
                            <Button
                              size="xs"
                              className="rounded-md bg-sage-ink text-white hover:bg-sage-ink/90"
                              onClick={() => {
                                setStatus(o.id, "completed")
                                toast.success(`${o.id} collected by ${c.name.split(" ")[0]}`)
                              }}
                            >
                              <PackageCheck /> Collected
                            </Button>
                          ) : (
                            <StatusBadge status={o.status} />
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  {waiting.length === 0 && <p className="mt-1 text-xs text-muted-foreground">All collected ✓</p>}
                </li>
              )
            })}
          </ul>
        </Panel>

        <div className="space-y-6 lg:col-span-3">
          <Panel title="Live tracking" description="Rider positions refresh in real time via the provider's API">
            <MiniMap active={onRoad > 0} />
          </Panel>
          <Panel title="Dispatch queue" description="Compare provider quotes and book in one tap">
            <div className="space-y-3">
              <AnimatePresence>
                {deliveries.map((o) => (
                  <DispatchCard key={o.id} o={o} />
                ))}
              </AnimatePresence>
              {deliveries.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No deliveries waiting</p>}
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
