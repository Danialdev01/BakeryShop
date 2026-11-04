import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { Bell, Menu, Search, RefreshCw } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarBody, Logo } from "./Sidebar"
import { CommandMenu } from "./CommandMenu"
import { notifications } from "@/data/mock"
import { BRAND } from "@/config/brand"
import { Avatar } from "@/components/common/bits"
import { toast } from "sonner"

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const location = useLocation()

  const sync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast.success("Synced with Shopify", { description: "12 products · 3 new orders pulled" })
    }, 1200)
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarBody layoutId="nav-pill-desktop" />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} layoutId="nav-pill-mobile" />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu />
            </Button>
            <div className="lg:hidden">
              <Logo compact />
            </div>

            <button
              onClick={() => setCmdOpen(true)}
              className="ml-auto hidden h-10 w-full max-w-sm items-center gap-2 rounded-xl border bg-card px-3 text-sm text-muted-foreground shadow-warm transition-colors hover:border-espresso/30 md:flex lg:ml-0"
            >
              <Search className="size-4" />
              Search orders, customers…
              <kbd className="ml-auto rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCmdOpen(true)} aria-label="Search">
                <Search />
              </Button>

              <button
                onClick={sync}
                className="hidden items-center gap-2 rounded-full border border-sage/30 bg-sage/10 px-3 py-1.5 text-xs font-semibold text-sage-ink transition-colors hover:bg-sage/20 sm:flex"
              >
                <span className="size-2 rounded-full bg-sage" />
                {syncing ? "Syncing…" : "Shopify synced"}
                <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label="Notifications" />}>
                  <Bell />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-paprika ring-2 ring-background" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="gap-3 py-2">
                        <span className="flex-1 text-sm">{n.title}</span>
                        <span className="text-xs text-muted-foreground">{n.time}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted" />}>
                  <Avatar name="Loong Admin" className="size-8" />
                  <span className="hidden text-left text-xs leading-tight sm:block">
                    <span className="block font-semibold">Loong</span>
                    <span className="block text-muted-foreground">{BRAND.outlet}</span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Owner account</DropdownMenuLabel>
                    <DropdownMenuItem>Outlet settings</DropdownMenuItem>
                    <DropdownMenuItem>Staff & roles</DropdownMenuItem>
                    <DropdownMenuItem>Integrations</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sign out</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="relative px-4 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative mx-auto max-w-7xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandMenu open={cmdOpen} setOpen={setCmdOpen} />
    </div>
  )
}
