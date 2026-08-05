import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listOrdersForUser } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/constants";

export const metadata: Metadata = { title: "My Orders" };

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const session = await getSession();
  const page = pageParam ? Number(pageParam) : 1;

  const { orders, totalPages } = await listOrdersForUser(session!.sub, page);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="text-sm font-semibold">My Orders</h2>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order, it'll show up here."
          action={
            <Link href="/menu" className="text-sm font-medium text-brand hover:underline">
              Browse the menu
            </Link>
          }
          className="mt-4 border-none py-14"
        />
      ) : (
        <div className="mt-4 divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              href={`/orders/${order.orderId}`}
              className="-mx-2 flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-4 transition-colors hover:bg-accent/50"
            >
              <div>
                <p className="font-mono text-sm font-semibold">{order.orderId}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} buildHref={(p) => `/dashboard/orders?page=${p}`} />
    </div>
  );
}
