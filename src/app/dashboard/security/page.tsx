import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { ChangeEmailFlow } from "@/components/dashboard/change-email-flow";
import { ChangePhoneFlow } from "@/components/dashboard/change-phone-flow";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const session = await getSession();
  await connectDB();
  const user = await User.findById(session!.sub);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-sm font-semibold">Password</h2>
        <p className="mt-1 text-xs text-muted-foreground">Choose a strong password you don&apos;t use elsewhere.</p>
        <Separator className="my-4" />
        <ChangePasswordForm />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-sm font-semibold">Email address</h2>
        <p className="mt-1 text-xs text-muted-foreground">Verifying your current email, then your new one, keeps your account secure.</p>
        <Separator className="my-4" />
        <ChangeEmailFlow currentEmail={user!.email} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-sm font-semibold">Phone number</h2>
        <p className="mt-1 text-xs text-muted-foreground">Confirmed via a code to your email — no SMS required.</p>
        <Separator className="my-4" />
        <ChangePhoneFlow currentPhone={user!.phone} />
      </div>
    </div>
  );
}
