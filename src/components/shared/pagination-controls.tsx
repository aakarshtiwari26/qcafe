import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PaginationControls({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Button variant="outline" size="icon-sm" className="rounded-full" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? (
          <Link href={buildHref(page - 1)} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </Button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-sm text-muted-foreground">&hellip;</span>}
          <Button
            variant={p === page ? "default" : "outline"}
            size="icon-sm"
            className={cn("rounded-full", p === page && "bg-brand text-brand-foreground hover:bg-brand/90")}
            asChild={p !== page}
          >
            {p !== page ? <Link href={buildHref(p)}>{p}</Link> : <span>{p}</span>}
          </Button>
        </span>
      ))}

      <Button variant="outline" size="icon-sm" className="rounded-full" disabled={page >= totalPages} asChild={page < totalPages}>
        {page < totalPages ? (
          <Link href={buildHref(page + 1)} aria-label="Next page">
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </nav>
  );
}
