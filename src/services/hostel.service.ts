import { connectDB } from "@/lib/db/connect";
import { Hostel } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import type { HostelInput } from "@/lib/validators/menu";

export async function listHostels(includeInactive = false) {
  await connectDB();
  const filter = includeInactive ? {} : { isActive: true };
  return Hostel.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function createHostel(input: HostelInput) {
  await connectDB();
  return Hostel.create(input);
}

export async function updateHostel(id: string, input: Partial<HostelInput>) {
  await connectDB();
  const hostel = await Hostel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!hostel) throw new NotFoundError("Hostel not found");
  return hostel;
}

export async function deleteHostel(id: string) {
  await connectDB();
  const hostel = await Hostel.findByIdAndDelete(id);
  if (!hostel) throw new NotFoundError("Hostel not found");
}
