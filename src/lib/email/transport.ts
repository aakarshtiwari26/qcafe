import nodemailer from "nodemailer";
import { env } from "@/config/env";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendMail(options: { to: string; subject: string; html: string; text?: string }) {
  const fromName = env.SMTP_FROM_NAME ?? env.APP_NAME;
  const fromEmail = env.SMTP_FROM_EMAIL ?? env.SMTP_USER;

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
