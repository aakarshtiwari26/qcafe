import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { ActivityLog } from "@/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatDateTime } from "@/lib/utils/format";
import { PAGINATION } from "@/constants";
import type { IUser } from "@/models";

export const metadata: Metadata = { title: "Activity Logs" };

export default async function AdminActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;

  await connectDB();
  const [logs, total] = await Promise.all([
    ActivityLog.find({})
      .populate("actor", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    ActivityLog.countDocuments({}),
  ]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold">Activity Logs</h2>

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity yet" className="border-none py-14" />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const actor = log.actor as unknown as Pick<IUser, "name" | "email"> | null;
                return (
                  <TableRow key={String(log._id)}>
                    <TableCell className="text-sm">{actor?.name ?? "System"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.targetType} {log.targetId ? `· ${log.targetId}` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} buildHref={(p) => `/admin/activity-logs?page=${p}`} />
    </div>
  );
}
