"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/auth/otp-input";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

type Step = "idle" | "enter-phone" | "verify" | "done";

export function ChangePhoneFlow({ currentPhone }: { currentPhone?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");

  async function requestOtp() {
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/account/phone/request-otp", { method: "POST", body: JSON.stringify({ newPhone }) });
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/account/phone/verify-otp", { method: "POST", body: JSON.stringify({ code }) });
      setStep("done");
      toast.success("Phone number updated");
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
        <CheckCircle2 className="size-4" /> Phone updated to {newPhone}
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5 text-sm">
        <Phone className="size-4 text-muted-foreground" />
        <span className="font-medium">{currentPhone ?? "Not set"}</span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      {step === "idle" && (
        <Button size="sm" variant="outline" onClick={() => setStep("enter-phone")}>
          Change phone
        </Button>
      )}

      {step === "enter-phone" && (
        <div className="space-y-2.5">
          <Label htmlFor="newPhone">New phone number</Label>
          <Input id="newPhone" type="tel" inputMode="numeric" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="max-w-xs" />
          <p className="text-xs text-muted-foreground">We&apos;ll email a code to your account email to confirm.</p>
          <Button size="sm" onClick={requestOtp} disabled={loading || newPhone.length !== 10} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Send code
          </Button>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-2.5">
          <Label>Enter the code sent to your email</Label>
          <OtpInput value={code} onChange={setCode} className="h-11 w-40 text-lg" />
          <Button size="sm" onClick={verify} disabled={loading || code.length !== 6} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirm change
          </Button>
        </div>
      )}
    </div>
  );
}
