import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "motion/react"
import { Cake, Mail, MessageCircle, Phone, Search, Sparkles, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, KpiCard, PageHeader, StatusBadge, TierBadge } from "@/components/common/bits"
import { Item, Stagger } from "@/components/common/motion"
import { productById, useBakery } from "@/store/useBakery"
import { money } from "@/config/brand"
import { cn } from "@/lib/utils"
import type { Customer, Tier } from "@/data/mock"
import { tiers } from "@/data/mock"

function Profile({ c, onClose }: { c?: Customer; onClose: () => void }) {
  const allOrders = useBakery((s) => s.orders)
  const orders = useMemo(() => allOrders.filter((o) => o.customerId === c?.id), [allOrders, c?.id])
  const addPoints = useBakery((s) => s.addPoints)
  const live = useBakery((s) => s.customers.find((x) => x.id === c?.id))
  const cust = live ?? c
  const next = cust ? tiers.find((t) => t.min > cust.points) : undefined
  return (
    <Sheet open={!!c} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {cust && (
          <>
            <SheetHeader className="relative overflow-hidden border-b bg-secondary/60 pb-6">
              <Avatar name={cust.name} className="size-16 text-lg" />
              <SheetTitle className="font-display text-2xl">{cust.name}</SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                <TierBadge tier={cust.tier} /> <span>Member since {cust.joined}</span>
              </SheetDescription>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="rounded-lg bg-card" onClick={() => toast(`Calling ${cust.phone}…`)}>
                  <Phone /> Call
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg bg-card" onClick={() => toast(`WhatsApp chat opened`)}>
                  <MessageCircle /> WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg bg-card" onClick={() => toast(`Email drafted to ${cust.email}`)}>
                  <Mail /> Email
                </Button>
              </div>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["Lifetime", money(cust.lifetimeSpend)],
                  ["Orders", cust.orders],
                  ["Points", cust.points.toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-secondary p-3">
                    <p className="text-[11px] text-muted-foreground">{k}</p>
                    <motion.p key={String(v)} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-display text-lg font-semibold">
                      {v}
                    </motion.p>
                  </div>
                ))}
              </div>

              {next && (
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress to {next.name}</span>
                    <span className="font-semibold">{next.min - cust.points} pts to go</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gold"
                      animate={{ width: `${(cust.points / next.min) * 100}%` }}
                      transition={{ type: "spring", stiffness: 80 }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Favourite</p>
                  <p className="font-semibold">{cust.favourite}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">
                    <Cake className="mr-1 inline size-3" />
                    Birthday
                  </p>
                  <p className="font-semibold">{cust.birthday}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {cust.tags.map((t) => (
                    <span key={t} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                      {t}
                    </span>
                  ))}
                  <button className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-espresso/30 hover:text-espresso">+ tag</button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Staff notes</p>
                <Textarea defaultValue={cust.notes} className="min-h-20 bg-card" />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Recent orders</p>
                <ul className="space-y-2">
                  {orders.slice(0, 4).map((o) => (
                    <li key={o.id} className="flex items-center gap-2 rounded-xl border p-2.5 text-sm">
                      <span className="text-lg">{productById(o.items[0].productId).emoji}</span>
                      <span className="flex-1 font-medium">{o.id}</span>
                      <StatusBadge status={o.status} pickup={o.fulfilment === "pickup"} />
                      <span className="w-20 text-right tabular-nums">{money(o.total)}</span>
                    </li>
                  ))}
                  {orders.length === 0 && <li className="text-sm text-muted-foreground">No orders today.</li>}
                </ul>
              </div>

              <Button
                className="h-11 w-full rounded-xl bg-paprika text-white hover:bg-paprika-dark"
                onClick={() => {
                  addPoints(cust.id, 100)
                  toast.success(`+100 goodwill points for ${cust.name.split(" ")[0]}`)
                }}
              >
                <Sparkles /> Gift 100 points
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default function Customers() {
  const customers = useBakery((s) => s.customers)
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState("")
  const [tier, setTier] = useState<"All" | Tier>("All")

  const list = useMemo(
    () =>
      customers.filter(
        (c) =>
          (tier === "All" || c.tier === tier) &&
          (!q || [c.name, c.email, c.phone, ...c.tags].some((f) => f.toLowerCase().includes(q.toLowerCase()))),
      ),
    [customers, q, tier],
  )
  const selected = customers.find((c) => c.id === params.get("c"))
  const avg = customers.reduce((s, c) => s + c.lifetimeSpend, 0) / customers.length

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Every Shopify and walk-in customer in one place, with orders, favourites, allergies and birthdays."
        actions={
          <Button className="h-10 rounded-xl bg-espresso text-flour hover:bg-espresso-soft" onClick={() => toast("New customer form (coming in build)")}>
            <UserPlus /> Add customer
          </Button>
        }
      />

      <Stagger className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Item>
          <KpiCard label="Total customers" value={2847} delta={6.2} hint="this month" />
        </Item>
        <Item>
          <KpiCard label="Repeat rate" value={64} format={(n) => `${Math.round(n)}%`} delta={3.1} />
        </Item>
        <Item>
          <KpiCard label="Avg. lifetime value" value={avg} format={money} />
        </Item>
        <Item>
          <KpiCard label="Birthdays this month" value={38} hint="auto-voucher ready" />
        </Item>
      </Stagger>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, email or tag" className="h-10 rounded-xl bg-card pl-9" />
        </div>
        <div className="flex gap-1 rounded-xl border bg-card p-1 shadow-warm">
          {(["All", "Crumb", "Croissant", "Gâteau"] as const).map((t) => (
            <button key={t} onClick={() => setTier(t)} className={cn("relative rounded-lg px-3 py-1.5 text-sm font-medium", tier === t ? "text-flour" : "text-muted-foreground")}>
              {tier === t && <motion.span layoutId="tier-pill" className="absolute inset-0 rounded-lg bg-espresso" />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-warm">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b bg-secondary/60 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
          <span>Customer</span>
          <span>Tier</span>
          <span>Points</span>
          <span>Lifetime spend</span>
          <span>Last order</span>
        </div>
        <motion.ul layout className="divide-y">
          {list.map((c, i) => (
            <motion.li
              layout
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => setParams({ c: c.id })}
              className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/70 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:gap-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar name={c.name} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{c.email}</span>
                </span>
              </span>
              <span>
                <TierBadge tier={c.tier} />
              </span>
              <span className="hidden font-semibold tabular-nums md:block">{c.points.toLocaleString()} pts</span>
              <span className="hidden tabular-nums md:block">{money(c.lifetimeSpend)}</span>
              <span className="hidden text-sm text-muted-foreground md:block">{c.lastOrderDaysAgo === 0 ? "Today" : `${c.lastOrderDaysAgo}d ago`}</span>
            </motion.li>
          ))}
        </motion.ul>
        {list.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No customers match. Try another search</p>}
      </div>

      <Profile c={selected} onClose={() => setParams({})} />
    </>
  )
}
