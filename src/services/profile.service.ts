import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { NotFoundError, AppError } from "@/lib/api/errors";
import { cleanupReplacedImage } from "@/lib/imagekit/cleanup";
import type { UpdateProfileInput, AddressInput } from "@/lib/validators/user";

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  await connectDB();
  const existing = await User.findById(userId);
  if (!existing) throw new NotFoundError("Account not found");

  const update: Record<string, unknown> = {};
  if (input.name) update.name = input.name;
  if (input.hostelId) update.hostel = input.hostelId;
  if (input.profileImage) update.profileImage = input.profileImage;

  const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
  if (!user) throw new NotFoundError("Account not found");

  if (input.profileImage) {
    await cleanupReplacedImage(existing.profileImage?.fileId, input.profileImage.fileId);
  }

  return user;
}

export async function addAddress(userId: string, input: AddressInput) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  if (input.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push({
    label: input.label,
    hostel: input.hostelId as never,
    roomNumber: input.roomNumber,
    landmark: input.landmark,
    isDefault: input.isDefault || user.addresses.length === 0,
  });
  await user.save();
  return user;
}

export async function updateAddress(userId: string, addressId: string, input: Partial<AddressInput>) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new NotFoundError("Address not found");

  if (input.label) address.label = input.label;
  if (input.hostelId) address.hostel = input.hostelId as never;
  if (input.roomNumber) address.roomNumber = input.roomNumber;
  if (input.landmark !== undefined) address.landmark = input.landmark;
  if (input.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
  }

  await user.save();
  return user;
}

export async function deleteAddress(userId: string, addressId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new NotFoundError("Address not found");

  address.deleteOne();
  await user.save();
  return user;
}

export async function toggleFavorite(userId: string, menuItemId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const index = user.favorites.findIndex((f) => String(f) === menuItemId);
  if (index >= 0) {
    user.favorites.splice(index, 1);
  } else {
    if (user.favorites.length >= 200) {
      throw new AppError("You've reached the maximum number of favorites", 400, "TOO_MANY_FAVORITES");
    }
    user.favorites.push(menuItemId as never);
  }
  await user.save();
  return user;
}

export async function listFavorites(userId: string) {
  await connectDB();
  const user = await User.findById(userId).populate({
    path: "favorites",
    match: { isHidden: false },
    populate: { path: "category", select: "name slug" },
  });
  if (!user) throw new NotFoundError("Account not found");
  return user.favorites;
}
