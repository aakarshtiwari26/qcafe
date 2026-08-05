import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { listHostels } from "@/services/hostel.service";
import { toHostelDTO } from "@/lib/serializers/hostel";
import { AddressManager, type AddressDTO } from "@/components/dashboard/address-manager";

export const metadata: Metadata = { title: "Addresses" };

export default async function SettingsPage() {
  const session = await getSession();
  await connectDB();

  const [user, hostels] = await Promise.all([
    User.findById(session!.sub).populate("addresses.hostel", "name"),
    listHostels(),
  ]);

  const addresses: AddressDTO[] = (user?.addresses ?? []).map((addr) => {
    const hostel = addr.hostel as unknown as { _id: unknown; name?: string };
    return {
      id: String(addr._id),
      label: addr.label,
      hostelId: String(hostel?._id ?? addr.hostel),
      hostelName: hostel?.name ?? "",
      roomNumber: addr.roomNumber,
      landmark: addr.landmark,
      isDefault: addr.isDefault,
    };
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <AddressManager addresses={addresses} hostels={hostels.map(toHostelDTO)} />
    </div>
  );
}
