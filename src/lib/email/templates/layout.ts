import { getSiteConfig } from "@/config/site";
import { getRestaurantSettings } from "@/services/settings.service";

/**
 * Every transactional email wraps this shell — table-based layout because
 * Outlook/Gmail strip modern CSS. Branding comes from getSiteConfig() (env
 * vars); the support email comes from the admin-editable RestaurantSettings
 * doc, falling back to the env var if that's ever empty.
 */
export async function emailLayout(bodyHtml: string, opts: { preheader?: string } = {}): Promise<string> {
  const site = getSiteConfig();
  const settings = await getRestaurantSettings().catch(() => null);
  const supportEmail = settings?.email || site.supportEmail;
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${site.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr>
<td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
<span style="font-size:20px;font-weight:700;color:#18181b;letter-spacing:-0.02em;">${site.name}</span>
</td>
</tr>
<tr>
<td style="padding:32px;">
${bodyHtml}
</td>
</tr>
<tr>
<td style="padding:24px 32px;background-color:#fafafa;text-align:center;">
<p style="margin:0;font-size:12px;line-height:18px;color:#a1a1aa;">
${site.name} &middot; ${year}<br/>
Need help? <a href="mailto:${supportEmail}" style="color:#71717a;">${supportEmail}</a>
</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function emailButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="border-radius:10px;background-color:#18181b;">
<a href="${url}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${label}</a>
</td></tr>
</table>`;
}

export function emailOtpBlock(code: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background-color:#fafafa;border:1px solid #ececec;border-radius:12px;padding:20px;text-align:center;">
<span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#18181b;">${code}</span>
</td></tr>
</table>`;
}
