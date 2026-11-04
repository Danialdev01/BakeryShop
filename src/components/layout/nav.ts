import { CalendarClock, LayoutDashboard, Package, ReceiptText, Truck, Users, Gift } from "lucide-react"

export const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/orders", label: "Orders", icon: ReceiptText },
  { to: "/app/preorders", label: "Pre-orders", icon: CalendarClock },
  { to: "/app/inventory", label: "Inventory", icon: Package },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/loyalty", label: "Loyalty", icon: Gift },
  { to: "/app/fulfilment", label: "Pickup & Delivery", icon: Truck },
] as const
