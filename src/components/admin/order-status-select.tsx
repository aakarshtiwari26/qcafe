"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { ORDER_STATUS, ORDER_STATUS_LABELS, type OrderStatus } from "@/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STYLES: Record<OrderStatus, string> = {
  [ORDER_STATUS.RECEIVED]: "bg-muted text-foreground",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  [ORDER_STATUS.PREPARING]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [ORDER_STATUS.READY]: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  [ORDER_STATUS.DELIVERED]: "bg-veg/10 text-veg",
  [ORDER_STATUS.CANCELLED]: "bg-nonveg/10 text-nonveg",
};

// Admin only ever taps two things: Accept/Cancel a new order, and Delivered once it's
// actually handed over. Everything in between (confirmed -> preparing -> ready ->
// out for delivery) advances on its own — see autoAdvanceStatus in order.service.ts.
export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<OrderStatus | null>(null);

  async function updateStatus(value: OrderStatus) {
    setLoading(value);
    try {
      await apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: value }) });
      toast.success(`${orderId} marked ${ORDER_STATUS_LABELS[value]}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to update status");
    } finally {
      setLoading(null);
    }
  }

  if (status === ORDER_STATUS.RECEIVED) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          size="sm"
          disabled={loading !== null}
          onClick={() => updateStatus(ORDER_STATUS.CONFIRMED)}
          className="h-7 gap-1 rounded-full bg-brand px-3 text-xs text-brand-foreground hover:bg-brand/90"
        >
          {loading === ORDER_STATUS.CONFIRMED ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={() => updateStatus(ORDER_STATUS.CANCELLED)}
          className="h-7 gap-1 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10"
        >
          {loading === ORDER_STATUS.CANCELLED ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
          Cancel
        </Button>
      </div>
    );
  }

  const isTerminal = status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.CANCELLED;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[status])}>
        {ORDER_STATUS_LABELS[status]}
      </span>

      {!isTerminal && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            disabled={loading !== null}
            onClick={() => updateStatus(ORDER_STATUS.DELIVERED)}
            className="h-7 gap-1 rounded-full bg-brand px-3 text-xs text-brand-foreground hover:bg-brand/90"
          >
            {loading === ORDER_STATUS.DELIVERED ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            Delivered
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-7 text-muted-foreground hover:text-destructive"
            disabled={loading !== null}
            onClick={() => updateStatus(ORDER_STATUS.CANCELLED)}
            aria-label="Cancel order"
          >
            {loading === ORDER_STATUS.CANCELLED ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3.5" />}
          </Button>
        </div>
      )}
    </div>
  );
}
