import { Link, NavLink } from "react-router-dom"
import { motion } from "motion/react"
import { BRAND } from "@/config/brand"
import { nav } from "./nav"
import { cn } from "@/lib/utils"
import { useBakery } from "@/store/useBakery"
import { ArrowLeft, Croissant } from "lucide-react"

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-xl bg-gold text-espresso">
        <Croissant className="size-5" />
      </span>
      <span className={cn("leading-tight", compact && "hidden sm:block")}>
        <span className={cn("block font-display text-lg font-semibold", light ? "text-flour" : "text-espresso")}>{BRAND.name}</span>
        <span className={cn("block text-[10px] font-semibold tracking-[0.2em] uppercase", light ? "text-gold" : "text-muted-foreground")}>
          Back Office
        </span>
      </span>
    </Link>
  )
}

export function SidebarNav({ onNavigate, layoutId = "nav-pill" }: { onNavigate?: () => void; layoutId?: string }) {
  const newOrders = useBakery((s) => s.orders.filter((o) => o.status === "new").length)
  const lowStock = useBakery((s) => s.products.filter((p) => p.stock < p.par * 0.3).length)
  const badges: Record<string, number> = { "/app/orders": newOrders, "/app/inventory": lowStock }

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          onClick={onNavigate}
          className="relative block rounded-xl"
        >
          {({ isActive }) => (
            <span
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                >
                  <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold" />
                </motion.span>
              )}
              <item.icon className="relative size-[18px]" />
              <span className="relative">{item.label}</span>
              {badges[item.to] > 0 && (
                <motion.span
                  key={badges[item.to]}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="relative ml-auto grid min-w-5 place-items-center rounded-full bg-paprika px-1.5 text-[11px] font-semibold text-white"
                >
                  {badges[item.to]}
                </motion.span>
              )}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarBody({ onNavigate, layoutId }: { onNavigate?: () => void; layoutId?: string }) {
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <div className="px-1 pt-1">
        <Logo light />
      </div>
      <SidebarNav onNavigate={onNavigate} layoutId={layoutId} />

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent p-4 text-sidebar-accent-foreground">
          <p className="text-xs font-semibold tracking-widest text-sidebar-foreground/70 uppercase">Today</p>
          <p className="mt-1 text-lg leading-snug font-semibold">8 cakes to decorate</p>
          <Link to="/app/preorders" onClick={onNavigate} className="mt-2 inline-block text-xs font-semibold text-gold underline underline-offset-4">
            Open bake list →
          </Link>
        </div>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to overview
        </Link>
      </div>
    </div>
  )
}
