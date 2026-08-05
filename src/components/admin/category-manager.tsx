"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Pencil, Loader2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { categorySchema, type CategoryInput } from "@/lib/validators/menu";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

export interface CategoryRow {
  id: string;
  name: string;
  isActive: boolean;
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", isActive: true, sortOrder: categories.length });
    setOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    reset({ name: cat.name, isActive: cat.isActive });
    setOpen(true);
  }

  async function onSubmit(values: CategoryInput) {
    try {
      if (editing) {
        await apiFetch(`/api/categories/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) });
        toast.success("Category updated");
      } else {
        await apiFetch("/api/categories", { method: "POST", body: JSON.stringify(values) });
        toast.success("Category created");
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
      await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted");
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
        <h2 className="text-sm font-semibold">Categories</h2>
        <Button size="sm" onClick={openCreate} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="size-3.5" /> Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" className="mt-4 border-none py-14" />
      ) : (
        <div className="mt-4 divide-y divide-border">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium">{cat.name}</span>
                {!cat.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Inactive</span>}
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(cat)} aria-label="Edit">
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id)}
                  aria-label="Delete"
                >
                  {deletingId === cat.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
