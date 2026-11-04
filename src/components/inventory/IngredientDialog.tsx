import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useBakery } from "@/store/useBakery"
import type { Ingredient } from "@/data/mock"
import { Field } from "./shared"

export function IngredientDialog({ ingredient, onClose }: { ingredient?: Ingredient; onClose: () => void }) {
  const add = useBakery((s) => s.addIngredient)
  const update = useBakery((s) => s.updateIngredient)
  const [name, setName] = useState(ingredient?.name ?? "")
  const [emoji, setEmoji] = useState(ingredient?.emoji ?? "🧂")
  const [unit, setUnit] = useState(ingredient?.unit ?? "kg")
  const [supplier, setSupplier] = useState(ingredient?.supplier ?? "")
  const [stock, setStock] = useState(String(ingredient?.stock ?? 0))
  const [reorderAt, setReorderAt] = useState(String(ingredient?.reorderAt ?? 5))
  const [max, setMax] = useState(String(ingredient?.max ?? 20))
  const [cost, setCost] = useState(String(ingredient?.costPerUnit ?? 0))

  const nums = [stock, reorderAt, max, cost].map(Number)
  const valid = name.trim() !== "" && emoji.trim() !== "" && unit.trim() !== "" && nums.every((n) => Number.isFinite(n) && n >= 0) && Number(max) > 0

  const submit = () => {
    const data = {
      name: name.trim(),
      emoji: emoji.trim(),
      unit: unit.trim(),
      supplier: supplier.trim(),
      stock: Number(stock),
      reorderAt: Number(reorderAt),
      max: Number(max),
      costPerUnit: Number(cost),
    }
    if (ingredient) update(ingredient.id, data)
    else add(data)
    toast.success(ingredient ? `${data.name} updated` : `${data.name} added`, { icon: data.emoji })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{ingredient ? "Edit ingredient" : "Add ingredient"}</DialogTitle>
          <DialogDescription>Stock levels here feed the recipes of your finished goods.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[4.5rem_1fr] gap-3">
          <Field label="Icon">
            <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="text-center text-lg" />
          </Field>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Almond Flour" autoFocus />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit">
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, L, tray" />
          </Field>
          <Field label="Supplier">
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </Field>
          <Field label="In stock">
            <Input type="number" min={0} step="any" value={stock} onChange={(e) => setStock(e.target.value)} />
          </Field>
          <Field label="Cost per unit (RM)">
            <Input type="number" min={0} step="any" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
          <Field label="Reorder at">
            <Input type="number" min={0} step="any" value={reorderAt} onChange={(e) => setReorderAt(e.target.value)} />
          </Field>
          <Field label="Max stock">
            <Input type="number" min={0} step="any" value={max} onChange={(e) => setMax(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button className="bg-paprika text-white hover:bg-paprika-dark" disabled={!valid} onClick={submit}>
            {ingredient ? "Save changes" : "Add ingredient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
