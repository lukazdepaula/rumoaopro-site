import type { Metadata } from "next";
import CheckoutPage from "@/app/checkout/[slug]/page";
import { getProductBySlug } from "@/lib/checkout/products";

type EnglishCheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params
}: EnglishCheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return {
    title: product ? `Secure checkout - ${product.name}` : "Secure checkout",
    description: product?.description || "Secure RumoAoPro checkout."
  };
}

export default function EnglishCheckoutPage({ params }: EnglishCheckoutPageProps) {
  return CheckoutPage({
    params,
    searchParams: Promise.resolve({ locale: "en" })
  });
}
