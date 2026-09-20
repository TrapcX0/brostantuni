import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { ImageStorage, StoredImage } from "@/lib/storage/image-storage";
import { InvalidImageError } from "@/lib/storage/image-storage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const BUCKET = "menu-images";
const IMAGE_TYPES = {
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  "image/webp": { extension: "webp", signature: null }
} as const;

function matchesBytes(bytes: Uint8Array, signature: readonly number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function validateImage(file: File, bytes: Uint8Array) {
  if (file.size === 0) throw new InvalidImageError("Boş bir görsel yüklenemez.");
  if (file.size > MAX_IMAGE_SIZE) {
    throw new InvalidImageError("Görsel boyutu 5 MB'dan büyük olamaz.");
  }

  const metadata = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  if (!metadata) throw new InvalidImageError("Sadece JPG, PNG veya WebP görseller desteklenir.");

  const extension = file.name.split(".").pop()?.toLocaleLowerCase("en-US");
  if (extension !== metadata.extension && !(metadata.extension === "jpg" && extension === "jpeg")) {
    throw new InvalidImageError("Görsel uzantısı ile dosya türü eşleşmiyor.");
  }

  if (metadata.extension === "webp") {
    if (
      !matchesBytes(bytes, [0x52, 0x49, 0x46, 0x46]) ||
      !matchesBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
    ) {
      throw new InvalidImageError("Görsel içeriği geçerli bir WebP dosyası değil.");
    }
  } else if (!matchesBytes(bytes, metadata.signature)) {
    throw new InvalidImageError("Görsel içeriği dosya türüyle eşleşmiyor.");
  }

  return metadata.extension;
}

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`${name}_MISSING`);
  return value;
}

export class SupabaseImageStorage implements ImageStorage {
  private readonly bucket = BUCKET;

  private getClient() {
    const client = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
      auth: { autoRefreshToken: false, persistSession: false }
      }
    );
    return client;
  }

  async save(file: File): Promise<StoredImage> {
    const client = this.getClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = validateImage(file, bytes);
    const objectPath = `products/${randomUUID()}.${extension}`;
    const { error } = await client.storage.from(this.bucket).upload(objectPath, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false
    });
    if (error) throw error;

    const { data } = client.storage.from(this.bucket).getPublicUrl(objectPath);
    return { url: data.publicUrl };
  }

  async delete(imageUrl: string | null): Promise<void> {
    if (!imageUrl) return;
    const client = this.getClient();
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${this.bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1 || markerIndex + marker.length >= url.pathname.length) {
      throw new Error("IMAGE_PATH_INVALID");
    }

    const objectPath = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    if (!/^products\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(objectPath)) {
      throw new Error("IMAGE_PATH_INVALID");
    }

    const { error } = await client.storage.from(this.bucket).remove([objectPath]);
    if (error) throw error;
  }
}
