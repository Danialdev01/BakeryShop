import { useState } from "react"
import { motion } from "motion/react"
import { Minus, Plus, ShoppingCart, Truck } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmojiTile, KpiCard, Meter, PageHeader } from "@/components/common/bits"
import { Item, Stagger } from "@/components/common/motion"
import { Pager, usePagination } from "@/components/common/pagination"
import { ChecklistTab, useChecklist } from "@/components/inventory/ChecklistTab"
import { IngredientDialog } from "@/components/inventory/IngredientDialog"
import { ProductDialog } from "@/components/inventory/ProductDialog"
import { ConfirmDelete, EmptyState, ItemMenu, SearchBox, matches } from "@/components/inventory/shared"
import { useBakery } from "@/store/useBakery"
import { money } from "@/config/brand"
import { cn } from "@/lib/utils"
import type { Category, Ingredient, Product } from "@/data/mock"

const cats: ("All" | Category)[] = ["All", "Viennoiserie", "Bread", "Cakes", "Cookies", "Tarts", "Drinks"]

function ReorderDialog({ ing, onClose }: { ing?: Ingredient; onClose: () => void }) {
  const adjust = useBakery((s) => s.adjustIngredient)
  const [qty, setQty] = useState(10)
  return (
    <Dialog open={!!ing} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        {ing && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {ing.emoji} Reorder {ing.name}
              </DialogTitle>
              <DialogDescription>Purchase order goes to {ing.supplier} by email and WhatsApp.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label>Quantity ({ing.unit})</Label>
              <Input type="number" value={qty} min={1} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
              <p className="text-xs text-muted-foreground">
                Suggested: {Math.ceil(ing.max - ing.stock)} {ing.unit} to refill to max
              </p>
            </div>
            <DialogFooter className="items-center sm:justify-between">
              <p className="text-sm">
                Est. <span className="font-display text-xl font-semibold">{money(qty * ing.costPerUnit)}</span>
              </p>
              <Button
                className="bg-paprika text-white hover:bg-paprika-dark"
                onClick={() => {
                  adjust(ing.id, qty)
                  toast.success(`PO sent to ${ing.supplier}`, { description: `${qty} ${ing.unit} ${ing.name} · stock updated on receipt` })
                  onClose()
                }}
              >
                <Truck /> Send PO
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

const PAGE_SIZE = 8

function ProductCard({ p, onEdit, onDelete }: { p: Product; onEdit: () => void; onDelete: () => void }) {
  const ingredients = useBakery((s) => s.ingredients)
  const adjustProduct = useBakery((s) => s.adjustProduct)
  const produceBatch = useBakery((s) => s.produceBatch)
  const low = p.stock < p.par * 0.3
  const used = p.recipe.flatMap((l) => ingredients.filter((i) => i.id === l.ingredientId))
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("relative overflow-hidden rounded-2xl border bg-card p-4 shadow-warm", low && "border-destructive/40")}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {low && <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">LOW</span>}
        {p.preorderOnly && !low && <span className="rounded-full bg-espresso/15 px-2 py-0.5 text-[10px] font-bold text-espresso">PRE-ORDER</span>}
        <ItemMenu label={p.name} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex items-center gap-3">
        <EmojiTile emoji={p.emoji} size="lg" />
        <div className="min-w-0 pt-5">
          <p className="truncate font-semibold">{p.name}</p>
          <p className="text-xs text-muted-foreground">
            {p.category} · {money(p.price)}
          </p>
          <p className="truncate text-xs text-muted-foreground" title={used.map((i) => i.name).join(", ")}>
            {used.length ? `Uses ${used.map((i) => i.emoji).join(" ")}` : "No recipe"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-xs text-muted-foreground">On shelf</p>
        <p className="text-xs text-muted-foreground">par {p.par}</p>
      </div>
      <Meter value={p.stock} max={p.par} warnAt={p.par * 0.3} className="mt-1" />
      <div className="mt-3 flex items-center justify-between">
        <motion.span key={p.stock} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-3xl font-semibold">
          {p.stock}
        </motion.span>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="outline" className="rounded-lg" onClick={() => adjustProduct(p.id, -1)} aria-label="Remove one">
            <Minus />
          </Button>
          <Button size="icon-sm" variant="outline" className="rounded-lg" onClick={() => adjustProduct(p.id, 1)} aria-label="Add one">
            <Plus />
          </Button>
          <Button
            size="sm"
            className="rounded-lg bg-espresso text-flour hover:bg-espresso-soft"
            onClick={() => {
              const short = produceBatch(p.id, 12)
              if (short.length) {
                toast.error(`Not enough stock for ${p.name}`, {
                  description: short.map((s) => `${s.ingredient.name}: need ${s.need} ${s.ingredient.unit}, have ${s.ingredient.stock}`).join(" · "),
                })
              } else {
                toast.success(`+12 ${p.name} fresh out of the oven`, { icon: p.emoji, description: used.length ? "Ingredient stock deducted" : undefined })
              }
            }}
          >
            +12 batch
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function IngredientCard({ i, onReorder, onEdit, onDelete }: { i: Ingredient; onReorder: () => void; onEdit: () => void; onDelete: () => void }) {
  const adjust = useBakery((s) => s.adjustIngredient)
  const low = i.stock <= i.reorderAt
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("relative overflow-hidden rounded-2xl border bg-card p-4 shadow-warm", low && "border-destructive/40")}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {low && <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">LOW</span>}
        <ItemMenu label={i.name} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex items-center gap-3">
        <EmojiTile emoji={i.emoji} size="lg" />
        <div className="min-w-0 pt-5">
          <p className="truncate font-semibold">{i.name}</p>
          <p className="truncate text-xs text-muted-foreground">{i.supplier || "No supplier"}</p>
          <p className="text-xs text-muted-foreground">
            {money(i.costPerUnit)}/{i.unit}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-xs text-muted-foreground">In stock</p>
        <p className="text-xs text-muted-foreground">
          reorder at {i.reorderAt} · max {i.max}
        </p>
      </div>
      <Meter value={i.stock} max={i.max} warnAt={i.reorderAt} className="mt-1" />
      <div className="mt-3 flex items-center justify-between">
        <motion.span key={i.stock} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-3xl font-semibold">
          {i.stock} <span className="font-sans text-sm font-normal text-muted-foreground">{i.unit}</span>
        </motion.span>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="outline" className="rounded-lg" onClick={() => adjust(i.id, -1)} aria-label="Remove one">
            <Minus />
          </Button>
          <Button size="icon-sm" variant="outline" className="rounded-lg" onClick={() => adjust(i.id, 1)} aria-label="Add one">
            <Plus />
          </Button>
          <Button size="sm" className={cn("rounded-lg", low ? "bg-paprika text-white hover:bg-paprika-dark" : "bg-espresso text-flour hover:bg-espresso-soft")} onClick={onReorder}>
            <ShoppingCart /> Reorder
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function GoodsTab() {
  const products = useBakery((s) => s.products)
  const deleteProduct = useBakery((s) => s.deleteProduct)
  const [cat, setCat] = useState<(typeof cats)[number]>("All")
  const [query, setQuery] = useState("")
  const [form, setForm] = useState<{ product?: Product }>()
  const [removing, setRemoving] = useState<Product>()

  const shown = products.filter((p) => (cat === "All" || p.category === cat) && matches(query, p.name, p.category))
  const paged = usePagination(shown, PAGE_SIZE)

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={query}
          onChange={(v) => {
            setQuery(v)
            paged.setPage(1)
          }}
          placeholder="Search finished goods"
        />
        <Button className="h-10 rounded-xl bg-paprika text-white hover:bg-paprika-dark" onClick={() => setForm({})}>
          <Plus /> Add finished good
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c)
              paged.setPage(1)
            }}
            className={cn("relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", cat === c ? "text-espresso" : "text-muted-foreground hover:text-foreground")}
          >
            {cat === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-secondary" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState>No finished goods match your search.</EmptyState>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.visible.map((p) => (
            <ProductCard key={p.id} p={p} onEdit={() => setForm({ product: p })} onDelete={() => setRemoving(p)} />
          ))}
        </motion.div>
      )}
      <Pager {...paged} count={paged.visible.length} noun="finished goods" />

      {form && <ProductDialog product={form.product} onClose={() => setForm(undefined)} />}
      {removing && (
        <ConfirmDelete
          name={removing.name}
          detail="It leaves the stock list and new orders. Existing orders are not changed."
          onConfirm={() => {
            deleteProduct(removing.id)
            toast(`${removing.name} deleted`)
          }}
          onClose={() => setRemoving(undefined)}
        />
      )}
    </>
  )
}

function IngredientsTab() {
  const ingredients = useBakery((s) => s.ingredients)
  const products = useBakery((s) => s.products)
  const deleteIngredient = useBakery((s) => s.deleteIngredient)
  const [query, setQuery] = useState("")
  const [form, setForm] = useState<{ ingredient?: Ingredient }>()
  const [reorder, setReorder] = useState<Ingredient>()
  const [removing, setRemoving] = useState<Ingredient>()

  const shown = ingredients.filter((i) => matches(query, i.name, i.supplier))
  const paged = usePagination(shown, PAGE_SIZE)
  const usedIn = removing ? products.filter((p) => p.recipe.some((l) => l.ingredientId === removing.id)) : []

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={query}
          onChange={(v) => {
            setQuery(v)
            paged.setPage(1)
          }}
          placeholder="Search ingredients or suppliers"
        />
        <Button className="h-10 rounded-xl bg-paprika text-white hover:bg-paprika-dark" onClick={() => setForm({})}>
          <Plus /> Add ingredient
        </Button>
      </div>
      {shown.length === 0 ? (
        <EmptyState>No ingredients match your search.</EmptyState>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.visible.map((i) => (
            <IngredientCard key={i.id} i={i} onReorder={() => setReorder(i)} onEdit={() => setForm({ ingredient: i })} onDelete={() => setRemoving(i)} />
          ))}
        </motion.div>
      )}
      <Pager {...paged} count={paged.visible.length} noun="ingredients" />

      <ReorderDialog ing={reorder} onClose={() => setReorder(undefined)} key={reorder?.id} />
      {form && <IngredientDialog ingredient={form.ingredient} onClose={() => setForm(undefined)} />}
      {removing && (
        <ConfirmDelete
          name={removing.name}
          detail={usedIn.length ? `It will also be removed from the recipes of ${usedIn.map((p) => p.name).join(", ")}.` : "No recipes use this ingredient."}
          onConfirm={() => {
            deleteIngredient(removing.id)
            toast(`${removing.name} deleted`)
          }}
          onClose={() => setRemoving(undefined)}
        />
      )}
    </>
  )
}

export default function Inventory() {
  const products = useBakery((s) => s.products)
  const ingredients = useBakery((s) => s.ingredients)
  const { remaining } = useChecklist()

  const value = ingredients.reduce((s, i) => s + i.stock * i.costPerUnit, 0)
  const lowIng = ingredients.filter((i) => i.stock <= i.reorderAt)
  const lowProd = products.filter((p) => p.stock < p.par * 0.3)

  return (
    <>
      <PageHeader
        eyebrow="Stock room"
        title="Inventory"
        description="Shelf stock syncs to Shopify every 60 seconds, so items show as sold out online the moment they run out in store."
        actions={
          <Button className="h-10 rounded-xl bg-espresso text-flour hover:bg-espresso-soft" onClick={() => toast("Stock-take started. Assigned to the morning shift.")}>
            Start stock-take
          </Button>
        }
      />

      <Stagger className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Item>
          <KpiCard label="Ingredient value" value={value} format={money} />
        </Item>
        <Item>
          <KpiCard label="Ingredients to reorder" value={lowIng.length} />
        </Item>
        <Item>
          <KpiCard label="Shelf items low" value={lowProd.length} />
        </Item>
        <Item>
          <KpiCard label="Waste this week" value={2.4} format={(n) => `${n.toFixed(1)}%`} hint="↓0.8% · target < 3%" />
        </Item>
      </Stagger>

      <Tabs defaultValue="goods">
        <TabsList className="h-11! max-w-full justify-start overflow-x-auto rounded-xl bg-secondary p-1">
          <TabsTrigger value="goods" className="flex-none rounded-lg px-3 sm:px-4">
            Finished goods
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex-none rounded-lg px-3 sm:px-4">
            Ingredients
            {lowIng.length > 0 && <span className="ml-1 rounded-full bg-paprika px-1.5 text-[10px] font-bold text-white">{lowIng.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex-none rounded-lg px-3 sm:px-4">
            Checklist
            {remaining.length > 0 && <span className="ml-1 rounded-full bg-espresso px-1.5 text-[10px] font-bold text-flour">{remaining.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goods" className="mt-4">
          <GoodsTab />
        </TabsContent>

        <TabsContent value="ingredients" className="mt-4">
          <IngredientsTab />
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <ChecklistTab />
        </TabsContent>
      </Tabs>
    </>
  )
}
