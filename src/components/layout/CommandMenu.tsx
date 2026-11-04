import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { nav } from "./nav"
import { useBakery } from "@/store/useBakery"

export function CommandMenu({ open, setOpen }: { open: boolean; setOpen: (v: boolean | ((p: boolean) => boolean)) => void }) {
  const navigate = useNavigate()
  const customers = useBakery((s) => s.customers)
  const orders = useBakery((s) => s.orders)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setOpen])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search the back office">
      <Command>
      <CommandInput placeholder="Search pages, orders, customers…" />
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup heading="Pages">
          {nav.map((n) => (
            <CommandItem key={n.to} onSelect={() => go(n.to)}>
              <n.icon /> {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Orders">
          {orders.slice(0, 6).map((o) => (
            <CommandItem key={o.id} onSelect={() => go(`/app/orders?o=${o.id}`)}>
              {o.id} · {customers.find((c) => c.id === o.customerId)?.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Customers">
          {customers.slice(0, 6).map((c) => (
            <CommandItem key={c.id} onSelect={() => go(`/app/customers?c=${c.id}`)}>
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  )
}
