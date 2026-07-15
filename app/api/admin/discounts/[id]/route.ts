import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { deleteDiscount, getDiscountById, saveDiscount } from "@/lib/checkout/db";
import type { Discount } from "@/lib/checkout/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const discountTypes: Discount["type"][] = ["percent", "fixed"];

function textValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: FormDataEntryValue | null) {
  const text = textValue(value);
  return text || null;
}

function numberValue(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function integerValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function discountType(value: string): Discount["type"] {
  return discountTypes.includes(value as Discount["type"])
    ? (value as Discount["type"])
    : "percent";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const discount = await getDiscountById(id);

  if (!discount) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
  }

  const formData = await request.formData();
  const action = textValue(formData.get("_action"));

  try {
    if (action === "delete") {
      await deleteDiscount(discount.id);
      return NextResponse.redirect(
        new URL("/admin/discounts?deleted=1", request.url),
        303
      );
    }

    await saveDiscount({
      id: discount.id,
      code: textValue(formData.get("code")),
      description: textValue(formData.get("description")),
      type: discountType(textValue(formData.get("type"))),
      value: numberValue(textValue(formData.get("value"))),
      currency: optionalText(formData.get("currency")),
      product_id: optionalText(formData.get("product_id")),
      active: formData.get("active") === "on",
      starts_at: optionalText(formData.get("starts_at")),
      expires_at: optionalText(formData.get("expires_at")),
      max_redemptions: integerValue(textValue(formData.get("max_redemptions")))
    });

    return NextResponse.redirect(
      new URL("/admin/discounts?updated=1", request.url),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "erro";
    return NextResponse.redirect(
      new URL(`/admin/discounts?error=${message}`, request.url),
      303
    );
  }
}
