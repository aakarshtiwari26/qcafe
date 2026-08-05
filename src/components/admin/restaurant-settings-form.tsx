"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload, type UploadedImageValue } from "@/components/shared/image-upload";
import { restaurantSettingsSchema, type RestaurantSettingsInput } from "@/lib/validators/user";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";

export function RestaurantSettingsForm({ defaultValues }: { defaultValues: RestaurantSettingsInput }) {
  const router = useRouter();
  const [logo, setLogo] = useState<UploadedImageValue | undefined>(defaultValues.logo);
  const [banner, setBanner] = useState<UploadedImageValue | undefined>(defaultValues.banner);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantSettingsInput>({ resolver: zodResolver(restaurantSettingsSchema), defaultValues });

  async function onSubmit(values: RestaurantSettingsInput) {
    try {
      await apiFetch("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ ...values, logo, banner }) });
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-6">
        <div>
          <Label className="mb-2 block">Logo</Label>
          <ImageUpload value={logo} onChange={setLogo} folder="restaurant" shape="square" size={72} />
        </div>
        <div>
          <Label className="mb-2 block">Banner</Label>
          <ImageUpload value={banner} onChange={setBanner} folder="restaurant" shape="square" size={72} />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Controller name="isOpen" control={control} render={({ field }) => <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />} />
        <Label>Restaurant is currently open</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" {...register("tagline")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="contactNumber">Contact number</Label>
          <Input id="contactNumber" {...register("contactNumber")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber">WhatsApp number</Label>
          <Input id="whatsappNumber" {...register("whatsappNumber")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Support email</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="openingTime">Opening time</Label>
          <Input id="openingTime" type="time" {...register("openingTime")} />
          {errors.openingTime && <p className="text-xs text-destructive">Use HH:MM format</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="closingTime">Closing time</Label>
          <Input id="closingTime" type="time" {...register("closingTime")} />
          {errors.closingTime && <p className="text-xs text-destructive">Use HH:MM format</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="avgResponseTimeMinutes">Avg. response (min)</Label>
          <Input id="avgResponseTimeMinutes" type="number" {...register("avgResponseTimeMinutes", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avgDeliveryTimeMinutes">Avg. delivery (min)</Label>
          <Input id="avgDeliveryTimeMinutes" type="number" {...register("avgDeliveryTimeMinutes", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="taxPercent">Tax (%)</Label>
          <Input id="taxPercent" type="number" step="0.1" {...register("taxPercent", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="deliveryCharges">Delivery charges</Label>
          <Input id="deliveryCharges" type="number" {...register("deliveryCharges", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="minOrderValue">Minimum order value</Label>
          <Input id="minOrderValue" type="number" {...register("minOrderValue", { valueAsNumber: true })} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
