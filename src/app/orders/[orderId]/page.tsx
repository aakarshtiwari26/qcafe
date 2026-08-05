import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Phone, MapPin, StickyNote } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getOrderByOrderId } from "@/services/order.service";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { USER_ROLE, ORDER_STATUS } from "@/constants";
import { NotFoundError, ForbiddenError } from "@/lib/api/errors";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `Order ${orderId}` };
}

export default async function OrderTrackingPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?redirect=/orders/${orderId}`);

  const isAdmin = session.role === USER_ROLE.ADMIN || session.role === USER_ROLE.SUPER_ADMIN;

  let order;
  try {
    order = await getOrderByOrderId(orderId, session.sub, isAdmin);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) notFound();
    throw error;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order</p>
          <h1 className="font-mono text-2xl font-bold tracking-tight">{order.orderId}</h1>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{formatDateTime(order.createdAt)}</p>
          {order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED && order.estimatedDeliveryAt && (
            <p>Estimated by {formatDateTime(order.estimatedDeliveryAt)}</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold">Status</h2>
          <OrderStatusTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="mb-3.5 text-sm font-semibold">Items</h2>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                  {item.image && (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} &times; {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span className="text-foreground">{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="text-foreground">{formatCurrency(order.taxAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-veg">
                  <span>Discount</span>
                  <span>&minus;{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="mb-3.5 text-sm font-semibold">Delivery details</h2>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>
                  {order.hostelName}, Room {order.roomNumber}
                  {order.landmark && <span className="text-muted-foreground"> &middot; {order.landmark}</span>}
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-muted-foreground" /> {order.contactPhone}
              </p>
              {order.customerNotes && (
                <p className="flex items-start gap-2.5">
                  <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {order.customerNotes}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary">Cash on Delivery</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/dashboard/orders" className="text-sm font-medium text-brand hover:underline">
          View all orders
        </Link>
      </div>
    </div>
  );
}
