import path from "node:path";
import { getMaterialsByProductId, userHasAccessToProduct } from "@/lib/checkout/db";
import { privateFilesDir } from "@/lib/checkout/delivery";
import type { ProgramMaterial } from "@/lib/checkout/types";

export async function getAccessibleProgramMaterials(userId: string, productId: string) {
  if (!(await userHasAccessToProduct(userId, productId))) return [];
  return getMaterialsByProductId(productId);
}

export function generatePrivateMaterialUrl(material: ProgramMaterial) {
  if (material.external_url) return material.external_url;
  if (!material.file_path_private) return null;
  return `/api/account/materials/${material.id}`;
}

export function resolvePrivateMaterialPath(material: ProgramMaterial) {
  if (!material.file_path_private) return null;
  return path.join(privateFilesDir(), material.file_path_private);
}
