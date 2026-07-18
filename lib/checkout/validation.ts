import type {
  CheckoutCustomerInput,
  CheckoutPaymentMethod,
  CustomerDocumentType
} from "@/lib/checkout/types";

export class CheckoutValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export type ValidCheckoutInput = {
  productSlug: string;
  name: string;
  email: string;
  country: string;
  documentType: CustomerDocumentType;
  document: string | null;
  postalCode: string;
  address: string;
  whatsapp: string;
  discountCode: string | null;
  paymentMethod: CheckoutPaymentMethod;
};

const normalizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const normalizeDiscountCode = (value: unknown) =>
  typeof value === "string"
    ? value.trim().toUpperCase().replace(/\s+/g, "")
    : "";

export const isBrazil = (country: string) =>
  country.trim().toUpperCase() === "BR" ||
  country.trim().toLowerCase() === "brasil" ||
  country.trim().toLowerCase() === "brazil";

export function normalizeCountry(country: string) {
  const normalized = country.trim().toUpperCase();
  return normalized === "BRASIL" || normalized === "BRAZIL" ? "BR" : normalized;
}

export function detectBrazilianDocument(
  document: string
): { type: "cpf" | "cnpj"; value: string } {
  const digits = onlyDigits(document);

  if (digits.length === 11) {
    return { type: "cpf", value: digits };
  }

  if (digits.length === 14) {
    return { type: "cnpj", value: digits };
  }

  throw new CheckoutValidationError(
    "Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.",
    "document"
  );
}

export function validateCheckoutInput(input: unknown): ValidCheckoutInput {
  const data = input as Partial<CheckoutCustomerInput>;
  const productSlug = normalizeText(data.productSlug);
  const name = normalizeText(data.name);
  const email = normalizeText(data.email).toLowerCase();
  const country = normalizeCountry(normalizeText(data.country));
  const address = normalizeText(data.address).replace(/\s+/g, " ");
  const whatsappDigits = onlyDigits(normalizeText(data.whatsapp));
  const rawPostalCode = normalizeText(data.postalCode);
  const discountCode = normalizeDiscountCode(data.discountCode);
  const requestedPaymentMethod = normalizeText(data.paymentMethod);

  if (!productSlug) {
    throw new CheckoutValidationError("Produto inválido.", "productSlug");
  }

  if (name.length < 3 || !name.includes(" ")) {
    throw new CheckoutValidationError(
      "Informe seu nome completo.",
      "name"
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CheckoutValidationError("Informe um e-mail válido.", "email");
  }

  if (!country || country.length < 2) {
    throw new CheckoutValidationError("Informe seu país.", "country");
  }

  if (address.length < 8 || address.length > 240) {
    throw new CheckoutValidationError(
      "Informe seu endereço completo, incluindo cidade e região/estado.",
      "address"
    );
  }

  if (whatsappDigits.length < 8 || whatsappDigits.length > 15) {
    throw new CheckoutValidationError(
      "Informe um WhatsApp válido com o código do país (DDI).",
      "whatsapp"
    );
  }

  if (isBrazil(country)) {
    const document = detectBrazilianDocument(normalizeText(data.document));
    const postalCode = onlyDigits(rawPostalCode);

    if (postalCode.length !== 8) {
      throw new CheckoutValidationError(
        "Informe um CEP com 8 dígitos.",
        "postalCode"
      );
    }

    const paymentMethod: CheckoutPaymentMethod =
      requestedPaymentMethod === "pix" ||
      requestedPaymentMethod === "stripe" ||
      requestedPaymentMethod === "mercado_pago"
        ? requestedPaymentMethod
        : "mercado_pago";

    return {
      productSlug,
      name,
      email,
      country: "BR",
      documentType: document.type,
      document: document.value,
      postalCode,
      address,
      whatsapp: `+${whatsappDigits}`,
      discountCode: discountCode || null,
      paymentMethod
    };
  }

  const postalCode = rawPostalCode.replace(/\s+/g, " ");
  if (postalCode.length < 3 || postalCode.length > 20) {
    throw new CheckoutValidationError(
      "Informe seu código postal.",
      "postalCode"
    );
  }

  return {
    productSlug,
    name,
    email,
    country,
    documentType: null,
    document: null,
    postalCode,
    address,
    whatsapp: `+${whatsappDigits}`,
    discountCode: discountCode || null,
    paymentMethod: "stripe"
  };
}
