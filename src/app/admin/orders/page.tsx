import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Package } from "lucide-react";
import { listOrdersForAdmin } from "@/services/order.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminOrdersFilters } from "@/components/admin/admin-orders-filters";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import type { OrderStatus } from "@/constants";
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const customer = order.user as unknown as Pick<IUser, "name" | "email"> | null;
                return (
                  <TableRow key={order.orderId}>
                    <TableCell>
                      <Link href={`/orders/${order.orderId}`} className="font-mono text-sm font-medium text-brand hover:underline">
                        {order.orderId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{customer?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{customer?.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{order.hostelName}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      <OrderStatusSelect orderId={order.orderId} status={order.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
