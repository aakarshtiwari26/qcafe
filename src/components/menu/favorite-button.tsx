"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FavoriteButton({
  menuItemId,
  initialFavorite = false,
  isAuthenticated,
}: {
  menuItemId: string;
  initialFavorite?: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setPending(true);
    const previous = isFavorite;
    setIsFavorite(!previous);
    try {
      const res = await fetch(`/api/account/favorites/${menuItemId}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setIsFavorite(data.isFavorite);
    } catch {
      setIsFavorite(previous);
      toast.error("Couldn't update favorites, try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      disabled={pending}
      onClick={handleClick}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
    >
      <Heart className={cn("size-4 transition-colors", isFavorite && "fill-nonveg text-nonveg")} />
    </Button>
  );
}
