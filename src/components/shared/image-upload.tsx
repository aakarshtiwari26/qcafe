"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUpload, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UploadedImageValue {
  url: string;
  fileId: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  shape = "circle",
  size = 96,
}: {
  value?: UploadedImageValue;
  onChange: (value: UploadedImageValue) => void;
  folder: "avatar" | "menu" | "category" | "restaurant";
  shape?: "circle" | "square";
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const uploaded = await apiUpload<UploadedImageValue>("/api/upload", formData);
      onChange(uploaded);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative inline-block">
      <div
        style={{ width: size, height: size }}
        className={cn(
          "relative overflow-hidden border border-border bg-muted",
          shape === "circle" ? "rounded-full" : "rounded-xl"
        )}
      >
        {value?.url && <Image src={value.url} alt="" fill sizes={`${size}px`} className="object-cover" />}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        className="absolute -bottom-1 -right-1 rounded-full shadow-sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Camera className="size-3.5" />
      </Button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
