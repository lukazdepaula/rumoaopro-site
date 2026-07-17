import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { checkoutProducts } from "@/lib/checkout/products";
import type {
  AccessStatus,
  CustomerUser,
  DeliveryStatus,
  Discount,
  Entitlement,
  FiscalStatus,
  Gateway,
  Order,
  OrderLog,
  OrderStatus,
  ProgramMaterial
} from "@/lib/checkout/types";

type SqliteResult = {
  changes: number;
  lastInsertRowid?: bigint | number;
};

type SqliteStatement = {
  run: (...args: unknown[]) => SqliteResult;
  get: (...args: unknown[]) => Record<string, unknown> | undefined;
  all: (...args: unknown[]) => Record<string, unknown>[];
};

type SqliteDatabase = {
  exec: (sql: string) => void;
  prepare: (sql: string) => SqliteStatement;
};

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (filename: string) => SqliteDatabase;
};

let database: SqliteDatabase | null = null;

const nowIso = () => new Date().toISOString();

function databasePath() {
  return (
    process.env.CHECKOUT_DB_PATH ||
    path.join(process.cwd(), ".data", "rumoaopro.sqlite")
  );
}

function getDatabase() {
  if (database) return database;

  const filename = databasePath();
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  database = new DatabaseSync(filename);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  migrate(database);
  seedProducts(database);
  removeDefaultProgramMaterials(database);

  return database;
}

function ensureColumn(
  db: SqliteDatabase,
  table: string,
  column: string,
  definition: string
) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((row) => String(row.name) === column);

  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

function migrate(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'English',
      type TEXT NOT NULL,
      base_price_usd REAL NOT NULL DEFAULT 40,
      price_brl_estimated REAL NOT NULL DEFAULT 0,
      price_brl REAL NOT NULL,
      price_usd REAL NOT NULL,
      active INTEGER NOT NULL,
      sales_page_path TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      delivery_type TEXT NOT NULL,
      file_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_country TEXT NOT NULL,
      customer_document_type TEXT,
      customer_document TEXT,
      gateway TEXT NOT NULL,
      gateway_payment_id TEXT,
      gateway_checkout_id TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      exchange_rate_used REAL,
      status TEXT NOT NULL,
      delivery_status TEXT NOT NULL,
      fiscal_status TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      paid_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_gateway ON orders(gateway);
    CREATE INDEX IF NOT EXISTS idx_orders_country ON orders(customer_country);
    CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(gateway_payment_id);
    CREATE INDEX IF NOT EXISTS idx_orders_checkout ON orders(gateway_checkout_id);

    CREATE TABLE IF NOT EXISTS discounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL,
      value REAL NOT NULL,
      currency TEXT,
      product_id TEXT,
      active INTEGER NOT NULL,
      starts_at TEXT,
      expires_at TEXT,
      max_redemptions INTEGER,
      times_redeemed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
    CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(active);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_login_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_accounts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      password_updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);

    CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_hash
      ON admin_password_reset_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_email
      ON admin_password_reset_tokens(email);

    CREATE TABLE IF NOT EXISTS entitlements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT,
      product_id TEXT NOT NULL,
      access_status TEXT NOT NULL,
      granted_at TEXT NOT NULL,
      revoked_at TEXT,
      expires_at TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      UNIQUE(user_id, product_id)
    );

    CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);
    CREATE INDEX IF NOT EXISTS idx_entitlements_product ON entitlements(product_id);
    CREATE INDEX IF NOT EXISTS idx_entitlements_status ON entitlements(access_status);

    CREATE TABLE IF NOT EXISTS program_materials (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_active INTEGER NOT NULL,
      file_path_private TEXT,
      external_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      event_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(provider, event_id)
    );

    CREATE TABLE IF NOT EXISTS order_logs (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);

  ensureColumn(db, "products", "language", "language TEXT NOT NULL DEFAULT 'English'");
  ensureColumn(db, "products", "base_price_usd", "base_price_usd REAL NOT NULL DEFAULT 40");
  ensureColumn(db, "products", "price_brl_estimated", "price_brl_estimated REAL NOT NULL DEFAULT 0");
  ensureColumn(db, "products", "sales_page_path", "sales_page_path TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "products", "cover_image", "cover_image TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "orders", "user_id", "user_id TEXT");
  ensureColumn(db, "orders", "exchange_rate_used", "exchange_rate_used REAL");
  db.exec("CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);");
}

function seedProducts(db: SqliteDatabase) {
  const statement = db.prepare(`
    INSERT INTO products (
      id, name, slug, description, language, type, base_price_usd,
      price_brl_estimated, price_brl, price_usd, active, sales_page_path,
      cover_image, delivery_type, file_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      language = excluded.language,
      type = excluded.type,
      base_price_usd = excluded.base_price_usd,
      price_brl_estimated = excluded.price_brl_estimated,
      price_brl = excluded.price_brl,
      price_usd = excluded.price_usd,
      active = excluded.active,
      sales_page_path = excluded.sales_page_path,
      cover_image = excluded.cover_image,
      delivery_type = excluded.delivery_type,
      file_id = excluded.file_id,
      updated_at = excluded.updated_at
  `);

  for (const product of checkoutProducts) {
    statement.run(
      product.id,
      product.name,
      product.slug,
      product.description,
      product.language,
      product.type,
      product.base_price_usd,
      product.price_brl_estimated,
      product.price_brl,
      product.price_usd,
      product.active ? 1 : 0,
      product.sales_page_path,
      product.cover_image,
      product.delivery_type,
      product.file_id,
      product.created_at,
      product.updated_at
    );
  }
}

const defaultProgramMaterialSuffixes = ["overview", "main_material", "support"];

function defaultProgramMaterialIds() {
  return checkoutProducts.flatMap((product) =>
    defaultProgramMaterialSuffixes.map((suffix) => `${product.id}_${suffix}`)
  );
}

function removeDefaultProgramMaterials(db: SqliteDatabase) {
  const ids = defaultProgramMaterialIds();
  if (ids.length === 0) return;

  const placeholders = ids.map(() => "?").join(", ");
  db.prepare(`DELETE FROM program_materials WHERE id IN (${placeholders})`).run(
    ...ids
  );
}

function parseMetadata(value: unknown) {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  if (typeof value !== "string") return {};

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function normalizeOrder(row: Record<string, unknown>): Order {
  const metadata = parseMetadata(row.metadata);
  const metadataPostalCode = metadata.customer_postal_code;
  const customerPostalCode =
    row.customer_postal_code === null || row.customer_postal_code === undefined
      ? typeof metadataPostalCode === "string"
        ? metadataPostalCode
        : null
      : String(row.customer_postal_code);

  return {
    id: String(row.id),
    product_id: String(row.product_id),
    product_name: String(row.product_name),
    user_id: row.user_id === null || row.user_id === undefined ? null : String(row.user_id),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    customer_country: String(row.customer_country),
    customer_document_type:
      row.customer_document_type === null || row.customer_document_type === undefined
        ? null
        : (String(row.customer_document_type) as Order["customer_document_type"]),
    customer_document:
      row.customer_document === null || row.customer_document === undefined
        ? null
        : String(row.customer_document),
    customer_postal_code: customerPostalCode,
    gateway: String(row.gateway) as Gateway,
    gateway_payment_id:
      row.gateway_payment_id === null ? null : String(row.gateway_payment_id),
    gateway_checkout_id:
      row.gateway_checkout_id === null ? null : String(row.gateway_checkout_id),
    amount: Number(row.amount),
    currency: String(row.currency),
    exchange_rate_used:
      row.exchange_rate_used === null || row.exchange_rate_used === undefined
        ? null
        : Number(row.exchange_rate_used),
    status: String(row.status) as OrderStatus,
    delivery_status: String(row.delivery_status) as DeliveryStatus,
    fiscal_status: String(row.fiscal_status) as FiscalStatus,
    metadata,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    paid_at: row.paid_at === null ? null : String(row.paid_at)
  };
}

function isAdminDeletedOrder(order: Order) {
  return (
    order.metadata.admin_deleted === true ||
    order.metadata.admin_deleted === "true"
  );
}

function normalizeVisibleOrder(row: Record<string, unknown>) {
  const order = normalizeOrder(row);
  return isAdminDeletedOrder(order) ? null : order;
}

function normalizeUser(row: Record<string, unknown>): CustomerUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name === null ? null : String(row.name),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export type AdminAccountRecord = {
  id: string;
  email: string;
  password_hash: string;
  active: boolean;
  password_updated_at: string;
  created_at: string;
  updated_at: string;
};

function normalizeAdminAccount(row: Record<string, unknown>): AdminAccountRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    password_hash: String(row.password_hash),
    active:
      typeof row.active === "boolean" ? row.active : Number(row.active) === 1,
    password_updated_at: String(row.password_updated_at),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function normalizeEntitlement(row: Record<string, unknown>): Entitlement {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    order_id: row.order_id === null ? null : String(row.order_id),
    product_id: String(row.product_id),
    access_status: String(row.access_status) as AccessStatus,
    granted_at: String(row.granted_at),
    revoked_at: row.revoked_at === null ? null : String(row.revoked_at),
    expires_at: row.expires_at === null ? null : String(row.expires_at),
    metadata: parseMetadata(row.metadata)
  };
}

function normalizeMaterial(row: Record<string, unknown>): ProgramMaterial {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    title: String(row.title),
    description: String(row.description),
    type: String(row.type) as ProgramMaterial["type"],
    sort_order: Number(row.sort_order),
    is_active: Boolean(row.is_active),
    file_path_private:
      row.file_path_private === null ? null : String(row.file_path_private),
    external_url: row.external_url === null ? null : String(row.external_url),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function normalizeDiscount(row: Record<string, unknown>): Discount {
  return {
    id: String(row.id),
    code: String(row.code),
    description: String(row.description || ""),
    type: String(row.type) as Discount["type"],
    value: Number(row.value),
    currency: row.currency === null || row.currency === undefined ? null : String(row.currency),
    product_id:
      row.product_id === null || row.product_id === undefined
        ? null
        : String(row.product_id),
    active:
      typeof row.active === "boolean" ? row.active : Number(row.active) === 1,
    starts_at:
      row.starts_at === null || row.starts_at === undefined
        ? null
        : String(row.starts_at),
    expires_at:
      row.expires_at === null || row.expires_at === undefined
        ? null
        : String(row.expires_at),
    max_redemptions:
      row.max_redemptions === null || row.max_redemptions === undefined
        ? null
        : Number(row.max_redemptions),
    times_redeemed: Number(row.times_redeemed || 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function normalizeLog(row: Record<string, unknown>): OrderLog {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    type: String(row.type),
    message: String(row.message),
    metadata: parseMetadata(row.metadata),
    created_at: String(row.created_at)
  };
}

function useSupabaseDriver() {
  return (
    process.env.CHECKOUT_DB_DRIVER === "postgres" ||
    process.env.CHECKOUT_DB_DRIVER === "supabase"
  );
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para usar CHECKOUT_DB_DRIVER=postgres."
    );
  }

  return {
    key,
    url: url.replace(/\/$/, "")
  };
}

type SupabaseRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: string;
  body?: unknown;
  prefer?: string;
  allowConflict?: boolean;
};

async function supabaseRequest<T>(
  table: string,
  options: SupabaseRequestOptions = {}
): Promise<T> {
  const config = supabaseConfig();
  const query = options.query ? `?${options.query}` : "";
  const response = await fetch(`${config.url}/rest/v1/${table}${query}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store"
  });

  if (options.allowConflict && response.status === 409) {
    return [] as T;
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `Supabase ${table} ${options.method || "GET"} failed: ${response.status} ${message}`
    );
  }

  if (response.status === 204) {
    return [] as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ([] as T);
}

function eq(column: string, value: string) {
  return `${column}=eq.${encodeURIComponent(value)}`;
}

function selectQuery(parts: string[] = []) {
  return ["select=*", ...parts].join("&");
}

function jsonMetadata(value?: Record<string, unknown>) {
  return value || {};
}

function encodeProduct(product: (typeof checkoutProducts)[number]) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    language: product.language,
    type: product.type,
    base_price_usd: product.base_price_usd,
    price_brl_estimated: product.price_brl_estimated,
    price_brl: product.price_brl,
    price_usd: product.price_usd,
    active: product.active,
    sales_page_path: product.sales_page_path,
    cover_image: product.cover_image,
    delivery_type: product.delivery_type,
    file_id: product.file_id,
    created_at: product.created_at,
    updated_at: product.updated_at
  };
}

function encodeDiscount(discount: Discount) {
  return {
    id: discount.id,
    code: discount.code,
    description: discount.description,
    type: discount.type,
    value: discount.value,
    currency: discount.currency,
    product_id: discount.product_id,
    active: discount.active,
    starts_at: discount.starts_at,
    expires_at: discount.expires_at,
    max_redemptions: discount.max_redemptions,
    times_redeemed: discount.times_redeemed,
    created_at: discount.created_at,
    updated_at: discount.updated_at
  };
}

let supabaseSeeded = false;

async function removeSupabaseDefaultProgramMaterials() {
  const ids = defaultProgramMaterialIds();
  if (ids.length === 0) return;

  await supabaseRequest("program_materials", {
    method: "DELETE",
    query: `id=in.(${ids.map(encodeURIComponent).join(",")})`,
    prefer: "return=minimal"
  });
}

async function ensureSupabaseSeeded() {
  if (!useSupabaseDriver() || supabaseSeeded) return;

  await supabaseRequest("products", {
    method: "POST",
    query: "on_conflict=id",
    body: checkoutProducts.map(encodeProduct),
    prefer: "resolution=merge-duplicates,return=minimal"
  });

  await removeSupabaseDefaultProgramMaterials();

  supabaseSeeded = true;
}

function normalizeDiscountCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function listDiscounts() {
  if (useSupabaseDriver()) {
    return (
      await supabaseRequest<Record<string, unknown>[]>("discounts", {
        query: selectQuery(["order=created_at.desc"])
      })
    ).map(normalizeDiscount);
  }

  return getDatabase()
    .prepare("SELECT * FROM discounts ORDER BY created_at DESC")
    .all()
    .map(normalizeDiscount);
}

export async function getDiscountById(id: string) {
  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("discounts", {
      query: selectQuery([eq("id", id), "limit=1"])
    });
    return rows[0] ? normalizeDiscount(rows[0]) : null;
  }

  const row = getDatabase().prepare("SELECT * FROM discounts WHERE id = ?").get(id);
  return row ? normalizeDiscount(row) : null;
}

export async function getDiscountByCode(code: string) {
  const normalizedCode = normalizeDiscountCode(code);
  if (!normalizedCode) return null;

  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("discounts", {
      query: selectQuery([eq("code", normalizedCode), "limit=1"])
    });
    return rows[0] ? normalizeDiscount(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM discounts WHERE code = ?")
    .get(normalizedCode);
  return row ? normalizeDiscount(row) : null;
}

export type SaveDiscountInput = {
  id?: string;
  code: string;
  description?: string;
  type: Discount["type"];
  value: number;
  currency?: string | null;
  product_id?: string | null;
  active: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  max_redemptions?: number | null;
};

export async function saveDiscount(input: SaveDiscountInput) {
  const id = input.id || randomUUID();
  const existing = input.id ? await getDiscountById(input.id) : null;
  const timestamp = nowIso();
  const discount: Discount = {
    id,
    code: normalizeDiscountCode(input.code),
    description: input.description?.trim() || "",
    type: input.type,
    value: input.value,
    currency: input.type === "fixed" ? input.currency || "USD" : null,
    product_id: input.product_id || null,
    active: input.active,
    starts_at: input.starts_at || null,
    expires_at: input.expires_at || null,
    max_redemptions: input.max_redemptions ?? null,
    times_redeemed: existing?.times_redeemed || 0,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp
  };

  if (!discount.code) {
    throw new Error("Informe um código de desconto.");
  }

  if (discount.value <= 0 || !Number.isFinite(discount.value)) {
    throw new Error("Informe um valor válido para o desconto.");
  }

  if (discount.type === "percent" && discount.value > 100) {
    throw new Error("Desconto percentual não pode passar de 100%.");
  }

  if (useSupabaseDriver()) {
    await supabaseRequest("discounts", {
      method: "POST",
      query: "on_conflict=id",
      body: encodeDiscount(discount),
      prefer: "resolution=merge-duplicates,return=minimal"
    });
    return getDiscountById(id);
  }

  getDatabase()
    .prepare(
      `INSERT INTO discounts (
        id, code, description, type, value, currency, product_id, active,
        starts_at, expires_at, max_redemptions, times_redeemed, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        description = excluded.description,
        type = excluded.type,
        value = excluded.value,
        currency = excluded.currency,
        product_id = excluded.product_id,
        active = excluded.active,
        starts_at = excluded.starts_at,
        expires_at = excluded.expires_at,
        max_redemptions = excluded.max_redemptions,
        updated_at = excluded.updated_at`
    )
    .run(
      discount.id,
      discount.code,
      discount.description,
      discount.type,
      discount.value,
      discount.currency,
      discount.product_id,
      discount.active ? 1 : 0,
      discount.starts_at,
      discount.expires_at,
      discount.max_redemptions,
      discount.times_redeemed,
      discount.created_at,
      discount.updated_at
    );

  return getDiscountById(id);
}

export async function deleteDiscount(id: string) {
  if (useSupabaseDriver()) {
    await supabaseRequest("discounts", {
      method: "DELETE",
      query: eq("id", id),
      prefer: "return=minimal"
    });
    return;
  }

  getDatabase().prepare("DELETE FROM discounts WHERE id = ?").run(id);
}

export async function incrementDiscountRedemption(id: string) {
  if (!id) return;

  if (useSupabaseDriver()) {
    const discount = await getDiscountById(id);
    if (!discount) return;

    await supabaseRequest("discounts", {
      method: "PATCH",
      query: eq("id", id),
      body: {
        times_redeemed: discount.times_redeemed + 1,
        updated_at: nowIso()
      },
      prefer: "return=minimal"
    });
    return;
  }

  getDatabase()
    .prepare(
      `UPDATE discounts
       SET times_redeemed = times_redeemed + 1, updated_at = ?
       WHERE id = ?`
    )
    .run(nowIso(), id);
}

export type CreateOrderInput = {
  product_id: string;
  product_name: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_country: string;
  customer_document_type: Order["customer_document_type"];
  customer_document: string | null;
  customer_postal_code?: string | null;
  gateway: Gateway;
  amount: number;
  currency: string;
  exchange_rate_used?: number | null;
  fiscal_status: FiscalStatus;
  metadata?: Record<string, unknown>;
};

export async function createOrder(input: CreateOrderInput) {
  const metadata = {
    ...(input.metadata || {}),
    ...(input.customer_postal_code
      ? { customer_postal_code: input.customer_postal_code }
      : {})
  };

  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const id = randomUUID();
    const createdAt = nowIso();
    const rows = await supabaseRequest<Record<string, unknown>[]>("orders", {
      method: "POST",
      body: {
        id,
        product_id: input.product_id,
        product_name: input.product_name,
        user_id: input.user_id || null,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_country: input.customer_country,
        customer_document_type: input.customer_document_type,
        customer_document: input.customer_document,
        gateway: input.gateway,
        amount: input.amount,
        currency: input.currency,
        exchange_rate_used: input.exchange_rate_used ?? null,
        status: "pending",
        delivery_status: "not_delivered",
        fiscal_status: input.fiscal_status,
        metadata: jsonMetadata(metadata),
        created_at: createdAt,
        updated_at: createdAt
      },
      prefer: "return=representation"
    });

    await appendOrderLog(id, "order.created", "Pedido criado como pending.", {
      gateway: input.gateway,
      amount: input.amount,
      currency: input.currency
    });

    return rows[0] ? normalizeOrder(rows[0]) : getOrderById(id);
  }

  const db = getDatabase();
  const id = randomUUID();
  const createdAt = nowIso();

  db.prepare(`
    INSERT INTO orders (
      id, product_id, product_name, user_id, customer_name, customer_email,
      customer_country, customer_document_type, customer_document,
      gateway, amount, currency, exchange_rate_used, status, delivery_status,
      fiscal_status, metadata, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.product_id,
    input.product_name,
    input.user_id || null,
    input.customer_name,
    input.customer_email,
    input.customer_country,
    input.customer_document_type,
    input.customer_document,
    input.gateway,
    input.amount,
    input.currency,
    input.exchange_rate_used ?? null,
    "pending",
    "not_delivered",
    input.fiscal_status,
    JSON.stringify(metadata),
    createdAt,
    createdAt
  );

  await appendOrderLog(id, "order.created", "Pedido criado como pending.", {
    gateway: input.gateway,
    amount: input.amount,
    currency: input.currency
  });

  return getOrderById(id);
}

export async function getOrderById(id: string) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const rows = await supabaseRequest<Record<string, unknown>[]>("orders", {
      query: selectQuery([eq("id", id), "limit=1"])
    });
    return rows[0] ? normalizeVisibleOrder(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(id);
  return row ? normalizeVisibleOrder(row) : null;
}

export async function getOrderByGatewayPaymentId(gateway: Gateway, paymentId: string) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const rows = await supabaseRequest<Record<string, unknown>[]>("orders", {
      query: selectQuery([
        eq("gateway", gateway),
        eq("gateway_payment_id", paymentId),
        "limit=1"
      ])
    });
    return rows[0] ? normalizeVisibleOrder(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare(
      "SELECT * FROM orders WHERE gateway = ? AND gateway_payment_id = ?"
    )
    .get(gateway, paymentId);
  return row ? normalizeVisibleOrder(row) : null;
}

export async function getOrderByGatewayCheckoutId(gateway: Gateway, checkoutId: string) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const rows = await supabaseRequest<Record<string, unknown>[]>("orders", {
      query: selectQuery([
        eq("gateway", gateway),
        eq("gateway_checkout_id", checkoutId),
        "limit=1"
      ])
    });
    return rows[0] ? normalizeVisibleOrder(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare(
      "SELECT * FROM orders WHERE gateway = ? AND gateway_checkout_id = ?"
    )
    .get(gateway, checkoutId);
  return row ? normalizeVisibleOrder(row) : null;
}

export async function updateOrderGatewayIds(
  orderId: string,
  input: {
    gateway_payment_id?: string | null;
    gateway_checkout_id?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const order = await getOrderById(orderId);
  const metadata = {
    ...(order?.metadata || {}),
    ...(input.metadata || {})
  };

  if (useSupabaseDriver()) {
    await supabaseRequest("orders", {
      method: "PATCH",
      query: eq("id", orderId),
      body: {
        ...(input.gateway_payment_id === undefined
          ? {}
          : { gateway_payment_id: input.gateway_payment_id }),
        ...(input.gateway_checkout_id === undefined
          ? {}
          : { gateway_checkout_id: input.gateway_checkout_id }),
        metadata,
        updated_at: nowIso()
      },
      prefer: "return=minimal"
    });
    return;
  }

  getDatabase()
    .prepare(
      `UPDATE orders
       SET gateway_payment_id = COALESCE(?, gateway_payment_id),
           gateway_checkout_id = COALESCE(?, gateway_checkout_id),
           metadata = ?,
           updated_at = ?
       WHERE id = ?`
    )
    .run(
      input.gateway_payment_id ?? null,
      input.gateway_checkout_id ?? null,
      JSON.stringify(metadata),
      nowIso(),
      orderId
    );
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  metadata?: Record<string, unknown>
) {
  const order = await getOrderById(orderId);
  const paidAt = status === "paid" && !order?.paid_at ? nowIso() : order?.paid_at;
  const shouldRedeemDiscount =
    status === "paid" &&
    order?.status !== "paid" &&
    typeof order?.metadata.discount_id === "string";
  const nextMetadata = {
    ...(order?.metadata || {}),
    ...(metadata || {}),
    ...(shouldRedeemDiscount ? { discount_redeemed_at: nowIso() } : {})
  };

  if (useSupabaseDriver()) {
    await supabaseRequest("orders", {
      method: "PATCH",
      query: eq("id", orderId),
      body: {
        status,
        paid_at: paidAt || null,
        metadata: nextMetadata,
        updated_at: nowIso()
      },
      prefer: "return=minimal"
    });

    await appendOrderLog(orderId, `order.${status}`, `Pedido atualizado para ${status}.`, {
      status
    });
    if (shouldRedeemDiscount) {
      await incrementDiscountRedemption(String(order.metadata.discount_id));
    }
    return;
  }

  getDatabase()
    .prepare(
      `UPDATE orders
       SET status = ?, paid_at = ?, metadata = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(status, paidAt || null, JSON.stringify(nextMetadata), nowIso(), orderId);

  await appendOrderLog(orderId, `order.${status}`, `Pedido atualizado para ${status}.`, {
    status
  });
  if (shouldRedeemDiscount) {
    await incrementDiscountRedemption(String(order.metadata.discount_id));
  }
}

export async function deleteOrder(orderId: string) {
  const order = await getOrderById(orderId);
  const deletedAt = nowIso();
  const metadata = {
    ...(order?.metadata || {}),
    admin_deleted: true,
    admin_deleted_at: deletedAt
  };

  if (useSupabaseDriver()) {
    await supabaseRequest("entitlements", {
      method: "DELETE",
      query: eq("order_id", orderId),
      prefer: "return=minimal"
    });
    await supabaseRequest("order_logs", {
      method: "DELETE",
      query: eq("order_id", orderId),
      prefer: "return=minimal"
    });
    await supabaseRequest("orders", {
      method: "PATCH",
      query: eq("id", orderId),
      body: {
        status: "cancelled",
        delivery_status: "not_delivered",
        metadata,
        updated_at: deletedAt
      },
      prefer: "return=minimal"
    });
    return;
  }

  const db = getDatabase();
  db.prepare("DELETE FROM entitlements WHERE order_id = ?").run(orderId);
  db.prepare("DELETE FROM order_logs WHERE order_id = ?").run(orderId);
  db.prepare(
    `UPDATE orders
     SET status = 'cancelled',
         delivery_status = 'not_delivered',
         metadata = ?,
         updated_at = ?
     WHERE id = ?`
  ).run(JSON.stringify(metadata), deletedAt, orderId);
}

export async function updateDeliveryStatus(
  orderId: string,
  deliveryStatus: DeliveryStatus,
  metadata?: Record<string, unknown>
) {
  const order = await getOrderById(orderId);
  const nextMetadata = {
    ...(order?.metadata || {}),
    ...(metadata || {})
  };

  if (useSupabaseDriver()) {
    await supabaseRequest("orders", {
      method: "PATCH",
      query: eq("id", orderId),
      body: {
        delivery_status: deliveryStatus,
        metadata: nextMetadata,
        updated_at: nowIso()
      },
      prefer: "return=minimal"
    });

    await appendOrderLog(
      orderId,
      `delivery.${deliveryStatus}`,
      `Entrega atualizada para ${deliveryStatus}.`,
      metadata
    );
    return;
  }

  getDatabase()
    .prepare(
      `UPDATE orders
       SET delivery_status = ?, metadata = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(deliveryStatus, JSON.stringify(nextMetadata), nowIso(), orderId);

  await appendOrderLog(
    orderId,
    `delivery.${deliveryStatus}`,
    `Entrega atualizada para ${deliveryStatus}.`,
    metadata
  );
}

export async function updateFiscalStatus(orderId: string, fiscalStatus: FiscalStatus) {
  if (useSupabaseDriver()) {
    await supabaseRequest("orders", {
      method: "PATCH",
      query: eq("id", orderId),
      body: {
        fiscal_status: fiscalStatus,
        updated_at: nowIso()
      },
      prefer: "return=minimal"
    });

    await appendOrderLog(orderId, `fiscal.${fiscalStatus}`, "Status fiscal atualizado.", {
      fiscalStatus
    });
    return;
  }

  getDatabase()
    .prepare("UPDATE orders SET fiscal_status = ?, updated_at = ? WHERE id = ?")
    .run(fiscalStatus, nowIso(), orderId);

  await appendOrderLog(orderId, `fiscal.${fiscalStatus}`, "Status fiscal atualizado.", {
    fiscalStatus
  });
}

export async function recordWebhookEvent(
  provider: Gateway,
  eventId: string,
  payload: Record<string, unknown>
) {
  if (useSupabaseDriver()) {
    const existing = await supabaseRequest<Record<string, unknown>[]>(
      "webhook_events",
      {
        query: selectQuery([
          eq("provider", provider),
          eq("event_id", eventId),
          "limit=1"
        ])
      }
    );

    if (existing.length > 0) {
      return false;
    }

    try {
      await supabaseRequest("webhook_events", {
        method: "POST",
        body: {
          id: randomUUID(),
          provider,
          event_id: eventId,
          payload,
          created_at: nowIso()
        },
        prefer: "return=minimal"
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("409")) {
        return false;
      }
      throw error;
    }
  }

  const result = getDatabase()
    .prepare(
      `INSERT OR IGNORE INTO webhook_events
       (id, provider, event_id, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      provider,
      eventId,
      JSON.stringify(payload),
      nowIso()
    );

  return result.changes > 0;
}

export async function appendOrderLog(
  orderId: string,
  type: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  if (useSupabaseDriver()) {
    await supabaseRequest("order_logs", {
      method: "POST",
      body: {
        id: randomUUID(),
        order_id: orderId,
        type,
        message,
        metadata: jsonMetadata(metadata),
        created_at: nowIso()
      },
      prefer: "return=minimal"
    });
    return;
  }

  getDatabase()
    .prepare(
      `INSERT INTO order_logs
       (id, order_id, type, message, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      orderId,
      type,
      message,
      JSON.stringify(metadata || {}),
      nowIso()
    );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getUserById(id: string) {
  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("users", {
      query: selectQuery([eq("id", id), "limit=1"])
    });
    return rows[0] ? normalizeUser(rows[0]) : null;
  }

  const row = getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? normalizeUser(row) : null;
}

export async function getUserByEmail(email: string) {
  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("users", {
      query: selectQuery([eq("email", normalizeEmail(email)), "limit=1"])
    });
    return rows[0] ? normalizeUser(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalizeEmail(email));
  return row ? normalizeUser(row) : null;
}

export async function getOrCreateUserByEmail(email: string, name?: string | null) {
  if (useSupabaseDriver()) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await getUserByEmail(normalizedEmail);
    const updatedAt = nowIso();

    if (existing) {
      if (name && !existing.name) {
        await supabaseRequest("users", {
          method: "PATCH",
          query: eq("id", existing.id),
          body: {
            name,
            updated_at: updatedAt
          },
          prefer: "return=minimal"
        });
        return getUserById(existing.id);
      }

      return existing;
    }

    const id = randomUUID();
    const rows = await supabaseRequest<Record<string, unknown>[]>("users", {
      method: "POST",
      body: {
        id,
        email: normalizedEmail,
        name: name || null,
        created_at: updatedAt,
        updated_at: updatedAt
      },
      prefer: "return=representation",
      allowConflict: true
    });

    return rows[0] ? normalizeUser(rows[0]) : getUserByEmail(normalizedEmail);
  }

  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const existing = await getUserByEmail(normalizedEmail);
  const updatedAt = nowIso();

  if (existing) {
    if (name && !existing.name) {
      db.prepare("UPDATE users SET name = ?, updated_at = ? WHERE id = ?").run(
        name,
        updatedAt,
        existing.id
      );
      return getUserById(existing.id);
    }

    return existing;
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, normalizedEmail, name || null, updatedAt, updatedAt);

  return getUserById(id);
}

export async function getAdminAccountByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("admin_accounts", {
      query: selectQuery([eq("email", normalizedEmail), "limit=1"])
    });
    return rows[0] ? normalizeAdminAccount(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM admin_accounts WHERE email = ? LIMIT 1")
    .get(normalizedEmail);
  return row ? normalizeAdminAccount(row) : null;
}

export async function saveAdminAccountPassword(
  email: string,
  passwordHash: string
) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await getAdminAccountByEmail(normalizedEmail);
  const timestamp = nowIso();
  const account: AdminAccountRecord = {
    id: existing?.id || randomUUID(),
    email: normalizedEmail,
    password_hash: passwordHash,
    active: true,
    password_updated_at: timestamp,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp
  };

  if (useSupabaseDriver()) {
    await supabaseRequest("admin_accounts", {
      method: "POST",
      query: "on_conflict=email",
      body: account,
      prefer: "resolution=merge-duplicates,return=minimal"
    });
    return getAdminAccountByEmail(normalizedEmail);
  }

  getDatabase()
    .prepare(
      `INSERT INTO admin_accounts (
        id, email, password_hash, active, password_updated_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        active = 1,
        password_updated_at = excluded.password_updated_at,
        updated_at = excluded.updated_at`
    )
    .run(
      account.id,
      account.email,
      account.password_hash,
      1,
      account.password_updated_at,
      account.created_at,
      account.updated_at
    );

  return getAdminAccountByEmail(normalizedEmail);
}

export async function createAdminPasswordResetToken(input: {
  email: string;
  tokenHash: string;
  expiresAt: string;
}) {
  const email = normalizeEmail(input.email);
  const timestamp = nowIso();

  if (useSupabaseDriver()) {
    await supabaseRequest("admin_password_reset_tokens", {
      method: "PATCH",
      query: `${eq("email", email)}&used_at=is.null`,
      body: { used_at: timestamp },
      prefer: "return=minimal"
    });
    await supabaseRequest("admin_password_reset_tokens", {
      method: "POST",
      body: {
        id: randomUUID(),
        email,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
        created_at: timestamp
      },
      prefer: "return=minimal"
    });
    return;
  }

  const db = getDatabase();
  db.prepare(
    "UPDATE admin_password_reset_tokens SET used_at = ? WHERE email = ? AND used_at IS NULL"
  ).run(timestamp, email);
  db.prepare(
    `INSERT INTO admin_password_reset_tokens
      (id, email, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(randomUUID(), email, input.tokenHash, input.expiresAt, timestamp);
}

export async function consumeAdminPasswordResetToken(tokenHash: string) {
  const timestamp = nowIso();

  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>(
      "admin_password_reset_tokens",
      {
        query: selectQuery([
          eq("token_hash", tokenHash),
          "used_at=is.null",
          `expires_at=gt.${encodeURIComponent(timestamp)}`,
          "limit=1"
        ])
      }
    );
    const row = rows[0];
    if (!row) return null;

    const consumedRows = await supabaseRequest<Record<string, unknown>[]>(
      "admin_password_reset_tokens",
      {
        method: "PATCH",
        query: `${eq("id", String(row.id))}&used_at=is.null`,
        body: { used_at: timestamp },
        prefer: "return=representation"
      }
    );
    return consumedRows.length > 0
      ? normalizeEmail(String(row.email))
      : null;
  }

  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT * FROM admin_password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
       LIMIT 1`
    )
    .get(tokenHash, timestamp);
  if (!row) return null;

  const result = db
    .prepare(
      "UPDATE admin_password_reset_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL"
    )
    .run(timestamp, String(row.id));

  return result.changes === 1 ? normalizeEmail(String(row.email)) : null;
}

export async function updateOrderUserId(orderId: string, userId: string) {
  if (useSupabaseDriver()) {
    await supabaseRequest("orders", {
      method: "PATCH",
      query: eq("id", orderId),
      body: {
        user_id: userId,
        updated_at: nowIso()
      },
      prefer: "return=minimal"
    });

    await appendOrderLog(orderId, "order.user_linked", "Pedido vinculado ao usuário.", {
      userId
    });
    return;
  }

  getDatabase()
    .prepare("UPDATE orders SET user_id = ?, updated_at = ? WHERE id = ?")
    .run(userId, nowIso(), orderId);

  await appendOrderLog(orderId, "order.user_linked", "Pedido vinculado ao usuário.", {
    userId
  });
}

export async function createCustomerLoginToken(email: string, name?: string | null) {
  const user = await getOrCreateUserByEmail(email, name);
  if (!user) return null;

  const token = randomUUID();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 20).toISOString();

  if (useSupabaseDriver()) {
    await supabaseRequest("customer_login_tokens", {
      method: "POST",
      body: {
        id: randomUUID(),
        user_id: user.id,
        token,
        expires_at: expiresAt,
        created_at: createdAt
      },
      prefer: "return=minimal"
    });

    return { token, user, expiresAt };
  }

  getDatabase()
    .prepare(
      `INSERT INTO customer_login_tokens
       (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(randomUUID(), user.id, token, expiresAt, createdAt);

  return { token, user, expiresAt };
}

export async function consumeCustomerLoginToken(token: string) {
  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>(
      "customer_login_tokens",
      {
        query: selectQuery([
          eq("token", token),
          `expires_at=gt.${encodeURIComponent(nowIso())}`,
          "limit=1"
        ])
      }
    );

    const row = rows[0];
    if (!row) return null;

    await supabaseRequest("customer_login_tokens", {
      method: "PATCH",
      query: eq("token", token),
      body: {
        used_at: nowIso()
      },
      prefer: "return=minimal"
    });

    return getUserById(String(row.user_id));
  }

  const row = getDatabase()
    .prepare(
      `SELECT * FROM customer_login_tokens
       WHERE token = ? AND expires_at > ?`
    )
    .get(token, nowIso());

  if (!row) return null;

  getDatabase()
    .prepare("UPDATE customer_login_tokens SET used_at = ? WHERE token = ?")
    .run(nowIso(), token);

  return getUserById(String(row.user_id));
}

export async function grantProductAccess(input: {
  user_id: string;
  order_id?: string | null;
  product_id: string;
  metadata?: Record<string, unknown>;
}) {
  const grantedAt = nowIso();

  if (useSupabaseDriver()) {
    await supabaseRequest("entitlements", {
      method: "POST",
      query: "on_conflict=user_id,product_id",
      body: {
        id: randomUUID(),
        user_id: input.user_id,
        order_id: input.order_id || null,
        product_id: input.product_id,
        access_status: "active",
        granted_at: grantedAt,
        revoked_at: null,
        expires_at: null,
        metadata: jsonMetadata(input.metadata)
      },
      prefer: "resolution=merge-duplicates,return=minimal"
    });

    if (input.order_id) {
      await appendOrderLog(input.order_id, "access.granted", "Acesso liberado ao produto.", {
        userId: input.user_id,
        productId: input.product_id
      });
    }

    return getActiveEntitlement(input.user_id, input.product_id);
  }

  getDatabase()
    .prepare(
      `INSERT INTO entitlements (
        id, user_id, order_id, product_id, access_status, granted_at,
        revoked_at, expires_at, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET
        order_id = excluded.order_id,
        access_status = 'active',
        granted_at = excluded.granted_at,
        revoked_at = NULL,
        expires_at = NULL,
        metadata = excluded.metadata`
    )
    .run(
      randomUUID(),
      input.user_id,
      input.order_id || null,
      input.product_id,
      "active",
      grantedAt,
      JSON.stringify(input.metadata || {})
    );

  if (input.order_id) {
    await appendOrderLog(input.order_id, "access.granted", "Acesso liberado ao produto.", {
      userId: input.user_id,
      productId: input.product_id
    });
  }

  return getActiveEntitlement(input.user_id, input.product_id);
}

export async function revokeProductAccess(entitlementId: string) {
  if (useSupabaseDriver()) {
    await supabaseRequest("entitlements", {
      method: "PATCH",
      query: eq("id", entitlementId),
      body: {
        access_status: "revoked",
        revoked_at: nowIso()
      },
      prefer: "return=minimal"
    });

    return getEntitlementById(entitlementId);
  }

  getDatabase()
    .prepare(
      `UPDATE entitlements
       SET access_status = 'revoked', revoked_at = ?
       WHERE id = ?`
    )
    .run(nowIso(), entitlementId);

  return getEntitlementById(entitlementId);
}

export async function revokeProductAccessByOrder(orderId: string) {
  if (useSupabaseDriver()) {
    await supabaseRequest("entitlements", {
      method: "PATCH",
      query: [eq("order_id", orderId), eq("access_status", "active")].join("&"),
      body: {
        access_status: "revoked",
        revoked_at: nowIso()
      },
      prefer: "return=minimal"
    });
    return;
  }

  getDatabase()
    .prepare(
      `UPDATE entitlements
       SET access_status = 'revoked', revoked_at = ?
       WHERE order_id = ? AND access_status = 'active'`
    )
    .run(nowIso(), orderId);
}

export async function getEntitlementById(id: string) {
  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("entitlements", {
      query: selectQuery([eq("id", id), "limit=1"])
    });
    return rows[0] ? normalizeEntitlement(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM entitlements WHERE id = ?")
    .get(id);
  return row ? normalizeEntitlement(row) : null;
}

export async function getActiveEntitlement(userId: string, productId: string) {
  if (useSupabaseDriver()) {
    const rows = await supabaseRequest<Record<string, unknown>[]>("entitlements", {
      query: selectQuery([
        eq("user_id", userId),
        eq("product_id", productId),
        eq("access_status", "active"),
        `or=(expires_at.is.null,expires_at.gt.${encodeURIComponent(nowIso())})`,
        "limit=1"
      ])
    });
    return rows[0] ? normalizeEntitlement(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare(
      `SELECT * FROM entitlements
       WHERE user_id = ? AND product_id = ? AND access_status = 'active'
       AND (expires_at IS NULL OR expires_at > ?)`
    )
    .get(userId, productId, nowIso());

  return row ? normalizeEntitlement(row) : null;
}

export async function userHasAccessToProduct(userId: string, productId: string) {
  return Boolean(await getActiveEntitlement(userId, productId));
}

export async function getUserPrograms(userId: string) {
  const entitlements = useSupabaseDriver()
    ? (await supabaseRequest<Record<string, unknown>[]>("entitlements", {
        query: selectQuery([
          eq("user_id", userId),
          eq("access_status", "active"),
          `or=(expires_at.is.null,expires_at.gt.${encodeURIComponent(nowIso())})`,
          "order=granted_at.desc"
        ])
      })).map(normalizeEntitlement)
    : getDatabase()
    .prepare(
      `SELECT * FROM entitlements
       WHERE user_id = ? AND access_status = 'active'
       AND (expires_at IS NULL OR expires_at > ?)
       ORDER BY granted_at DESC`
    )
    .all(userId, nowIso())
    .map(normalizeEntitlement);

  return entitlements
    .map((entitlement) => {
      const product = checkoutProducts.find(
        (candidate) => candidate.id === entitlement.product_id
      );

      return product ? { entitlement, product } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function listEntitlements() {
  if (useSupabaseDriver()) {
    return (
      await supabaseRequest<Record<string, unknown>[]>("entitlements", {
        query: selectQuery(["order=granted_at.desc", "limit=500"])
      })
    ).map(normalizeEntitlement);
  }

  return getDatabase()
    .prepare("SELECT * FROM entitlements ORDER BY granted_at DESC LIMIT 500")
    .all()
    .map(normalizeEntitlement);
}

export async function getMaterialsByProductId(productId: string) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    return (
      await supabaseRequest<Record<string, unknown>[]>("program_materials", {
        query: selectQuery([
          eq("product_id", productId),
          "is_active=eq.true",
          "order=sort_order.asc"
        ])
      })
    ).map(normalizeMaterial);
  }

  return getDatabase()
    .prepare(
      `SELECT * FROM program_materials
       WHERE product_id = ? AND is_active = 1
       ORDER BY sort_order ASC`
    )
    .all(productId)
    .map(normalizeMaterial);
}

export async function listMaterialsByProductId(
  productId: string,
  options: { includeInactive?: boolean } = {}
) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const parts = [eq("product_id", productId), "order=sort_order.asc"];
    if (!options.includeInactive) {
      parts.push("is_active=eq.true");
    }

    return (
      await supabaseRequest<Record<string, unknown>[]>("program_materials", {
        query: selectQuery(parts)
      })
    ).map(normalizeMaterial);
  }

  const activeClause = options.includeInactive ? "" : "AND is_active = 1";
  return getDatabase()
    .prepare(
      `SELECT * FROM program_materials
       WHERE product_id = ? ${activeClause}
       ORDER BY sort_order ASC`
    )
    .all(productId)
    .map(normalizeMaterial);
}

export async function getMaterialById(id: string) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const rows = await supabaseRequest<Record<string, unknown>[]>(
      "program_materials",
      {
        query: selectQuery([eq("id", id), "is_active=eq.true", "limit=1"])
      }
    );
    return rows[0] ? normalizeMaterial(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM program_materials WHERE id = ? AND is_active = 1")
    .get(id);

  return row ? normalizeMaterial(row) : null;
}

export async function getMaterialByIdForAdmin(id: string) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const rows = await supabaseRequest<Record<string, unknown>[]>(
      "program_materials",
      {
        query: selectQuery([eq("id", id), "limit=1"])
      }
    );
    return rows[0] ? normalizeMaterial(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM program_materials WHERE id = ?")
    .get(id);

  return row ? normalizeMaterial(row) : null;
}

export type SaveProgramMaterialInput = {
  id?: string;
  product_id: string;
  title: string;
  description: string;
  type: ProgramMaterial["type"];
  sort_order: number;
  is_active: boolean;
  file_path_private?: string | null;
  external_url?: string | null;
};

export async function saveProgramMaterial(input: SaveProgramMaterialInput) {
  const id = input.id || randomUUID();
  const existing = input.id ? await getMaterialByIdForAdmin(input.id) : null;
  const timestamp = nowIso();
  const material = {
    id,
    product_id: input.product_id,
    title: input.title,
    description: input.description,
    type: input.type,
    sort_order: input.sort_order,
    is_active: input.is_active,
    file_path_private:
      input.file_path_private === undefined
        ? existing?.file_path_private ?? null
        : input.file_path_private,
    external_url:
      input.external_url === undefined
        ? existing?.external_url ?? null
        : input.external_url,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp
  };

  if (useSupabaseDriver()) {
    await supabaseRequest("program_materials", {
      method: "POST",
      query: "on_conflict=id",
      body: material,
      prefer: "resolution=merge-duplicates,return=minimal"
    });
    return getMaterialByIdForAdmin(id);
  }

  getDatabase()
    .prepare(
      `INSERT INTO program_materials (
        id, product_id, title, description, type, sort_order, is_active,
        file_path_private, external_url, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        product_id = excluded.product_id,
        title = excluded.title,
        description = excluded.description,
        type = excluded.type,
        sort_order = excluded.sort_order,
        is_active = excluded.is_active,
        file_path_private = excluded.file_path_private,
        external_url = excluded.external_url,
        updated_at = excluded.updated_at`
    )
    .run(
      material.id,
      material.product_id,
      material.title,
      material.description,
      material.type,
      material.sort_order,
      material.is_active ? 1 : 0,
      material.file_path_private,
      material.external_url,
      material.created_at,
      material.updated_at
    );

  return getMaterialByIdForAdmin(id);
}

export async function deleteProgramMaterial(id: string) {
  if (useSupabaseDriver()) {
    await supabaseRequest("program_materials", {
      method: "DELETE",
      query: eq("id", id),
      prefer: "return=minimal"
    });
    return;
  }

  getDatabase().prepare("DELETE FROM program_materials WHERE id = ?").run(id);
}

export type OrderFilters = {
  status?: string;
  gateway?: string;
  country?: string;
  product?: string;
};

export async function listOrders(filters: OrderFilters = {}) {
  if (useSupabaseDriver()) {
    await ensureSupabaseSeeded();
    const parts = ["order=created_at.desc", "limit=500"];

    if (filters.status) parts.push(eq("status", filters.status));
    if (filters.gateway) parts.push(eq("gateway", filters.gateway));
    if (filters.country) parts.push(eq("customer_country", filters.country));
    if (filters.product) parts.push(eq("product_id", filters.product));

    return (
      await supabaseRequest<Record<string, unknown>[]>("orders", {
        query: selectQuery(parts)
      })
    )
      .map(normalizeOrder)
      .filter((order) => !isAdminDeletedOrder(order));
  }

  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.status) {
    conditions.push("status = ?");
    values.push(filters.status);
  }

  if (filters.gateway) {
    conditions.push("gateway = ?");
    values.push(filters.gateway);
  }

  if (filters.country) {
    conditions.push("customer_country = ?");
    values.push(filters.country);
  }

  if (filters.product) {
    conditions.push("product_id = ?");
    values.push(filters.product);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = getDatabase()
    .prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 500`)
    .all(...values);

  return rows.map(normalizeOrder).filter((order) => !isAdminDeletedOrder(order));
}

export async function listPaidOrders() {
  return listOrders({ status: "paid" });
}

export async function listOrderLogs(orderId: string) {
  if (useSupabaseDriver()) {
    return (
      await supabaseRequest<Record<string, unknown>[]>("order_logs", {
        query: selectQuery([eq("order_id", orderId), "order=created_at.desc"])
      })
    ).map(normalizeLog);
  }

  return getDatabase()
    .prepare("SELECT * FROM order_logs WHERE order_id = ? ORDER BY created_at DESC")
    .all(orderId)
    .map(normalizeLog);
}
