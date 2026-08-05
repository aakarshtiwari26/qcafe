import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import { ORDER_STATUS, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from "@/constants";

export function OrderStatusTimeline({
  currentStatus,
  statusHistory,
}: {
  currentStatus: OrderStatus;
  statusHistory: { status: OrderStatus; changedAt: Date | string }[];
}) {
  if (currentStatus === ORDER_STATUS.CANCELLED) {
    const cancelledAt = statusHistory.find((h) => h.status === ORDER_STATUS.CANCELLED)?.changedAt;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-nonveg/30 bg-nonveg/5 px-4 py-3.5">
        <XCircle className="size-5 shrink-0 text-nonveg" />
        <div>
          <p className="text-sm font-semibold text-nonveg">Order cancelled</p>
          {cancelledAt && <p className="text-xs text-muted-foreground">{formatDateTime(cancelledAt)}</p>}
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const historyMap = new Map(statusHistory.map((h) => [h.status, h.changedAt]));

  return (
    <ol className="space-y-0">
      {ORDER_STATUS_FLOW.map((status, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const timestamp = historyMap.get(status);
        const isLast = i === ORDER_STATUS_FLOW.length - 1;

        return (
          <li key={status} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              {isDone ? (
                <CheckCircle2 className={cn("size-5 shrink-0", isCurrent ? "text-brand" : "text-veg")} />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground/40" />
              )}
              {!isLast && <span className={cn("mt-1 w-px flex-1", isDone ? "bg-veg" : "bg-border")} style={{ minHeight: 28 }} />}
            </div>
            <div className={cn("pb-7", isLast && "pb-0")}>
              <p className={cn("text-sm font-medium", !isDone && "text-muted-foreground")}>
                {ORDER_STATUS_LABELS[status]}
              </p>
              {timestamp && <p className="text-xs text-muted-foreground">{formatDateTime(timestamp)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
