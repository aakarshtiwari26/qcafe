import type { Metadata } from "next";
import Link from "next/link";
import { Package, Heart, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { listOrdersForUser } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/constants";

export const metadata: Metadata = { title: "My Account" };

export default async function DashboardOverviewPage() {
  const session = await getSession();
  await connectDB();

  const [user, ordersResult] = await Promise.all([
    User.findById(session!.sub),
    listOrdersForUser(session!.sub, 1, 5),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h2 className="text-xl font-bold">{user?.name}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="text-xs text-muted-foreground">Total orders</p>
          <p className="mt-1 text-2xl font-bold">{ordersResult.total}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="text-xs text-muted-foreground">Favorites</p>
          <p className="mt-1 text-2xl font-bold">{user?.favorites.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="text-xs text-muted-foreground">Saved addresses</p>
          <p className="mt-1 text-2xl font-bold">{user?.addresses.length ?? 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent orders</h3>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {ordersResult.orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your recent orders will show up here."
            action={
              <Link href="/menu" className="text-sm font-medium text-brand hover:underline">
                Browse the menu
              </Link>
            }
            className="mt-4 border-none py-10"
          />
        ) : (
          <div className="mt-4 divide-y divide-border">
            {ordersResult.orders.map((order) => (
              <Link
                key={order.orderId}
                href={`/orders/${order.orderId}`}
                className="flex items-center justify-between gap-3 py-3.5 hover:bg-accent/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{order.orderId}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
                  <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/favorites"
        className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 hover:bg-accent/50 transition-colors"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium">
          <Heart className="size-4 text-nonveg" /> View your favorite dishes
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
