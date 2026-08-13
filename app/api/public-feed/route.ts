import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { listPaidOrders } from "@/lib/checkout/db";
import { getProductById } from "@/lib/checkout/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hiddenCustomerPattern = /\b(lucas|humberto|teste|test)\b/i;

function firstName(value: string) {
  return value.trim().split(/\s+/)[0]?.slice(0, 28) || "";
}

function countryCode(value: string) {
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

function publicId(orderId: string) {
  return createHash("sha256").update(orderId).digest("hex").slice(0, 12);
}

export async function GET() {
  try {
    const orders = await listPaidOrders();
    const purchases = orders
      .filter((order) => {
        const product = getProductById(order.product_id);
        return Boolean(
          product?.active &&
            (product.type === "training_program" ||
              product.type === "subscription") &&
            order.gateway !== "mock" &&
            order.metadata.checkout_gateway_mode !== "sandbox" &&
            !hiddenCustomerPattern.test(order.customer_name) &&
            !hiddenCustomerPattern.test(order.product_name)
        );
      })
      .slice(0, 8)
      .flatMap((order) => {
        const product = getProductById(order.product_id);
        const name = firstName(order.customer_name);
        const country = countryCode(order.customer_country);
        if (!product || !name || !country) return [];

        return [
          {
            id: publicId(order.id),
            firstName: name,
            country,
            productName: product.name,
            productType: product.type
          }
        ];
      });

    return NextResponse.json(
      { purchases },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
        }
      }
    );
  } catch (error) {
    console.error("[public-feed]", error);
    return NextResponse.json(
      { purchases: [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  }
}
