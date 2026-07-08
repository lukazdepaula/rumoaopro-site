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

export type CheckoutCustomerInput = {
  productSlug: string;
  name: string;
  email: string;
  country: string;
  document?: string;
};
