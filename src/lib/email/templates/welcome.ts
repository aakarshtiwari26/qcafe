import { getSiteConfig } from "@/config/site";
import { emailLayout, emailButton } from "./layout";

export function welcomeEmail(name: string) {
  const site = getSiteConfig();
  const html = emailLayout(
    `<h1 style="margin:0 0 8px;font-size:20px;color:#18181b;">Welcome, ${name} 👋</h1>
<p style="margin:0;font-size:14px;line-height:22px;color:#52525b;">Your ${site.name} account is verified and ready. Browse the menu and place your first order in seconds.</p>
${emailButton("Browse the menu", `${site.url}/menu`)}`,
    { preheader: `Welcome to ${site.name}` }
  );
  return { subject: `Welcome to ${site.name}`, html };
}
