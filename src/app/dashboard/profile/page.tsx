import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { listHostels } from "@/services/hostel.service";
import { toHostelDTO } from "@/lib/serializers/hostel";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  await connectDB();

  const [user, hostels] = await Promise.all([User.findById(session!.sub), listHostels()]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-5 text-sm font-semibold">Profile</h2>
      <ProfileForm
        hostels={hostels.map(toHostelDTO)}
        defaultValues={{
          name: user!.name,
          hostelId: user!.hostel ? String(user!.hostel) : undefined,
          profileImage: user!.profileImage?.url
            ? { url: user!.profileImage.url, fileId: user!.profileImage.fileId }
            : undefined,
        }}
      />
    </div>
  );
}
