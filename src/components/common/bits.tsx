import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { OrderStatus, Tier, Provider } from "@/data/mock"
import { AnimatedNumber } from "./motion"
import { TrendingDown, TrendingUp } from "lucide-react"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-semibold text-espresso md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  )
}

export function EmojiTile({ emoji, size = "md", className }: { emoji: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "size-8 text-base rounded-lg", md: "size-11 text-2xl rounded-xl", lg: "size-16 text-4xl rounded-2xl" }[size]
  return (
    <span className={cn("inline-grid shrink-0 place-items-center bg-muted", s, className)}>{emoji}</span>
  )
}

export const statusMeta: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  new: { label: "New", className: "bg-paprika/10 text-paprika-dark ring-paprika/25", dot: "bg-paprika" },
  baking: { label: "Baking", className: "bg-gold/15 text-gold-ink ring-gold/40", dot: "bg-gold" },
  ready: { label: "Ready", className: "bg-sage/15 text-sage-ink ring-sage/30", dot: "bg-sage" },
  dispatched: { label: "Out for delivery", className: "bg-espresso/10 text-espresso ring-espresso/20", dot: "bg-espresso" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground/60" },
}

export function StatusBadge({ status, pickup }: { status: OrderStatus; pickup?: boolean }) {
  const m = statusMeta[status]
  const label = status === "completed" && pickup ? "Picked up" : m.label
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", m.className)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {label}
    </span>
  )
}

const tierStyles: Record<Tier, string> = {
  Crumb: "bg-secondary text-espresso ring-espresso/15",
  Croissant: "bg-gold/20 text-gold-ink ring-gold/40",
  Gâteau: "bg-espresso text-gold ring-espresso",
}

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", tierStyles[tier])}>
      {tier}
    </span>
  )
}

export function ProviderChip({ provider }: { provider: Provider }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide",
        provider === "In-house" ? "bg-espresso text-flour" : "bg-secondary text-espresso",
      )}
    >
      {provider}
    </span>
  )
}

export function KpiCard({
  label,
  value,
  format,
  delta,
  hint,
}: {
  label: string
  value: number
  format?: (n: number) => string
  delta?: number
  hint?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <div className="h-full rounded-2xl border bg-card p-5 shadow-warm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-espresso">
        <AnimatedNumber value={value} format={format} />
      </p>
      <div className="mt-2 flex min-h-5 items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", up ? "text-sage-ink" : "text-destructive")}>
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}

export function Panel({ title, description, action, children, className }: { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-2xl border bg-card p-5 shadow-warm", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-espresso">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Meter({ value, max, warnAt, className }: { value: number; max: number; warnAt: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  const low = value <= warnAt
  const critical = value <= warnAt * 0.5
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <motion.div
        className={cn("h-full rounded-full", critical ? "bg-destructive" : low ? "bg-gold" : "bg-sage")}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  )
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-espresso", className)}>
      {initials(name)}
    </span>
  )
}
