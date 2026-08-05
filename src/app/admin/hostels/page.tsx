import type { Metadata } from "next";
import { listHostels } from "@/services/hostel.service";
import { HostelManager } from "@/components/admin/hostel-manager";

export const metadata: Metadata = { title: "Hostels" };

export default async function AdminHostelsPage() {
  const hostels = await listHostels(true);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <HostelManager
        hostels={hostels.map((h) => ({ id: String(h._id), name: h.name, code: h.code, isActive: h.isActive }))}
      />
    </div>
  );
}
