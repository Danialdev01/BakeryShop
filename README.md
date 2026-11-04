# Loong's Bakehouse: Back Office mockup

A clickable frontend-only mockup of the custom bakery back office. It covers pre-orders, the order kitchen board, inventory, CRM, loyalty, and pickup and delivery. It runs on in-memory sample data, with no backend.

Stack: Vite + React + TypeScript, Tailwind CSS v4, shadcn/ui (base-nova), motion, zustand, Recharts.

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build
```

- `/`: public bakery landing page (dummy photos live in `public/images/`)
- `/app/*`: back office (Dashboard, Orders, Pre-orders, Inventory, Customers, Loyalty, Pickup & Delivery)

Brand name and currency live in `src/config/brand.ts`, sample data in `src/data/mock.ts`, and theme tokens in `src/index.css`.
