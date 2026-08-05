import { formatCurrency } from "@/lib/utils/format";

export function OrderSummary({
  subtotal,
  deliveryFee,
  taxAmount,
  total,
  taxPercent,
}: {
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  total: number;
  taxPercent: number;
}) {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span className="text-foreground">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Delivery fee</span>
        <span className="text-foreground">{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Free"}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Tax ({taxPercent}%)</span>
        <span className="text-foreground">{formatCurrency(taxAmount)}</span>
      </div>
      <div className="mt-1 flex justify-between border-t border-border pt-2.5 text-base font-bold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
