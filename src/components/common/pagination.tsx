import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function usePagination<T>(items: T[], pageSize: number) {
  const [requested, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  // Clamped rather than stored, so deleting the last item on a page can't strand the view.
  const page = Math.min(requested, pages)
  const start = (page - 1) * pageSize
  return { page, pages, setPage, visible: items.slice(start, start + pageSize), total: items.length, start }
}

export function Pager({
  page,
  pages,
  setPage,
  total,
  start,
  count,
  noun,
}: {
  page: number
  pages: number
  setPage: (p: number) => void
  total: number
  start: number
  count: number
  noun: string
}) {
  if (total === 0) return null
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <p>
        Showing {start + 1}–{start + count} of {total} {noun}
      </p>
      <div className="flex items-center gap-2">
        <Button size="icon-sm" variant="outline" className="rounded-lg" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        <span className="tabular-nums">
          Page {page} of {pages}
        </span>
        <Button size="icon-sm" variant="outline" className="rounded-lg" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
