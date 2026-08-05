"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload, type UploadedImageValue } from "@/components/shared/image-upload";
import { menuItemSchema, type MenuItemInput } from "@/lib/validators/menu";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { FOOD_TYPE, SPICE_LEVEL, ITEM_TAG } from "@/constants";
import type { CategoryDTO } from "@/lib/serializers/category";
import { toast } from "sonner";

const TAG_OPTIONS = [
  { value: ITEM_TAG.POPULAR, label: "Popular" },
  { value: ITEM_TAG.RECOMMENDED, label: "Recommended" },
  { value: ITEM_TAG.BEST_SELLER, label: "Best Seller" },
  { value: ITEM_TAG.TODAYS_SPECIAL, label: "Today's Special" },
];

export function MenuItemForm({
  categories,
  itemId,
  defaultValues,
}: {
  categories: CategoryDTO[];
  itemId?: string;
  defaultValues?: Partial<MenuItemInput>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImageValue[]>(
    (defaultValues?.images ?? []).map((img) => ({ url: img.url, fileId: img.fileId }))
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      isAvailable: true,
      isHidden: false,
      inStock: true,
      prepTimeMinutes: 15,
      spiceLevel: SPICE_LEVEL.NONE,
      tags: [],
      ...defaultValues,
    },
  });

  const selectedTags = useWatch({ control, name: "tags" }) ?? [];

  function toggleTag(tag: string) {
    const current = selectedTags;
    setValue("tags", current.includes(tag as never) ? current.filter((t) => t !== tag) : [...current, tag as never]);
  }

  function addImage(img: UploadedImageValue) {
    const next = [...images, img];
    setImages(next);
    setValue("images", next.map((i, idx) => ({ ...i, isPrimary: idx === 0 })));
  }

  function removeImage(fileId: string) {
    const next = images.filter((i) => i.fileId !== fileId);
    setImages(next);
    setValue("images", next.map((i, idx) => ({ ...i, isPrimary: idx === 0 })));
  }

  async function onSubmit(values: MenuItemInput) {
    setServerError(null);
    try {
      const payload = { ...values, images: images.map((i, idx) => ({ ...i, isPrimary: idx === 0 })) };
      if (itemId) {
        await apiFetch(`/api/menu-items/${itemId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Item updated");
      } else {
        await apiFetch("/api/menu-items", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Item created");
      }
      router.push("/admin/menu");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div>
        <Label className="mb-2 block">Images</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.fileId} className="relative">
              <ImageUpload value={img} onChange={() => {}} folder="menu" shape="square" size={80} />
              <button
                type="button"
                onClick={() => removeImage(img.fileId)}
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <ImageUpload folder="menu" shape="square" size={80} onChange={addImage} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discountPrice">Discount price (optional)</Label>
          <Input id="discountPrice" type="number" step="0.01" {...register("discountPrice", { valueAsNumber: true })} />
          {errors.discountPrice && <p className="text-xs text-destructive">{errors.discountPrice.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prepTimeMinutes">Prep time (min)</Label>
          <Input id="prepTimeMinutes" type="number" {...register("prepTimeMinutes", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="foodType">Food type</Label>
          <Controller
            name="foodType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="foodType" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FOOD_TYPE.VEG}>Veg</SelectItem>
                  <SelectItem value={FOOD_TYPE.NON_VEG}>Non-veg</SelectItem>
                  <SelectItem value={FOOD_TYPE.EGG}>Egg</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.foodType && <p className="text-xs text-destructive">{errors.foodType.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="spiceLevel">Spice level</Label>
          <Controller
            name="spiceLevel"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="spiceLevel" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SPICE_LEVEL.NONE}>None</SelectItem>
                  <SelectItem value={SPICE_LEVEL.MILD}>Mild</SelectItem>
                  <SelectItem value={SPICE_LEVEL.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={SPICE_LEVEL.HOT}>Hot</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.value as never)
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm">
          <Controller name="isAvailable" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
          Available for order
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <Controller name="inStock" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
          In stock
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <Controller name="isHidden" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
          Hidden from menu
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {itemId ? "Save changes" : "Create item"}
      </Button>
    </form>
  );
}
