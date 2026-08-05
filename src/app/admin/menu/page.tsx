import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, UtensilsCrossed } from "lucide-react";
import { listMenuItems } from "@/services/menu.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { MenuItemRowActions } from "@/components/admin/menu-item-row-actions";
import { formatCurrency } from "@/lib/utils/format";
import type { ICategory } from "@/models";

export const metadata: Metadata = { title: "Menu Items" };

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;

  const { items, totalPages } = await listMenuItems({ page, pageSize: 20, includeHidden: true });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Menu Items</h2>
        <Button asChild size="sm" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/admin/menu/new">
            <Plus className="size-3.5" /> Add item
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No menu items yet" description="Add your first dish to get started." className="border-none py-14" />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const category = item.category as unknown as Pick<ICategory, "name"> | null;
                const image = item.images.find((img) => img.isPrimary)?.url ?? item.images[0]?.url;
                return (
                  <TableRow key={String(item._id)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {image && <Image src={image} alt="" fill sizes="40px" className="object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.isHidden && (
                            <Badge variant="secondary" className="mt-0.5 text-[10px]">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{category?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(item.discountPrice ?? item.price)}</TableCell>
                    <TableCell>
                      <Badge variant={item.inStock ? "secondary" : "destructive"}>{item.inStock ? "In stock" : "Out of stock"}</Badge>
                    </TableCell>
                    <TableCell>
                      <MenuItemRowActions id={String(item._id)} isAvailable={item.isAvailable} isHidden={item.isHidden} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} buildHref={(p) => `/admin/menu?page=${p}`} />
    </div>
  );
}
