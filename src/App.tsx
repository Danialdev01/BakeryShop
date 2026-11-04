import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MotionConfig } from "motion/react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/AppShell"
import Landing from "@/pages/Landing"
import Dashboard from "@/pages/Dashboard"
import Orders from "@/pages/Orders"
import Preorders from "@/pages/Preorders"
import Inventory from "@/pages/Inventory"
import Customers from "@/pages/Customers"
import Loyalty from "@/pages/Loyalty"
import Fulfilment from "@/pages/Fulfilment"

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="preorders" element={<Preorders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<Customers />} />
              <Route path="loyalty" element={<Loyalty />} />
              <Route path="fulfilment" element={<Fulfilment />} />
            </Route>
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors={false} />
      </TooltipProvider>
    </MotionConfig>
  )
}
