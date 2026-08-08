"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Pencil, Loader2, MessageSquareQuote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { reviewSchema, type ReviewInput } from "@/lib/validators/review";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ReviewRow {
  id: string;
  customerName: string;
  detail?: string;
  quote: string;
  rating: number;
  isActive: boolean;
}

export function ReviewManager({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, isActive: true } });

  function openCreate() {
    setEditing(null);
    reset({ customerName: "", detail: "", quote: "", rating: 5, isActive: true, sortOrder: reviews.length });
    setOpen(true);
  }

  function openEdit(review: ReviewRow) {
    setEditing(review);
    reset({
      customerName: review.customerName,
      detail: review.detail,
      quote: review.quote,
      rating: review.rating,
      isActive: review.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(values: ReviewInput) {
    try {
      if (editing) {
        await apiFetch(`/api/admin/reviews/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) });
        toast.success("Review updated");
      } else {
        await apiFetch("/api/admin/reviews", { method: "POST", body: JSON.stringify(values) });
        toast.success("Review added");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
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
        <h2 className="text-sm font-semibold">Reviews</h2>
        <Button size="sm" onClick={openCreate} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="size-3.5" /> Add review
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Shown in the &ldquo;What customers say&rdquo; section on the homepage. Inactive reviews stay hidden.
      </p>

      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No reviews yet" className="mt-4 border-none py-14" />
      ) : (
        <div className="mt-4 divide-y divide-border">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5">
              <div className="min-w-0 flex-1 basis-64">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{review.customerName}</span>
                  {review.detail && <span className="text-xs text-muted-foreground">· {review.detail}</span>}
                  {!review.isActive && (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Hidden</span>
                  )}
                </div>
                <div className="mt-1 flex gap-0.5 text-brand">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-3", i < review.rating ? "fill-brand" : "fill-none text-muted-foreground/40")} />
                  ))}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">&ldquo;{review.quote}&rdquo;</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(review)} aria-label="Edit">
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deletingId === review.id}
                  onClick={() => handleDelete(review.id)}
                  aria-label="Delete"
                >
                  {deletingId === review.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit review" : "Add review"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Customer name</Label>
                <Input id="customerName" placeholder="Ananya R." {...register("customerName")} />
                {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="detail">Detail (optional)</Label>
                <Input id="detail" placeholder="Gavaskar Boys Hostel" {...register("detail")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quote">Review</Label>
              <Textarea id="quote" rows={3} placeholder="What did they say?" {...register("quote")} />
              {errors.quote && <p className="text-xs text-destructive">{errors.quote.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Rating</Label>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const filled = value <= (field.value ?? 5);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          aria-label={`${value} star${value > 1 ? "s" : ""}`}
                          className="p-0.5"
                        >
                          <Star className={cn("size-5 text-brand", filled ? "fill-brand" : "fill-none")} />
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />} />
              Show on homepage
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
