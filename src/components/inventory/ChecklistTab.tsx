import { useState } from "react"
import { Check, Eye, Pencil, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Meter } from "@/components/common/bits"
import { Pager, usePagination } from "@/components/common/pagination"
import { isChecked, roundQty, useBakery, type ChecklistPeriod } from "@/store/useBakery"
import { cn } from "@/lib/utils"
import { EmptyState, SearchBox, matches } from "./shared"

type Row = {
  key: string
  id: string
  kind: "ingredient" | "product"
  name: string
  emoji: string
  detail: string
  stock: number
  max: number
  warnAt: number
  unit: string
}

const filters = [
  ["all", "All"],
  ["ingredient", "Ingredients"],
  ["product", "Finished goods"],
] as const

const periods: [ChecklistPeriod, string][] = [
  ["daily", "End of day"],
  ["weekly", "End of week"],
]

export function useChecklist() {
  const products = useBakery((s) => s.products)
  const ingredients = useBakery((s) => s.ingredients)
  const checks = useBakery((s) => s.checks)
  const period = useBakery((s) => s.checklistPeriod)
  const rows: Row[] = [
    ...ingredients.map((i) => ({
      key: `ingredient:${i.id}`,
      id: i.id,
      kind: "ingredient" as const,
      name: i.name,
      emoji: i.emoji,
      detail: i.supplier,
      stock: i.stock,
      max: i.max,
      warnAt: i.reorderAt,
      unit: i.unit,
    })),
    ...products.map((p) => ({
      key: `product:${p.id}`,
      id: p.id,
      kind: "product" as const,
      name: p.name,
      emoji: p.emoji,
      detail: p.category,
      stock: p.stock,
      max: p.par,
      warnAt: p.par * 0.3,
      unit: "pcs",
    })),
  ]
  return { rows, remaining: rows.filter((r) => !isChecked(checks[r.key], period)) }
}

function ChecklistRow({ row }: { row: Row }) {
  const updateIngredient = useBakery((s) => s.updateIngredient)
  const updateProduct = useBakery((s) => s.updateProduct)
  const saveCheck = useBakery((s) => s.saveCheck)
  const lastChecked = useBakery((s) => s.checks[row.key])
  const [count, setCount] = useState<string>()
  const editing = count !== undefined
  const parsed = Number(count)
  const invalid = editing && (count === "" || !Number.isFinite(parsed) || parsed < 0 || (row.kind === "product" && !Number.isInteger(parsed)))

  const save = () => {
    if (invalid) return
    if (editing) {
      if (row.kind === "ingredient") updateIngredient(row.id, { stock: roundQty(parsed) })
      else updateProduct(row.id, { stock: parsed })
    }
    saveCheck(row.key)
    toast.success(`${row.name} checked`, { icon: row.emoji })
  }

  return (
    <li className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/70 md:grid-cols-[2fr_1.6fr_1fr_auto] md:gap-4">
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-2xl">{row.emoji}</span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{row.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {row.kind === "ingredient" ? "Ingredient" : "Finished good"}
            {row.detail && ` · ${row.detail}`}
          </span>
        </span>
      </span>
      {editing ? (
        <span className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={row.kind === "product" ? 1 : "any"}
            value={count}
            autoFocus
            aria-label={`Counted stock for ${row.name}`}
            aria-invalid={invalid}
            onChange={(e) => setCount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save()
              if (e.key === "Escape") setCount(undefined)
            }}
            className="h-9 w-28"
          />
          <span className="text-sm text-muted-foreground">{row.unit}</span>
        </span>
      ) : (
        <span>
          <span className="mb-1 block text-sm font-semibold tabular-nums">
            {row.stock}{" "}
            <span className="font-normal text-muted-foreground">
              / {row.max} {row.unit}
            </span>
          </span>
          <Meter value={row.stock} max={row.max} warnAt={row.warnAt} />
        </span>
      )}
      <span className="text-sm text-muted-foreground">{lastChecked ? format(new Date(lastChecked), "d MMM, HH:mm") : "Not checked yet"}</span>
      <span className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="w-20 rounded-lg" onClick={() => setCount(editing ? undefined : String(row.stock))}>
          {editing ? <X /> : <Pencil />} {editing ? "Cancel" : "Edit"}
        </Button>
        <Button size="sm" className="w-20 rounded-lg bg-espresso text-flour hover:bg-espresso-soft" disabled={invalid} onClick={save}>
          <Check /> Save
        </Button>
      </span>
    </li>
  )
}

export function ChecklistTab() {
  const { rows, remaining } = useChecklist()
  const period = useBakery((s) => s.checklistPeriod)
  const setPeriod = useBakery((s) => s.setChecklistPeriod)
  const unhideAll = useBakery((s) => s.unhideAll)
  const hasChecks = useBakery((s) => Object.keys(s.checks).length > 0)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all")

  const shown = remaining.filter((r) => (filter === "all" || r.kind === filter) && matches(query, r.name, r.detail))
  const paged = usePagination(shown, 10)
  const done = rows.length - remaining.length
  const returns = period === "daily" ? "tomorrow" : "next Monday"

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            {done} of {rows.length} checked {period === "daily" ? "today" : "this week"}
          </p>
          <p className="text-xs text-muted-foreground">Saved items hide until {returns}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-secondary p-1" role="group" aria-label="Checklist period">
            {periods.map(([value, label]) => (
              <button
                key={value}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
                className={cn("rounded-lg px-3 py-1 text-sm font-medium transition-colors", period === value ? "bg-card text-espresso shadow-warm" : "text-muted-foreground hover:text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="h-9 rounded-xl"
            disabled={!hasChecks}
            onClick={() => {
              unhideAll()
              toast("All items are back on the checklist")
            }}
          >
            <Eye /> Unhide all
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox
          value={query}
          onChange={(v) => {
            setQuery(v)
            paged.setPage(1)
          }}
          placeholder="Search checklist"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value)
                paged.setPage(1)
              }}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", filter === value ? "bg-secondary text-espresso" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState>{remaining.length === 0 ? `Everything is checked. Items come back ${returns}.` : "No items match your search."}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-warm">
          <div className="hidden grid-cols-[2fr_1.6fr_1fr_auto] gap-4 border-b bg-secondary/60 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
            <span>Item</span>
            <span>Stock level</span>
            <span>Last checked</span>
            <span className="w-42" />
          </div>
          <ul className="divide-y">
            {paged.visible.map((r) => (
              <ChecklistRow key={r.key} row={r} />
            ))}
          </ul>
        </div>
      )}
      <Pager {...paged} count={paged.visible.length} noun="items" />
    </>
  )
}
