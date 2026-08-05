import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { listHostels } from "@/services/hostel.service";
import { toHostelDTO } from "@/lib/serializers/hostel";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const hostels = await listHostels();

  return (
    <AuthShell
      title="Create your account"
      description="Order from your hostel in a couple of taps."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm hostels={hostels.map(toHostelDTO)} />
    </AuthShell>
  );
}
