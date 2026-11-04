import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { ArrowUpRight, Plus } from "lucide-react"
import { toast } from "sonner"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { KpiCard, PageHeader, Panel, StatusBadge, EmojiTile, ProviderChip, Avatar } from "@/components/common/bits"
import { Item, Stagger } from "@/components/common/motion"
import { productById, useBakery } from "@/store/useBakery"
import { salesTrend, topSellers } from "@/data/mock"
import { money, moneyShort } from "@/config/brand"

const salesConfig = {
  pickup: { label: "Pickup", color: "var(--espresso)" },
  delivery: { label: "Delivery", color: "var(--paprika)" },
} satisfies ChartConfig

const sellersConfig = { sold: { label: "Units sold" } } satisfies ChartConfig

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}

export default function Dashboard() {
  const orders = useBakery((s) => s.orders)
  const preorders = useBakery((s) => s.preorders)
  const products = useBakery((s) => s.products)
  const customers = useBakery((s) => s.customers)
  const simulate = useBakery((s) => s.simulateIncoming)

  const revenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders])
  const lowStock = products.filter((p) => p.stock < p.par * 0.3)
  const dueSoon = preorders.filter((p) => (p.preorderFor ?? 99) <= 1)
  const pickupCount = orders.filter((o) => o.fulfilment === "pickup").length
  const deliveryCount = orders.length - pickupCount
  const mix = [
    { name: "pickup", value: pickupCount, fill: "var(--espresso)" },
    { name: "delivery", value: deliveryCount, fill: "var(--paprika)" },
  ]
  const active = orders.filter((o) => o.status !== "completed")
  const stageCounts = (["new", "baking", "ready", "dispatched"] as const).map((s) => ({ s, n: orders.filter((o) => o.status === s).length }))

  const incoming = () => {
    const o = simulate()
    const c = customers.find((x) => x.id === o.customerId)
    toast(`New order ${o.id}`, { description: `${c?.name} · ${money(o.total)} · ${o.fulfilment}` })
  }

  // a "live" feel: a new Shopify order drops in every ~25s
  useEffect(() => {
    const t = setInterval(incoming, 25000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting()}, Loong`}
        description="The ovens are warm. Here's how the bakery is doing today."
        actions={
          <>
            <Button variant="outline" className="h-10 rounded-xl bg-card" onClick={incoming}>
              Simulate Shopify order
            </Button>
            <Button nativeButton={false} render={<Link to="/app/preorders" />} className="h-10 rounded-xl bg-paprika text-white hover:bg-paprika-dark">
              <Plus /> New pre-order
            </Button>
          </>
        }
      />

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Item>
          <KpiCard label="Today's revenue" value={revenue} format={(n) => money(n)} delta={12.4} hint="vs last Tue" />
        </Item>
        <Item>
          <KpiCard label="Orders today" value={orders.length} delta={8.1} hint={`${active.length} in progress`} />
        </Item>
        <Item>
          <KpiCard label="Pre-orders due ≤ 24h" value={dueSoon.length} hint={`${preorders.length} booked this fortnight`} />
        </Item>
        <Item>
          <KpiCard label="Low-stock items" value={lowStock.length} delta={-2} hint="needs a bake" />
        </Item>
      </Stagger>

      {/* pipeline strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border bg-card p-2 shadow-warm sm:grid-cols-4"
      >
        {stageCounts.map(({ s, n }) => (
          <Link key={s} to="/app/orders" className="group flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-muted">
            <StatusBadge status={s} />
            <motion.span key={n} initial={{ scale: 1.6, color: "#B5462F" }} animate={{ scale: 1, color: "#2B1D16" }} className="font-display text-2xl font-semibold">
              {n}
            </motion.span>
          </Link>
        ))}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="Sales, last 14 days"
          description="Pickup vs delivery revenue"
          className="lg:col-span-2"
          action={<span className="rounded-full bg-sage/15 px-2.5 py-1 text-xs font-semibold text-sage-ink">▲ 18% WoW</span>}
        >
          <ChartContainer config={salesConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart data={salesTrend} margin={{ left: -12, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gPickup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-pickup)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-pickup)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gDelivery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-delivery)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-delivery)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => moneyShort(v)} width={64} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area dataKey="delivery" type="monotone" stackId="a" stroke="var(--color-delivery)" strokeWidth={2.5} fill="url(#gDelivery)" />
              <Area dataKey="pickup" type="monotone" stackId="a" stroke="var(--color-pickup)" strokeWidth={2.5} fill="url(#gPickup)" />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </Panel>

        <Panel title="Pickup vs delivery" description="Today's fulfilment mix">
          <ChartContainer config={salesConfig} className="mx-auto aspect-square h-[200px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={mix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4} cornerRadius={8} strokeWidth={0}>
                {mix.map((m) => (
                  <Cell key={m.name} fill={m.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="font-display text-2xl font-semibold text-espresso">{pickupCount}</p>
            </div>
            <div className="rounded-xl bg-accent p-3">
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="font-display text-2xl font-semibold text-paprika">{deliveryCount}</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="Live order feed"
          description="Streaming in from Shopify"
          className="lg:col-span-2"
          action={
            <Link to="/app/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-paprika hover:underline">
              Kitchen board <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          <ul className="divide-y">
            <AnimatePresence initial={false}>
              {orders.slice(0, 6).map((o) => {
                const c = customers.find((x) => x.id === o.customerId)!
                const first = productById(o.items[0].productId)
                return (
                  <motion.li
                    key={o.id}
                    layout
                    initial={{ opacity: 0, height: 0, backgroundColor: "rgba(212,162,76,0.35)" }}
                    animate={{ opacity: 1, height: "auto", backgroundColor: "rgba(212,162,76,0)" }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3 rounded-lg px-1 py-3"
                  >
                    <EmojiTile emoji={first.emoji} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {c.name} <span className="font-normal text-muted-foreground">· {o.id}</span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.items.map((it) => `${it.qty}× ${productById(it.productId).name}`).join(", ")}
                      </p>
                    </div>
                    <div className="hidden sm:block">{o.provider ? <ProviderChip provider={o.provider} /> : <span className="text-xs text-muted-foreground">Pickup {o.slot}</span>}</div>
                    <StatusBadge status={o.status} pickup={o.fulfilment === "pickup"} />
                    <span className="w-20 text-right text-sm font-semibold tabular-nums">{money(o.total)}</span>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Top sellers" description="This week">
            <ChartContainer config={sellersConfig} className="aspect-auto h-[180px] w-full">
              <BarChart data={topSellers} layout="vertical" margin={{ left: 0, right: 12 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={72} />
                <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="sold" radius={8} barSize={18}>
                  {topSellers.map((t) => (
                    <Cell key={t.name} fill={t.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </Panel>

          <Panel title="Running low" description="Below 30% of par" action={<Link to="/app/inventory" className="text-xs font-semibold text-paprika hover:underline">Manage</Link>}>
            <ul className="space-y-3">
              {lowStock.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <EmojiTile emoji={p.emoji} size="sm" />
                  <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                    {p.stock}/{p.par}
                  </span>
                </li>
              ))}
              {lowStock.length === 0 && <li className="text-sm text-muted-foreground">All shelves stocked</li>}
            </ul>
          </Panel>

          <Panel title="Top customers" description="By lifetime spend">
            <div className="flex -space-x-2">
              {customers.slice(0, 6).map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <Link to={`/app/customers?c=${c.id}`} title={c.name}>
                    <Avatar name={c.name} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
