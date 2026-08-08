"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import type { HostelDTO } from "@/lib/serializers/hostel";

export function RegisterForm({ hostels }: { hostels: HostelDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      const { email } = await apiFetch<{ email: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" placeholder="Jordan Lee" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="9876543210" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">At least 8 characters, with upper, lower and a number.</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
