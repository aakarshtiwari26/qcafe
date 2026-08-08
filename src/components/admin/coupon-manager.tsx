"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { couponSchema, type CouponInput } from "@/lib/validators/coupon";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

export interface CouponRow {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  isActive: boolean;
  usedCount: number;
  usageLimit?: number;
}

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CouponInput>({ resolver: zodResolver(couponSchema), defaultValues: { discountType: "percentage", isActive: true } });

  function openCreate() {
    reset({ code: "", discountType: "percentage", isActive: true });
    setOpen(true);
  }

  async function onSubmit(values: CouponInput) {
    try {
      await apiFetch("/api/admin/coupons", { method: "POST", body: JSON.stringify(values) });
      toast.success("Coupon created");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      toast.success("Coupon deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Coupons</h2>
        <Button size="sm" onClick={openCreate} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="size-3.5" /> Add coupon
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Coupons display on the homepage; redemption at checkout is not enforced yet.
      </p>

      {coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" className="mt-4 border-none py-14" />
      ) : (
        <div className="mt-4 divide-y divide-border">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{c.code}</span>
                  {!c.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Inactive</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.discountType === "percentage" ? `${c.discountValue}% off` : `Flat ${c.discountValue} off`}
                  {c.usageLimit && ` · ${c.usedCount}/${c.usageLimit} used`}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                disabled={deletingId === c.id}
                onClick={() => handleDelete(c.id)}
                aria-label="Delete"
              >
                {deletingId === c.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="WELCOME10" {...register("code")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" {...register("description")} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="discountType">Type</Label>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="discountType" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat amount</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discountValue">Value</Label>
                <Input id="discountValue" type="number" {...register("discountValue", { valueAsNumber: true })} />
                {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minOrderValue">Minimum order value</Label>
              <Input id="minOrderValue" type="number" {...register("minOrderValue", { valueAsNumber: true })} />
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />} />
              Active
            </label>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
