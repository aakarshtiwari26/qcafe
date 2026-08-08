"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, type OrderStatus } from "@/constants";
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

function getNextStatus(status: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = getNextStatus(status);
  const isTerminal = status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.CANCELLED;

  async function updateStatus(value: OrderStatus) {
    setLoading(true);
    try {
      await apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: value }) });
      toast.success(`${orderId} marked ${ORDER_STATUS_LABELS[value]}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[status])}>
        {ORDER_STATUS_LABELS[status]}
      </span>

      {!isTerminal && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            disabled={loading || !next}
            onClick={() => next && updateStatus(next)}
            className="h-7 gap-1 rounded-full bg-brand px-3 text-xs text-brand-foreground hover:bg-brand/90"
          >
            {loading ? <Loader2 className="size-3 animate-spin" /> : <ArrowRight className="size-3" />}
            Mark {next ? ORDER_STATUS_LABELS[next] : ""}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="size-7" disabled={loading} aria-label="More status actions">
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => updateStatus(ORDER_STATUS.CANCELLED)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <X className="size-3.5" /> Cancel order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
