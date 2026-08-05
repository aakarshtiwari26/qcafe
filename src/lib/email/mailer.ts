import { sendMail } from "./transport";
import { otpEmail } from "./templates/otp";
import { welcomeEmail } from "./templates/welcome";
import { orderConfirmationEmail, orderStatusUpdateEmail } from "./templates/order";
import { env } from "@/config/env";
import type { OtpPurpose, OrderStatus } from "@/constants";
import type { IOrder } from "@/models";

export async function sendOtpEmail(to: string, purpose: OtpPurpose, code: string) {
  if (env.NODE_ENV !== "production") {
    // Local/dev convenience only — never logs the code in production.
    console.log(`[dev-otp] ${purpose} code for ${to}: ${code}`);
  }
  const { subject, html } = await otpEmail(purpose, code);
  await sendMail({ to, subject, html });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html } = await welcomeEmail(name);
  await sendMail({ to, subject, html });
}

export async function sendOrderConfirmationEmail(to: string, order: IOrder) {
  const { subject, html } = await orderConfirmationEmail(order);
  await sendMail({ to, subject, html });
}

export async function sendOrderStatusUpdateEmail(to: string, order: Pick<IOrder, "orderId">, status: OrderStatus) {
  const { subject, html } = await orderStatusUpdateEmail(order, status);
  await sendMail({ to, subject, html });
}
