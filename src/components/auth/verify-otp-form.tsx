"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "./otp-input";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { useCooldown } from "@/hooks/use-cooldown";
import { AUTH_LIMITS } from "@/constants";

export function VerifyOtpForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const cooldown = useCooldown(AUTH_LIMITS.OTP_RESEND_COOLDOWN_SECONDS);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code }) });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResending(true);
    try {
      await apiFetch("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) });
      cooldown.start();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <OtpInput value={code} onChange={setCode} />

      <Button
        type="submit"
        disabled={submitting || code.length !== 6}
        className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Verify email
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown.isActive}
          className="font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown.isActive ? `Resend in ${cooldown.remaining}s` : "Resend code"}
        </button>
      </p>
    </form>
  );
}
