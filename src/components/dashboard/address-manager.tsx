"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Star, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { addressSchema, type AddressInput } from "@/lib/validators/user";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import type { HostelDTO } from "@/lib/serializers/hostel";
import { toast } from "sonner";

export interface AddressDTO {
  id: string;
  label: string;
  hostelId: string;
  hostelName: string;
  roomNumber: string;
  landmark?: string;
  isDefault: boolean;
}

export function AddressManager({ addresses, hostels }: { addresses: AddressDTO[]; hostels: HostelDTO[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema), defaultValues: { isDefault: addresses.length === 0 } });

  async function onSubmit(values: AddressInput) {
    try {
      await apiFetch("/api/account/addresses", { method: "POST", body: JSON.stringify(values) });
      toast.success("Address added");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      toast.success("Address removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await apiFetch(`/api/account/addresses/${id}`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Saved Addresses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Plus className="size-3.5" /> Add address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="label">Label</Label>
                <Input id="label" placeholder="e.g. My room" {...register("label")} />
                {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hostelId">Hostel</Label>
                  <Controller
                    name="hostelId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="hostelId" className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {hostels.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.hostelId && <p className="text-xs text-destructive">{errors.hostelId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="roomNumber">Room number</Label>
                  <Input id="roomNumber" {...register("roomNumber")} />
                  {errors.roomNumber && <p className="text-xs text-destructive">{errors.roomNumber.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="landmark">Landmark (optional)</Label>
                <Input id="landmark" {...register("landmark")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Save address
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add a hostel address for faster checkout." className="mt-4 border-none py-14" />
      ) : (
        <div className="mt-4 space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{addr.label}</p>
                  {addr.isDefault && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">Default</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {addr.hostelName}, Room {addr.roomNumber}
                  {addr.landmark && ` · ${addr.landmark}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <Button size="icon-sm" variant="ghost" onClick={() => handleSetDefault(addr.id)} aria-label="Set as default">
                    <Star className="size-3.5" />
                  </Button>
                )}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deletingId === addr.id}
                  onClick={() => handleDelete(addr.id)}
                  aria-label="Remove address"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
