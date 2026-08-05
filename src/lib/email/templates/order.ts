import { getSiteConfig } from "@/config/site";
import { emailLayout, emailButton } from "./layout";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/constants";
import type { IOrder } from "@/models";
import { formatCurrency } from "@/lib/utils/format";

function itemsTable(order: Pick<IOrder, "items">) {
  const rows = order.items
    .map(
      (item) => `<tr>
<td style="padding:8px 0;font-size:14px;color:#3f3f46;">${item.quantity} &times; ${item.name}</td>
<td style="padding:8px 0;font-size:14px;color:#3f3f46;text-align:right;">${formatCurrency(item.unitPrice * item.quantity)}</td>
</tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #ececec;border-bottom:1px solid #ececec;padding:4px 0;">${rows}</table>`;
}

export async function orderConfirmationEmail(order: IOrder) {
  const site = getSiteConfig();
  const html = await emailLayout(
    `<h1 style="margin:0 0 4px;font-size:20px;color:#18181b;">Order received</h1>
<p style="margin:0 0 4px;font-size:14px;color:#52525b;">Order <strong>${order.orderId}</strong> is confirmed and headed to the kitchen.</p>
${itemsTable(order)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:14px;color:#52525b;padding:2px 0;">Subtotal</td><td style="text-align:right;font-size:14px;color:#52525b;">${formatCurrency(order.subtotal)}</td></tr>
<tr><td style="font-size:14px;color:#52525b;padding:2px 0;">Delivery fee</td><td style="text-align:right;font-size:14px;color:#52525b;">${formatCurrency(order.deliveryFee)}</td></tr>
<tr><td style="font-size:14px;color:#52525b;padding:2px 0;">Tax</td><td style="text-align:right;font-size:14px;color:#52525b;">${formatCurrency(order.taxAmount)}</td></tr>
<tr><td style="font-size:16px;font-weight:700;color:#18181b;padding:8px 0 0;">Total</td><td style="text-align:right;font-size:16px;font-weight:700;color:#18181b;padding:8px 0 0;">${formatCurrency(order.total)}</td></tr>
</table>
${emailButton("Track your order", `${site.url}/orders/${order.orderId}`)}`,
    { preheader: `Order ${order.orderId} confirmed · ${formatCurrency(order.total)}` }
  );
  return { subject: `Order ${order.orderId} confirmed · ${site.name}`, html };
}

export async function orderStatusUpdateEmail(order: Pick<IOrder, "orderId">, status: OrderStatus) {
  const site = getSiteConfig();
  const label = ORDER_STATUS_LABELS[status];
  const html = await emailLayout(
    `<h1 style="margin:0 0 8px;font-size:20px;color:#18181b;">${label}</h1>
<p style="margin:0;font-size:14px;line-height:22px;color:#52525b;">Your order <strong>${order.orderId}</strong> is now <strong>${label}</strong>.</p>
${emailButton("View order status", `${site.url}/orders/${order.orderId}`)}`,
    { preheader: `Order ${order.orderId}: ${label}` }
  );
  return { subject: `Order ${order.orderId}: ${label} · ${site.name}`, html };
}
