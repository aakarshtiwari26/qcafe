import type { IUser } from "@/models";

export function toPublicUser(user: IUser) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    hostel: user.hostel,
    profileImage: user.profileImage,
    addresses: user.addresses,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}
