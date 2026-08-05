"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { USER_STATUS, type UserStatus } from "@/constants";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function UserStatusToggle({ userId, status }: { userId: string; status: UserStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSuspended = status === USER_STATUS.SUSPENDED;

  async function toggle() {
    setLoading(true);
    try {
      const nextStatus = isSuspended ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED;
      await apiFetch(`/api/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      toast.success(isSuspended ? "User activated" : "User suspended");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant={isSuspended ? "outline" : "destructive"}
      onClick={toggle}
      disabled={loading}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {isSuspended ? "Activate" : "Suspend"}
    </Button>
  );
}
