"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { ORDER_STATUS, ORDER_STATUS_LABELS, type OrderStatus } from "@/constants";
import { toast } from "sonner";

const VALID_NEXT: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.RECEIVED]: [ORDER_STATUS.RECEIVED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.CANCELLED],
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const options = VALID_NEXT[status];

  async function handleChange(next: string) {
    if (next === status) return;
    setLoading(true);
    try {
      await apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      toast.success(`Order ${orderId} updated`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading || options.length === 1}>
      <SelectTrigger size="sm" className="w-40">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {ORDER_STATUS_LABELS[opt]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
