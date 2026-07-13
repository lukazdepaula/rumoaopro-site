import path from "node:path";
import { randomUUID } from "node:crypto";

const SUPABASE_STORAGE_PREFIX = "supabase:";

let bucketReady = false;

function storageConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_MATERIALS_BUCKET || "program-materials";

  if (!url || !key) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para subir arquivos."
    );
  }

  return {
    bucket,
    key,
    url: url.replace(/\/$/, "")
  };
}

function encodeStoragePath(value: string) {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function safeFilename(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "material.pdf"
  );
}

async function ensureBucket() {
  if (bucketReady) return;

  const config = storageConfig();
  const response = await fetch(`${config.url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: false
    }),
    cache: "no-store"
  });

  if (!response.ok && response.status !== 409) {
    const message = await response.text().catch(() => "");
    if (!message.toLowerCase().includes("already")) {
      throw new Error(`Erro ao criar bucket de materiais: ${response.status}`);
    }
  }

  bucketReady = true;
}

export function isSupabaseMaterialPath(value?: string | null) {
  return Boolean(value?.startsWith(SUPABASE_STORAGE_PREFIX));
}

export function parseSupabaseMaterialPath(value: string) {
  const withoutPrefix = value.slice(SUPABASE_STORAGE_PREFIX.length);
  const slashIndex = withoutPrefix.indexOf("/");

  if (slashIndex <= 0) {
    return null;
  }

  return {
    bucket: withoutPrefix.slice(0, slashIndex),
    objectPath: withoutPrefix.slice(slashIndex + 1)
  };
}

export async function uploadMaterialFile(input: {
  productId: string;
  file: File;
}) {
  await ensureBucket();

  const config = storageConfig();
  const filename = safeFilename(input.file.name);
  const objectPath = `${input.productId}/${Date.now()}-${randomUUID()}-${filename}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const response = await fetch(
    `${config.url}/storage/v1/object/${config.bucket}/${encodeStoragePath(objectPath)}`,
    {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": input.file.type || "application/octet-stream",
        "x-upsert": "true"
      },
      body: bytes,
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao subir arquivo: ${response.status}`);
  }

  return `${SUPABASE_STORAGE_PREFIX}${config.bucket}/${objectPath}`;
}

export async function createSignedMaterialUpload(input: {
  productId: string;
  filename: string;
}) {
  await ensureBucket();

  const config = storageConfig();
  const filename = safeFilename(input.filename);
  const objectPath = `${input.productId}/${Date.now()}-${randomUUID()}-${filename}`;
  const response = await fetch(
    `${config.url}/storage/v1/object/upload/sign/${config.bucket}/${encodeStoragePath(objectPath)}`,
    {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        "x-upsert": "true"
      },
      body: "{}",
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao criar upload seguro: ${response.status}`);
  }

  const data = (await response.json()) as {
    url?: string;
    signedURL?: string;
    signedUrl?: string;
  };
  const signedPath = data.url || data.signedURL || data.signedUrl;

  if (!signedPath) {
    throw new Error("Supabase não retornou uma URL de upload.");
  }

  const signedUrl = signedPath.startsWith("http")
    ? signedPath
    : `${config.url}/storage/v1${
        signedPath.startsWith("/") ? signedPath : `/${signedPath}`
      }`;

  return {
    objectPath,
    signedUrl,
    storagePath: `${SUPABASE_STORAGE_PREFIX}${config.bucket}/${objectPath}`
  };
}

export async function fetchSupabaseMaterial(value: string) {
  const parsed = parseSupabaseMaterialPath(value);
  if (!parsed) return null;

  const config = storageConfig();
  const response = await fetch(
    `${config.url}/storage/v1/object/${parsed.bucket}/${encodeStoragePath(parsed.objectPath)}`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) return null;

  return {
    body: new Uint8Array(await response.arrayBuffer()),
    contentType: response.headers.get("Content-Type") || "application/octet-stream",
    filename: path.basename(parsed.objectPath)
  };
}
