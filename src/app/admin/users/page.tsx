import type { Metadata } from "next";
import { Users } from "lucide-react";
import { listUsersForAdmin } from "@/services/admin-user.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { UserStatusToggle } from "@/components/admin/user-status-toggle";
import { formatDate } from "@/lib/utils/format";
import { USER_STATUS } from "@/constants";
import type { IHostel } from "@/models";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const { users, totalPages } = await listUsersForAdmin({ search: params.search, page });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold">Users</h2>

      <form method="GET" className="mb-5 max-w-xs">
        <Input name="search" defaultValue={params.search} placeholder="Search name, email, phone..." />
      </form>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" className="border-none py-14" />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const hostel = user.hostel as unknown as Pick<IHostel, "name"> | null;
                return (
                  <TableRow key={String(user._id)}>
                    <TableCell className="text-sm font-medium">{user.name}</TableCell>
                    <TableCell>
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{hostel?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === USER_STATUS.SUSPENDED ? "destructive" : "secondary"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <UserStatusToggle userId={String(user._id)} status={user.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/admin/users?${params.search ? `search=${encodeURIComponent(params.search)}&` : ""}page=${p}`}
      />
    </div>
  );
}
