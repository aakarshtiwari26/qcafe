import type { Metadata } from "next";
import { ShoppingBag, IndianRupee, Clock, ChefHat, CheckCircle2, XCircle, Users, TrendingUp } from "lucide-react";
import { getDashboardStats, getRevenueTrend } from "@/services/analytics.service";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatCurrency } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, revenueTrend] = await Promise.all([getDashboardStats(), getRevenueTrend(14)]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Today's Orders" value={stats.todaysOrders} icon={ShoppingBag} />
        <StatCard label="Today's Revenue" value={formatCurrency(stats.todaysRevenue)} icon={IndianRupee} accent="veg" />
        <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} />
        <StatCard label="Preparing" value={stats.preparingOrders} icon={ChefHat} />
        <StatCard label="Completed Today" value={stats.completedOrders} icon={CheckCircle2} accent="veg" />
        <StatCard label="Cancelled Today" value={stats.cancelledOrders} icon={XCircle} accent="nonveg" />
        <StatCard label="Customers" value={stats.customerCount} icon={Users} />
        <StatCard label="14-day Trend" value={`${revenueTrend.reduce((s, r) => s + r.orders, 0)} orders`} icon={TrendingUp} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Revenue — last 14 days</h2>
        <RevenueChart data={revenueTrend} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Top selling items today</h2>
        {stats.topSellingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet today.</p>
        ) : (
          <div className="space-y-2.5">
            {stats.topSellingItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{item.name}</span>
                <span className="text-sm font-semibold tabular-nums">{item.quantity} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
