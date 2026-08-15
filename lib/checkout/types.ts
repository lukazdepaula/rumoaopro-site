export type ProductType =
  | "training_program"
  | "pdf"
  | "coaching"
  | "subscription"
  | "other";

export type DeliveryType =
  | "member_area"
  | "pdf_download"
  | "onboarding_email"
  | "manual";

export type Gateway = "mock" | "mercado_pago" | "stripe";

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "checkout_click"
  | "checkout_view"
  | "checkout_submit"
  | "checkout_error"
  | "whatsapp_click";

export type MarketingAttributionInput = {
  consent?: "granted" | "denied";
  landingUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
};

export type AnalyticsEvent = {
  id: string;
  event_id: string;
  type: AnalyticsEventType;
  session_id: string;
  product_id: string;
  product_slug: string;
  locale: "pt" | "en";
  path: string;
  source_path: string | null;
  referrer_host: string | null;
  country: string | null;
  payment_method: CheckoutPaymentMethod | null;
  error_code: string | null;
  created_at: string;
};

export type CheckoutPaymentMethod = "mercado_pago" | "pix" | "stripe";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type DeliveryStatus =
  | "not_delivered"
  | "delivered"
  | "manual_required";

export type FiscalStatus = "pending" | "issued" | "not_required" | "error";

export type CustomerDocumentType = "cpf" | "cnpj" | "tax_id" | null;

export type AccessStatus = "active" | "revoked" | "expired";

export type MaterialType = "pdf" | "video" | "link" | "text" | "file";

export type DiscountType = "percent" | "fixed";

export type CheckoutProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  type: ProductType;
  base_price_usd: number;
  price_brl_estimated: number;
  price_brl: number;
  price_usd: number;
  active: boolean;
  sales_page_path: string;
  cover_image: string;
  delivery_type: DeliveryType;
  file_id: string | null;
  billing_interval?: "month";
  stripe_price_id?: string;
  checkout_country_lock?: "BR";
  checkout_payment_methods?: CheckoutPaymentMethod[];
  discounts_enabled?: boolean;
  trial_days?: number;
  team_limit?: number;
  players_per_team_limit?: number;
  founding_price_lock?: boolean;
  aliases?: string[];
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_country: string;
  customer_document_type: CustomerDocumentType;
  customer_document: string | null;
  customer_postal_code: string | null;
  customer_address: string | null;
  customer_whatsapp: string | null;
  gateway: Gateway;
  gateway_payment_id: string | null;
  gateway_checkout_id: string | null;
  amount: number;
  currency: string;
  exchange_rate_used: number | null;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  fiscal_status: FiscalStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

export type OrderLog = {
  id: string;
  order_id: string;
  type: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CustomerUser = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
};

export type Entitlement = {
  id: string;
  user_id: string;
  order_id: string | null;
  product_id: string;
  access_status: AccessStatus;
  granted_at: string;
  revoked_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
};

export type ProgramMaterial = {
  id: string;
  product_id: string;
  title: string;
  description: string;
  type: MaterialType;
  sort_order: number;
  is_active: boolean;
  file_path_private: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Discount = {
  id: string;
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  currency: string | null;
  product_id: string | null;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  max_redemptions: number | null;
  times_redeemed: number;
  created_at: string;
  updated_at: string;
};

export type CheckoutCustomerInput = {
  productSlug: string;
  name: string;
  email: string;
  country: string;
  document?: string;
  postalCode?: string;
  address?: string;
  whatsapp?: string;
  discountCode?: string;
  paymentMethod?: CheckoutPaymentMethod;
  locale?: "pt" | "en";
  marketing?: MarketingAttributionInput;
};
