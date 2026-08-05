import Link from "next/link";
import Image from "next/image";
import { getSiteConfig } from "@/config/site";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const site = getSiteConfig();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <Image src={site.logoUrl} alt={site.name} width={32} height={32} className="size-8 rounded-lg" />
          <span className="text-lg font-bold tracking-tight">{site.name}</span>
        </Link>

        <div className="mt-7 rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
