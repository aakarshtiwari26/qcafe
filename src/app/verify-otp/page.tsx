import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/register");

  return (
    <AuthShell title="Check your inbox" description={`Enter the 6-digit code we sent to ${email}.`}>
      <VerifyOtpForm email={email} />
    </AuthShell>
  );
}
