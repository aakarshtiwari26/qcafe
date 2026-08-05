"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "./otp-input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { apiFetch, ApiClientError } from "@/lib/api/client";

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setServerError(null);
    try {
      await apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify(values) });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="size-10 text-veg" />
        <p className="text-sm font-medium">Password reset. Redirecting to sign in&hellip;</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Verification code</Label>
        <Controller name="code" control={control} render={({ field }) => <OtpInput value={field.value ?? ""} onChange={field.onChange} />} />
        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Reset password
      </Button>
    </form>
  );
}
