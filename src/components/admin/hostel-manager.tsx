"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Pencil, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { hostelSchema, type HostelInput } from "@/lib/validators/menu";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

export interface HostelRow {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export function HostelManager({ hostels }: { hostels: HostelRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HostelRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HostelInput>({ resolver: zodResolver(hostelSchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", code: "", isActive: true, sortOrder: hostels.length });
    setOpen(true);
  }

  function openEdit(h: HostelRow) {
    setEditing(h);
    reset({ name: h.name, code: h.code, isActive: h.isActive });
    setOpen(true);
  }

  async function onSubmit(values: HostelInput) {
    try {
      if (editing) {
        await apiFetch(`/api/hostels/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) });
        toast.success("Hostel updated");
      } else {
        await apiFetch("/api/hostels", { method: "POST", body: JSON.stringify(values) });
        toast.success("Hostel created");
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
      await apiFetch(`/api/hostels/${id}`, { method: "DELETE" });
      toast.success("Hostel deleted");
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
        <h2 className="text-sm font-semibold">Hostels</h2>
        <Button size="sm" onClick={openCreate} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="size-3.5" /> Add hostel
        </Button>
      </div>

      {hostels.length === 0 ? (
        <EmptyState icon={Building2} title="No hostels yet" className="mt-4 border-none py-14" />
      ) : (
        <div className="mt-4 divide-y divide-border">
          {hostels.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium">{h.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{h.code}</span>
                {!h.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Inactive</span>}
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(h)} aria-label="Edit">
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deletingId === h.id}
                  onClick={() => handleDelete(h.id)}
                  aria-label="Delete"
                >
                  {deletingId === h.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit hostel" : "Add hostel"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="e.g. HA" {...register("code")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
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
