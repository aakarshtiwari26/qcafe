"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/auth/otp-input";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

type Step = "idle" | "verify-current" | "enter-new" | "verify-new" | "done";

export function ChangeEmailFlow({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCode, setNewCode] = useState("");
  const [changeToken, setChangeToken] = useState("");

  async function startFlow() {
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/account/email/request-current-otp", { method: "POST" });
      setStep("verify-current");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCurrent() {
    setError(null);
    setLoading(true);
    try {
      const { changeToken } = await apiFetch<{ changeToken: string }>("/api/account/email/verify-current-otp", {
        method: "POST",
        body: JSON.stringify({ code: currentCode }),
      });
      setChangeToken(changeToken);
      setStep("enter-new");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function requestNewEmailOtp() {
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/account/email/request-new-otp", {
        method: "POST",
        body: JSON.stringify({ changeToken, newEmail }),
      });
      setStep("verify-new");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verifyNew() {
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/account/email/verify-new-otp", { method: "POST", body: JSON.stringify({ code: newCode }) });
      setStep("done");
      toast.success("Email updated");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <p className="flex items-center gap-2 text-sm text-veg">
        <CheckCircle2 className="size-4" /> Email updated to {newEmail}
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5 text-sm">
        <Mail className="size-4 text-muted-foreground" />
        <span className="font-medium">{currentEmail}</span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      {step === "idle" && (
        <Button size="sm" variant="outline" onClick={startFlow} disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Change email
        </Button>
      )}

      {step === "verify-current" && (
        <div className="space-y-2.5">
          <Label>Enter the code sent to {currentEmail}</Label>
          <OtpInput value={currentCode} onChange={setCurrentCode} className="h-11 w-40 text-lg" />
          <Button size="sm" onClick={verifyCurrent} disabled={loading || currentCode.length !== 6} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Verify
          </Button>
        </div>
      )}

      {step === "enter-new" && (
        <div className="space-y-2.5">
          <Label htmlFor="newEmail">New email address</Label>
          <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={requestNewEmailOtp} disabled={loading || !newEmail} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Send code
          </Button>
        </div>
      )}

      {step === "verify-new" && (
        <div className="space-y-2.5">
          <Label>Enter the code sent to {newEmail}</Label>
          <OtpInput value={newCode} onChange={setNewCode} className="h-11 w-40 text-lg" />
          <Button size="sm" onClick={verifyNew} disabled={loading || newCode.length !== 6} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirm change
          </Button>
        </div>
      )}
    </div>
  );
}
