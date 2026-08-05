import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { USER_ROLE } from "@/constants";
import { NavbarClient, type NavbarUser } from "./navbar-client";

export async function Navbar() {
  const session = await getSession();
  let user: NavbarUser | null = null;

  if (session) {
    await connectDB();
    const dbUser = await User.findById(session.sub);
    if (dbUser) {
      user = {
        name: dbUser.name,
        email: dbUser.email,
        avatarUrl: dbUser.profileImage?.url,
        isAdmin: dbUser.role === USER_ROLE.ADMIN || dbUser.role === USER_ROLE.SUPER_ADMIN,
      };
    }
  }

  return <NavbarClient user={user} />;
}
