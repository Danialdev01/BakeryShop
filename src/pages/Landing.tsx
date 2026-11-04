// Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { BRAND, money } from "@/config/brand"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { products, tiers } from "@/data/mock"

// Dummy photography. Swap the files in public/images, or change the base here.
const IMAGE_BASE = "/images"
// TODO: point this at the real online store.
const ORDER_URL = "#visit"
const YEAR = new Date().getFullYear()

const textLink =
  "rounded-sm underline decoration-1 underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
const heading = "font-bake font-medium text-balance"

type Photo = { file: string; width: number; height: number; alt: string }

const photos = {
  hero: { file: "hero-croissants.jpg", width: 2000, height: 1600, alt: "Two golden croissants on a dark slate board under a fall of icing sugar" },
  counter: { file: "counter-display.jpg", width: 1600, height: 1068, alt: "Glass bakery cabinet stacked with croissants, twists and glazed pastries" },
  loaves: { file: "rye-loaves.jpg", width: 1400, height: 931, alt: "Round seeded loaves with stalks of wheat on a floured board" },
  cake: { file: "celebration-cake.jpg", width: 1400, height: 1030, alt: "Chocolate celebration cake with piped rosettes on a white stand" },
  shelves: { file: "shop-shelves.jpg", width: 1400, height: 1042, alt: "Bakery shelves with baguettes upright in a crate above trays of bread rolls" },
  cafe: { file: "cafe-interior.jpg", width: 1800, height: 1200, alt: "Bright cafe room with bistro tables, hanging lamps and leafy plants" },
} satisfies Record<string, Photo>

const counterTiles: (Photo & { productId: string; className?: string })[] = [
  { productId: "p2", file: "pain-au-chocolat.jpg", width: 1000, height: 667, alt: "Trays of pain au chocolat and custard tarts", className: "sm:col-span-7" },
  { productId: "p8", file: "cookies.jpg", width: 1000, height: 1250, alt: "Chocolate cookies in a paper-lined bowl", className: "sm:col-span-5" },
  { productId: "p10", file: "doughnuts.jpg", width: 1000, height: 1250, alt: "A stack of iced doughnuts with sprinkles", className: "sm:col-span-5" },
  { productId: "p4", file: "sourdough.jpg", width: 1000, height: 1500, alt: "A round floured sourdough loaf with an open score", className: "sm:col-span-7" },
]

const cakes: (Photo & { productId: string })[] = [
  { productId: "p6", file: "strawberry-cake.jpg", width: 1000, height: 1250, alt: "Slice of layered cream cake topped with fresh red berries" },
  { productId: "p7", file: "cheesecake-slice.jpg", width: 1200, height: 800, alt: "Slice of cheesecake on a pale ceramic plate" },
]

const preorderSteps = [
  "Pick a cake and a pickup date.",
  "Pay the deposit to hold your slot.",
  "Collect it on the day, or send a rider.",
]

const categories = [...new Set(products.map((p) => p.category))]
const productById = (id: string) => products.find((p) => p.id === id)

function Img({ photo, className, eager = false }: { photo: Photo; className?: string; eager?: boolean }) {
  return (
    <img
      src={`${IMAGE_BASE}/${photo.file}`}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={cn("block w-full object-cover", className)}
    />
  )
}

/** Full-bleed band. The caption overlays a corner on wide screens and sits below the image on phones. */
function PhotoFold({ photo, caption, className }: { photo: Photo; caption: string; className?: string }) {
  return (
    <figure className="relative bg-espresso">
      <Img photo={photo} className={cn("h-[62svh] min-h-80 md:h-[88svh]", className)} />
      <figcaption className="px-4 py-3 text-sm text-oat md:absolute md:bottom-6 md:left-8 md:max-w-sm md:rounded-sm md:bg-espresso md:px-3 md:py-2">
        {caption}
      </figcaption>
    </figure>
  )
}

export default function Landing() {
  return (
    <div className="min-h-svh overflow-x-clip bg-background">
      {/* Hero */}
      <section className="relative isolate flex min-h-svh flex-col justify-between bg-espresso text-flour">
        <Img photo={photos.hero} eager className="absolute inset-0 -z-20 h-full object-[50%_70%]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-espresso via-espresso/30 to-espresso/60" aria-hidden />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-8">
          <Link to="/" className="rounded-sm font-bake text-xl font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
            {BRAND.name}
          </Link>
          <nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium">
            <a href="#menu" className="whitespace-nowrap transition-colors hover:text-gold">Menu</a>
            <a href="#cakes" className="hidden whitespace-nowrap transition-colors hover:text-gold sm:block">Cakes</a>
            <a href="#visit" className="hidden whitespace-nowrap transition-colors hover:text-gold sm:block">Visit</a>
          </nav>
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-8 md:pb-14">
          <h1 className={cn(heading, "text-5xl leading-none sm:text-7xl")}>Baked at dawn.</h1>
          <p className="mt-4 max-w-md text-lg text-oat">
            Laminated pastry, sourdough and whole cakes from our {BRAND.outlet}.
          </p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-medium">
            <a href="#menu" className={cn(textLink, "decoration-gold whitespace-nowrap hover:text-gold focus-visible:outline-gold")}>See the menu</a>
            <a href="#cakes" className={cn(textLink, "decoration-gold whitespace-nowrap hover:text-gold focus-visible:outline-gold")}>Pre-order a cake</a>
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-20 md:py-28">
        <p className={cn(heading, "text-3xl leading-snug text-espresso sm:text-4xl")}>
          The croissants go in to proof at 5am. By the time {BRAND.area.split(",")[0]} wakes up, the trays are out and the
          whole street smells of butter.
        </p>
        <p className="mt-6 max-w-xl text-muted-foreground">
          We keep the list short and the ingredients good: French T55 flour, Lescure cultured butter, Valrhona 70%
          chocolate, Cameron Highlands strawberries, and pandan in the chiffon because it belongs there.
        </p>
      </section>

      <PhotoFold photo={photos.counter} caption="The counter, just after the first trays come out." />

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 md:px-8 md:py-28">
        <h2 className={cn(heading, "text-4xl text-espresso sm:text-5xl")}>On the counter</h2>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-12">
          {counterTiles.map((tile) => {
            const product = productById(tile.productId)
            return (
              <figure key={tile.productId} className={cn("min-w-0", tile.className)}>
                <Img photo={tile} className="aspect-4/3 rounded-sm sm:h-96 sm:aspect-auto" />
                <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                  <span className="font-medium text-espresso">{product?.name}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">{product && money(product.price)}</span>
                </figcaption>
              </figure>
            )
          })}
        </div>

        <div className="mt-16 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="min-w-0">
              <h3 className={cn(heading, "text-2xl text-espresso")}>{category}</h3>
              <ul className="mt-3">
                {products
                  .filter((p) => p.category === category)
                  .map((p) => (
                    <li key={p.id} className="flex items-baseline gap-3 py-1.5">
                      <span className="min-w-0">
                        {p.name}
                        {p.preorderOnly && <span className="ml-2 text-xs whitespace-nowrap text-muted-foreground">pre-order</span>}
                      </span>
                      <span className="min-w-4 flex-1 border-b border-dotted border-input" aria-hidden />
                      <span className="text-muted-foreground tabular-nums whitespace-nowrap">{money(p.price)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <PhotoFold photo={photos.loaves} caption="Floured boards and long, slow proofs." />

      {/* Cakes */}
      <section id="cakes" className="scroll-mt-6 bg-espresso text-flour">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <Img photo={photos.cake} className="rounded-sm lg:h-full" />
          <div className="min-w-0">
            <h2 className={cn(heading, "text-4xl sm:text-5xl")}>Whole cakes, made to order</h2>
            <p className="mt-4 text-oat">
              Birthdays, anniversaries and big office orders. Tell us the date and we'll bake it for that morning.
            </p>
            <ol className="mt-6 space-y-2">
              {preorderSteps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="font-bake text-gold tabular-nums">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <Button
              nativeButton={false}
              render={<a href={ORDER_URL} />}
              className="group mt-8 h-12 rounded-sm bg-paprika px-6 text-base whitespace-nowrap text-white hover:bg-paprika-dark"
            >
              Pre-order a cake <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {cakes.map((cake) => {
                const product = productById(cake.productId)
                return (
                  <figure key={cake.productId} className="min-w-0">
                    <Img photo={cake} className="aspect-square rounded-sm" />
                    <figcaption className="mt-2 text-sm">
                      <span className="block font-medium">{product?.name}</span>
                      <span className="text-oat tabular-nums">{product && money(product.price)}</span>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Rewards and delivery */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0">
          <h2 className={cn(heading, "text-4xl text-espresso sm:text-5xl")}>Regulars eat better</h2>
          <p className="mt-4 text-muted-foreground">Every ringgit earns points, online or at the counter.</p>
          <dl className="mt-6 divide-y">
            {tiers.map((tier) => (
              <div key={tier.name} className="py-3">
                <dt className={cn(heading, "text-xl text-espresso")}>{tier.name}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{tier.perks.join(" · ")}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-muted-foreground">
            Can't make it in? Pick a pickup slot, or get it delivered by Grab, Lalamove or foodpanda.
          </p>
        </div>
        <Img photo={photos.shelves} className="rounded-sm" />
      </section>

      {/* Visit */}
      <section id="visit" className="scroll-mt-6">
        <PhotoFold photo={photos.cafe} caption="Come in, sit down, stay for a second one." />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:grid-cols-2 md:px-8">
          <h2 className={cn(heading, "text-4xl text-espresso sm:text-5xl")}>Come by while it's warm</h2>
          <address className="text-lg not-italic">
            <p className="font-medium text-espresso">{BRAND.outlet}</p>
            <p>{BRAND.area}</p>
            <p className="mt-4">{BRAND.hours}</p>
            <p className="text-muted-foreground">{BRAND.closed}</p>
          </address>
        </div>
      </section>

      <footer className="bg-espresso px-4 py-10 text-oat md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className={cn(heading, "text-4xl text-flour sm:text-6xl")}>{BRAND.name}</p>
          <p className="text-sm">© {YEAR} {BRAND.name}</p>
        </div>
      </footer>
    </div>
  )
}
