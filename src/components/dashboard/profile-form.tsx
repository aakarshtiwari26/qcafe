"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload, type UploadedImageValue } from "@/components/shared/image-upload";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validators/user";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import type { HostelDTO } from "@/lib/serializers/hostel";
import { toast } from "sonner";

export function ProfileForm({
  hostels,
  defaultValues,
}: {
  hostels: HostelDTO[];
  defaultValues: { name: string; hostelId?: string; profileImage?: UploadedImageValue };
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<UploadedImageValue | undefined>(defaultValues.profileImage);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: defaultValues.name, hostelId: defaultValues.hostelId },
  });

  async function onSubmit(values: UpdateProfileInput) {
    setServerError(null);
    try {
      await apiFetch("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({ ...values, profileImage: avatar }),
      });
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <ImageUpload value={avatar} onChange={setAvatar} folder="avatar" />

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{String(errors.name.message)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hostelId">Hostel</Label>
        <Controller
          name="hostelId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="hostelId" className="w-full sm:w-64">
                <SelectValue placeholder="Select hostel" />
              </SelectTrigger>
              <SelectContent>
                {hostels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
