import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Copy, Plus, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, EmojiTile, PageHeader, Panel, TierBadge } from "@/components/common/bits"
import { Reveal } from "@/components/common/motion"
import { useBakery } from "@/store/useBakery"
import { rewards, tiers, type Customer, type Voucher } from "@/data/mock"
import { cn } from "@/lib/utils"

function voucherValue(v: Voucher) {
  return v.kind === "percent" ? `${v.value}%` : v.kind === "fixed" ? `RM${v.value}` : "FREE"
}

function matchesCustomer(c: Customer, query: string) {
  const q = query.trim().toLowerCase()
  const digits = q.replace(/\D/g, "")
  return (
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    (digits !== "" && c.phone.replace(/\D/g, "").includes(digits))
  )
}

function CreateVoucher({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const create = useBakery((s) => s.createVoucher)
  const [code, setCode] = useState("WEEKEND15")
  const [kind, setKind] = useState<Voucher["kind"]>("percent")
  const [value, setValue] = useState(15)
  const [limit, setLimit] = useState(200)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create voucher</DialogTitle>
          <DialogDescription>Vouchers sync to Shopify as discount codes and work at the counter too.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))} className="font-mono tracking-widest" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => v && setKind(v as Voucher["kind"])}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => ({ percent: "% off", fixed: "RM off", freebie: "Free item" })[v as Voucher["kind"]]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">% off</SelectItem>
                  <SelectItem value="fixed">RM off</SelectItem>
                  <SelectItem value="freebie">Free item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Value</Label>
              <Input type="number" value={value} disabled={kind === "freebie"} onChange={(e) => setValue(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Usage limit</Label>
            <Input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-paprika text-white hover:bg-paprika-dark"
            onClick={() => {
              create({
                code,
                kind,
                value,
                limit,
                description: kind === "percent" ? `${value}% off any order` : kind === "fixed" ? `RM ${value} off any order` : "Free pastry with any order",
                expiresInDays: 30,
                active: true,
              })
              toast.success(`Voucher ${code} is live`, { description: "Pushed to Shopify discounts" })
              setOpen(false)
            }}
          >
            Create voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RedeemPanel() {
  const customers = useBakery((s) => s.customers)
  const redeem = useBakery((s) => s.redeem)
  const [cid, setCid] = useState(customers[1].id)
  const c = customers.find((x) => x.id === cid)!

  return (
    <Panel title="Redeem points" description="At the counter or over WhatsApp">
      <Combobox
        items={customers}
        value={c}
        onValueChange={(v) => v && setCid(v.id)}
        itemToStringLabel={(x) => x.name}
        isItemEqualToValue={(a, b) => a.id === b.id}
        filter={matchesCustomer}
        autoHighlight
      >
        <ComboboxTrigger className="h-12 w-full rounded-xl" aria-label="Select customer">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar name={c.name} className="size-7 text-[10px]" />
            <span className="truncate">{c.name}</span>
          </span>
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search name, phone or email" aria-label="Search customers" />
          <ComboboxEmpty>No customers found.</ComboboxEmpty>
          <ComboboxList>
            {(x: Customer) => (
              <ComboboxItem key={x.id} value={x}>
                <span className="truncate">
                  {x.name} · {x.points} pts
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <div className="my-4 flex items-center justify-between rounded-2xl bg-espresso p-4 text-flour">
        <div>
          <p className="text-xs text-flour/60">Available balance</p>
          <motion.p key={c.points} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-3xl font-semibold text-gold">
            {c.points.toLocaleString()} pts
          </motion.p>
        </div>
        <TierBadge tier={c.tier} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {rewards.map((r) => {
          const can = c.points >= r.cost
          return (
            <motion.button
              key={r.id}
              whileTap={can ? { scale: 0.95 } : undefined}
              disabled={!can}
              onClick={() => {
                if (redeem(cid, r.id)) {
                  toast.success(`${r.name} redeemed for ${c.name.split(" ")[0]}`, { description: `−${r.cost} points` })
                }
              }}
              className={cn("relative rounded-2xl border p-3 text-left transition-shadow", can ? "bg-card shadow-warm hover:shadow-warm-lg" : "cursor-not-allowed opacity-45")}
            >
              <EmojiTile emoji={r.emoji} />
              <p className="mt-2 text-sm font-semibold">{r.name}</p>
              <p className="text-xs font-bold text-paprika">{r.cost} pts</p>
            </motion.button>
          )
        })}
      </div>
    </Panel>
  )
}

export default function Loyalty() {
  const vouchers = useBakery((s) => s.vouchers)
  const customers = useBakery((s) => s.customers)
  const toggle = useBakery((s) => s.toggleVoucher)
  const [open, setOpen] = useState(false)
  const [rules, setRules] = useState({ earn: true, birthday: true, referral: true, review: false })

  const counts = tiers.map((t) => customers.filter((c) => c.tier === t.name).length)

  return (
    <>
      <PageHeader
        eyebrow="Rewards"
        title="Loyalty"
        description="Points, tiers and vouchers that bring customers back for one more croissant."
        actions={
          <Button className="h-10 rounded-xl bg-paprika text-white hover:bg-paprika-dark" onClick={() => setOpen(true)}>
            <Plus /> Create voucher
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <div
              className={cn(
                "h-full rounded-2xl border p-6",
                i === 0 && "bg-card text-espresso",
                i === 1 && "bg-secondary text-espresso",
                i === 2 && "border-espresso bg-espresso text-flour",
              )}
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">Tier {i + 1}</p>
              <h3 className="mt-1 text-2xl font-semibold">{t.name}</h3>
              <p className="text-sm opacity-75">{t.min === 0 ? "Everyone starts here" : `${t.min.toLocaleString()}+ points`}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className={cn("size-3.5 shrink-0", i === 2 ? "text-gold" : "text-sage-ink")} /> {p}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs font-semibold opacity-75">{counts[i]} members (sample)</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Panel title="Vouchers" description="Active codes sync to Shopify discounts">
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {vouchers.map((v) => (
                  <motion.li
                    key={v.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={cn("flex items-stretch overflow-hidden rounded-2xl border bg-background/60 transition-opacity", !v.active && "opacity-55")}
                  >
                    <div className="relative grid w-24 shrink-0 place-items-center bg-espresso text-flour">
                      <span className="font-display text-2xl font-bold">{voucherValue(v)}</span>
                      <span className="absolute top-0 -right-2 bottom-0 flex flex-col justify-around">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="size-3.5 rounded-full bg-card" />
                        ))}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-wrap items-center gap-3 p-3 pl-5">
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(v.code)
                            toast(`Copied ${v.code}`)
                          }}
                          className="inline-flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider hover:text-espresso"
                        >
                          {v.code} <Copy className="size-3" />
                        </button>
                        <p className="text-xs text-muted-foreground">{v.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                            <motion.div className="h-full rounded-full bg-gold" initial={{ width: 0 }} animate={{ width: `${(v.used / v.limit) * 100}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {v.used}/{v.limit} used
                          </span>
                          {v.tierOnly && <TierBadge tier={v.tierOnly} />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {v.expiresInDays > 0 ? `${v.expiresInDays}d left` : "Expired"}
                        <Switch
                          checked={v.active}
                          onCheckedChange={() => {
                            toggle(v.id)
                            toast(`${v.code} ${v.active ? "paused" : "activated"}`, { icon: <Ticket className="size-4" /> })
                          }}
                        />
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Panel>

          <Panel title="Earning rules" description="How customers collect points">
            <ul className="divide-y">
              {(
                [
                  ["earn", "Points on every order", "1 pt per RM 1, with tier multipliers"],
                  ["birthday", "Birthday treat", "Free slice + 2× points during birthday month"],
                  ["referral", "Refer a friend", "200 pts each when a friend's first order is collected"],
                  ["review", "Leave a review", "50 pts for a Google review (verified manually)"],
                ] as const
              ).map(([k, t, d]) => (
                <li key={k} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                  <Switch checked={rules[k]} onCheckedChange={(v) => setRules((r) => ({ ...r, [k]: v }))} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          <RedeemPanel />
        </div>
      </div>

      <CreateVoucher open={open} setOpen={setOpen} key={String(open)} />
    </>
  )
}
