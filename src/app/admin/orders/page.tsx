import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Package } from "lucide-react";
import { listOrdersForAdmin } from "@/services/order.service";
import { AdminOrdersFilters } from "@/components/admin/admin-orders-filters";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { ORDER_STATUS, type OrderStatus } from "@/constants";
import { cn } from "@/lib/utils";
import type { IUser } from "@/models";

export const metadata: Metadata = { title: "Orders" };

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const { orders, totalPages } = await listOrdersForAdmin({
    status: params.status as OrderStatus | undefined,
    search: params.search,
    page,
  });

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.search) sp.set("search", params.search);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold">Orders</h2>

      <Suspense>
        <AdminOrdersFilters />
      </Suspense>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" description="Try a different filter." className="border-none py-14" />
      ) : (
        <div className="divide-y divide-border">
          {orders.map((order) => {
            const customer = order.user as unknown as Pick<IUser, "name" | "email"> | null;
            const needsAction = order.status === ORDER_STATUS.RECEIVED;
            return (
              <div
                key={order.orderId}
                className={cn(
                  "-mx-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-xl px-3 py-4",
                  needsAction && "bg-brand/5"
                )}
              >
                <div className="min-w-0 flex-1 basis-64">
                  <div className="flex items-center gap-2">
                    <Link href={`/orders/${order.orderId}`} className="font-mono text-sm font-semibold text-brand hover:underline">
                      {order.orderId}
                    </Link>
                    {needsAction && (
                      <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-foreground">New</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {customer?.name ?? "—"} · {order.hostelName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                </div>

                <div className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(order.total)}</div>

                <OrderStatusSelect orderId={order.orderId} status={order.status} />
              </div>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
