"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Copy, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

export function MenuItemRowActions({
  id,
  isAvailable,
  isHidden,
}: {
  id: string;
  isAvailable: boolean;
  isHidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleAvailability(checked: boolean) {
    setBusy(true);
    try {
      await apiFetch(`/api/menu-items/${id}`, { method: "PATCH", body: JSON.stringify({ isAvailable: checked }) });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility() {
    setBusy(true);
    try {
      await apiFetch(`/api/menu-items/${id}`, { method: "PATCH", body: JSON.stringify({ isHidden: !isHidden }) });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate() {
    setBusy(true);
    try {
      await apiFetch(`/api/menu-items/${id}/duplicate`, { method: "POST" });
      toast.success("Item duplicated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to duplicate");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await apiFetch(`/api/menu-items/${id}`, { method: "DELETE" });
      toast.success("Item deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Switch checked={isAvailable} onCheckedChange={toggleAvailability} disabled={busy} aria-label="Available" />
      <Button size="icon-sm" variant="ghost" onClick={toggleVisibility} disabled={busy} aria-label={isHidden ? "Show" : "Hide"}>
        {isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
      <Button size="icon-sm" variant="ghost" asChild>
        <Link href={`/admin/menu/${id}/edit`} aria-label="Edit">
          <Pencil className="size-3.5" />
        </Link>
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={duplicate} disabled={busy} aria-label="Duplicate">
        <Copy className="size-3.5" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon-sm" variant="ghost" className="text-muted-foreground hover:text-destructive" disabled={busy} aria-label="Delete">
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
