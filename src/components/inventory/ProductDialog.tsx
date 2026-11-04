import { useState } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { roundQty, shortagesFor, useBakery } from "@/store/useBakery"
import { cn } from "@/lib/utils"
import type { Category, Ingredient, Product } from "@/data/mock"
import { Field, matches } from "./shared"

const categories: Category[] = ["Viennoiserie", "Bread", "Cakes", "Cookies", "Tarts", "Drinks"]

export function ProductDialog({ product, onClose }: { product?: Product; onClose: () => void }) {
  const ingredients = useBakery((s) => s.ingredients)
  const add = useBakery((s) => s.addProduct)
  const update = useBakery((s) => s.updateProduct)
  const [name, setName] = useState(product?.name ?? "")
  const [emoji, setEmoji] = useState(product?.emoji ?? "🥖")
  const [category, setCategory] = useState<Category>(product?.category ?? "Viennoiserie")
  const [price, setPrice] = useState(String(product?.price ?? ""))
  const [par, setPar] = useState(String(product?.par ?? 24))
  const [stock, setStock] = useState(String(product?.stock ?? 12))
  const [preorderOnly, setPreorderOnly] = useState(product?.preorderOnly ?? false)
  const [lines, setLines] = useState((product?.recipe ?? []).map((l) => ({ ingredientId: l.ingredientId, qty: String(l.qty) })))
  const [justAdded, setJustAdded] = useState<string>()

  const stockN = Number(stock)
  const recipe = lines.map((l) => ({ ingredientId: l.ingredientId, qty: Number(l.qty) }))
  const available = ingredients.filter((i) => !lines.some((l) => l.ingredientId === i.id))
  const setQty = (id: string, qty: string) => setLines((ls) => ls.map((l) => (l.ingredientId === id ? { ...l, qty } : l)))

  // Only a new item consumes ingredients; editing shelf stock is a correction.
  const short = product ? [] : shortagesFor(recipe, Number.isFinite(stockN) ? stockN : 0, ingredients)
  const valid =
    name.trim() !== "" &&
    emoji.trim() !== "" &&
    price !== "" &&
    Number(price) >= 0 &&
    Number(par) > 0 &&
    Number.isInteger(stockN) &&
    stockN >= 0 &&
    lines.every((l) => l.qty !== "" && Number(l.qty) > 0) &&
    short.length === 0

  const submit = () => {
    const data = { name: name.trim(), emoji: emoji.trim(), category, price: Number(price), par: Number(par), stock: stockN, preorderOnly, recipe }
    if (product) {
      update(product.id, data)
      toast.success(`${data.name} updated`, { icon: data.emoji })
    } else {
      if (add(data).length) return
      toast.success(`${data.name} added`, { icon: data.emoji, description: recipe.length && stockN ? "Ingredient stock deducted" : undefined })
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{product ? "Edit finished good" : "Add finished good"}</DialogTitle>
          <DialogDescription>
            {product ? "Recipe changes apply to future batches." : "The quantity made is deducted from ingredient stock using this recipe."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[4.5rem_1fr] gap-3">
          <Field label="Icon">
            <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="text-center text-lg" />
          </Field>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Almond Croissant" autoFocus />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={category} onValueChange={(v) => v && setCategory(v as Category)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Price (RM)">
            <Input type="number" min={0} step="any" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label={product ? "On shelf" : "Quantity made"} hint={product ? "Corrections here don't use ingredients." : undefined}>
            <Input type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} />
          </Field>
          <Field label="Par level">
            <Input type="number" min={1} step={1} value={par} onChange={(e) => setPar(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center justify-between gap-3 text-sm font-medium">
          Pre-order only
          <Switch checked={preorderOnly} onCheckedChange={setPreorderOnly} />
        </label>

        <div className="grid gap-2 border-t pt-4">
          <div>
            <p className="text-sm font-semibold">Recipe</p>
            <p className="text-xs text-muted-foreground">Ingredients used for one item.</p>
          </div>
          {lines.length > 0 && (
            <ul className="grid gap-2">
              {lines.map((l) => {
                const ing = ingredients.find((i) => i.id === l.ingredientId)
                if (!ing) return null
                const shortage = short.find((s) => s.ingredient.id === ing.id)
                const need = roundQty(Number(l.qty) * stockN)
                return (
                  <li key={l.ingredientId} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {ing.emoji} {ing.name}
                      </span>
                      {!product && need > 0 && (
                        <span className={cn("block text-xs", shortage ? "font-semibold text-destructive" : "text-muted-foreground")}>
                          Uses {need} {ing.unit} of {ing.stock} {ing.unit} in stock
                        </span>
                      )}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={l.qty}
                      onChange={(e) => setQty(l.ingredientId, e.target.value)}
                      autoFocus={l.ingredientId === justAdded}
                      aria-label={`${ing.name} per item, in ${ing.unit}`}
                      className="w-24"
                    />
                    <span className="w-8 text-xs text-muted-foreground">{ing.unit}</span>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="rounded-lg"
                      aria-label={`Remove ${ing.name}`}
                      onClick={() => setLines((ls) => ls.filter((x) => x.ingredientId !== l.ingredientId))}
                    >
                      <X />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
          <Combobox<Ingredient>
            items={available}
            value={null}
            onValueChange={(v) => {
              if (!v) return
              setLines((ls) => [...ls, { ingredientId: v.id, qty: "" }])
              setJustAdded(v.id)
            }}
            itemToStringLabel={(i) => i.name}
            filter={(i, q) => matches(q, i.name, i.supplier)}
            autoHighlight
          >
            <ComboboxTrigger className="w-full border-dashed text-muted-foreground" aria-label="Add ingredient to recipe">
              <span className="flex flex-1 items-center gap-1.5">
                <Plus className="size-4" /> Add ingredient
              </span>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxInput placeholder="Search ingredients" aria-label="Search ingredients" />
              <ComboboxEmpty>No ingredients found.</ComboboxEmpty>
              <ComboboxList>
                {(i: Ingredient) => (
                  <ComboboxItem key={i.id} value={i}>
                    <span className="truncate">
                      {i.emoji} {i.name}
                    </span>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {short.length > 0 && <p className="text-xs font-semibold text-destructive">Not enough {short.map((s) => s.ingredient.name).join(", ")} for this quantity.</p>}
        </div>

        <DialogFooter>
          <Button className="bg-paprika text-white hover:bg-paprika-dark" disabled={!valid} onClick={submit}>
            {product ? "Save changes" : "Add finished good"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
