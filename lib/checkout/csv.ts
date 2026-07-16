import type { Order } from "@/lib/checkout/types";

const headers = [
  "order_id",
  "paid_at",
  "customer_name",
  "customer_email",
  "customer_country",
  "customer_document_type",
  "customer_document",
  "customer_postal_code",
  "product_name",
  "amount",
  "currency",
  "exchange_rate_used",
  "gateway",
  "gateway_payment_id",
  "gateway_checkout_id",
  "fiscal_status"
];

const escapeCsv = (value: unknown) => {
  const raw = value === null || value === undefined ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
};

export function ordersToFiscalCsv(orders: Order[]) {
  const rows = orders.map((order) => [
    order.id,
    order.paid_at || "",
    order.customer_name,
    order.customer_email,
    order.customer_country,
    order.customer_document_type || "",
    order.customer_document || "",
    order.customer_postal_code || "",
    order.product_name,
    order.amount,
    order.currency,
    order.exchange_rate_used || "",
    order.gateway,
    order.gateway_payment_id || "",
    order.gateway_checkout_id || "",
    order.fiscal_status
  ]);

  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(","))
  ].join("\n");
}
