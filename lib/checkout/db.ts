import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { checkoutProducts, programMaterials } from "@/lib/checkout/products";
import type {
  AccessStatus,
  CustomerUser,
  DeliveryStatus,
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
  seedProgramMaterials(database);

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

function seedProgramMaterials(db: SqliteDatabase) {
  const statement = db.prepare(`
    INSERT INTO program_materials (
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
      updated_at = excluded.updated_at
  `);

  for (const material of programMaterials) {
    statement.run(
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
  }
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
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    product_name: String(row.product_name),
    user_id: row.user_id === null || row.user_id === undefined ? null : String(row.user_id),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    customer_country: String(row.customer_country),
    customer_document_type:
      row.customer_document_type === null
        ? null
        : (String(row.customer_document_type) as Order["customer_document_type"]),
    customer_document:
      row.customer_document === null ? null : String(row.customer_document),
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
    metadata: parseMetadata(row.metadata),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    paid_at: row.paid_at === null ? null : String(row.paid_at)
  };
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

function encodeMaterial(material: ProgramMaterial) {
  return {
    id: material.id,
    product_id: material.product_id,
    title: material.title,
    description: material.description,
    type: material.type,
    sort_order: material.sort_order,
    is_active: material.is_active,
    file_path_private: material.file_path_private,
    external_url: material.external_url,
    created_at: material.created_at,
    updated_at: material.updated_at
  };
}

let supabaseSeeded = false;

async function ensureSupabaseSeeded() {
  if (!useSupabaseDriver() || supabaseSeeded) return;

  await supabaseRequest("products", {
    method: "POST",
    query: "on_conflict=id",
    body: checkoutProducts.map(encodeProduct),
    prefer: "resolution=merge-duplicates,return=minimal"
  });

  await supabaseRequest("program_materials", {
    method: "POST",
    query: "on_conflict=id",
    body: programMaterials.map(encodeMaterial),
    prefer: "resolution=merge-duplicates,return=minimal"
  });

  supabaseSeeded = true;
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
  gateway: Gateway;
  amount: number;
  currency: string;
  exchange_rate_used?: number | null;
  fiscal_status: FiscalStatus;
  metadata?: Record<string, unknown>;
};

export async function createOrder(input: CreateOrderInput) {
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
        metadata: jsonMetadata(input.metadata),
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
    JSON.stringify(input.metadata || {}),
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
    return rows[0] ? normalizeOrder(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(id);
  return row ? normalizeOrder(row) : null;
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
    return rows[0] ? normalizeOrder(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare(
      "SELECT * FROM orders WHERE gateway = ? AND gateway_payment_id = ?"
    )
    .get(gateway, paymentId);
  return row ? normalizeOrder(row) : null;
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
    return rows[0] ? normalizeOrder(rows[0]) : null;
  }

  const row = getDatabase()
    .prepare(
      "SELECT * FROM orders WHERE gateway = ? AND gateway_checkout_id = ?"
    )
    .get(gateway, checkoutId);
  return row ? normalizeOrder(row) : null;
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
  const nextMetadata = {
    ...(order?.metadata || {}),
    ...(metadata || {})
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
          "used_at=is.null",
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
       WHERE token = ? AND used_at IS NULL AND expires_at > ?`
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
    ).map(normalizeOrder);
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

  return rows.map(normalizeOrder);
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
