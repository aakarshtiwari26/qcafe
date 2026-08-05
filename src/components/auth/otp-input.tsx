"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="000000"
      className={cn("h-14 text-center text-2xl font-bold tracking-[0.5em]", className)}
    />
  );
}
