"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { menuRepository } from "@/lib/data/repositories";
import type { ProductInput } from "@/lib/data/ports";
import { imageStorage } from "@/lib/storage";
import { InvalidImageError } from "@/lib/storage/image-storage";

const priceSchema = z
  .string()
  .trim()
  .min(1, "Fiyat gerekli.")
  .refine((value) => /^\d+(?:[.,]\d{1,2})?$/.test(value), "Fiyat TL cinsinden geçerli bir sayı olmalı.")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(
    z
      .number()
      .int()
      .min(0, "Fiyat 0 veya daha büyük olmalı.")
      .max(100000000, "Fiyat 1.000.000 TL'den yüksek olamaz.")
  );

const productSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı.").max(120, "Ürün adı 120 karakterden uzun olamaz."),
  description: z
    .string()
    .trim()
    .min(2, "Açıklama en az 2 karakter olmalı.")
    .max(500, "Açıklama 500 karakterden uzun olamaz."),
  price: priceSchema,
  categoryId: z.string().trim().min(1, "Kategori seçin."),
  sortOrder: z
    .string()
    .trim()
    .min(1, "Sıra numarası gerekli.")
    .refine((value) => /^\d+$/.test(value), "Sıra numarası tam sayı olmalı.")
    .transform(Number)
    .pipe(z.number().int().min(0, "Sıra numarası 0 veya daha büyük olmalı.").max(10000)),
  isActive: z.enum(["on"]).optional()
});

export type ProductActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
};

const idleState: ProductActionState = { status: "idle", message: null };

function readInput(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive")
  });
  if (!parsed.success) {
    return {
      error: {
        status: "error" as const,
        message: "Formdaki bilgileri kontrol edin.",
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    };
  }
  const input: ProductInput = {
    name: parsed.data.name,
    description: parsed.data.description,
    priceCents: parsed.data.price,
    categoryId: parsed.data.categoryId,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive === "on"
  };
  return { input };
}

export async function saveProduct(
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = readInput(formData);
  if (!("input" in parsed) || !parsed.input) return parsed.error;
  const id = String(formData.get("id") ?? "").trim();
  const uploadedEntry = formData.get("image");
  const uploadedFile =
    uploadedEntry instanceof File && uploadedEntry.size > 0 ? uploadedEntry : null;
  let newImageUrl: string | null = null;
  let previousImageUrl: string | null = null;

  try {
    if (id) previousImageUrl = await menuRepository.getProductImage(id);
    if (uploadedFile) {
      newImageUrl = (await imageStorage.save(uploadedFile)).url;
    }

    const input: ProductInput = {
      ...parsed.input,
      ...(newImageUrl ? { imageUrl: newImageUrl } : {})
    };
    if (id) await menuRepository.updateProduct(id, input);
    else await menuRepository.createProduct(input);

    if (id && newImageUrl && previousImageUrl) {
      try {
        await imageStorage.delete(previousImageUrl);
      } catch (error) {
        console.error("Previous product image cleanup failed:", error);
        revalidatePath("/admin/products");
        revalidatePath("/menu");
        return {
          status: "error",
          message: "Ürün güncellendi ancak eski görsel temizlenemedi. Teknik destekle iletişime geçin."
        };
      }
    }
    revalidatePath("/admin/products");
    revalidatePath("/menu");
    return { status: "success", message: id ? "Ürün güncellendi." : "Ürün eklendi." };
  } catch (error) {
    if (newImageUrl) {
      try {
        await imageStorage.delete(newImageUrl);
      } catch (cleanupError) {
        console.error("New product image cleanup failed:", cleanupError);
      }
    }
    if (error instanceof InvalidImageError) {
      return { status: "error", message: error.message };
    }
    if (error instanceof Error && error.message === "PRODUCT_CATEGORY_UNAVAILABLE") {
      return { status: "error", message: "Seçilen kategori artık aktif değil. Lütfen başka bir kategori seçin." };
    }
    if (error instanceof Error && error.message === "PRODUCT_SLUG_CONFLICT") {
      return { status: "error", message: "Bu kategori içinde aynı isimde bir ürün zaten var." };
    }
    console.error("Product save failed:", error);
    return { status: "error", message: "Ürün kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function deleteProduct(
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Silinecek ürün bulunamadı." };

  try {
    const deletedProduct = await menuRepository.deleteProduct(id);
    try {
      await imageStorage.delete(deletedProduct.imageUrl);
    } catch (error) {
      console.error("Deleted product image cleanup failed:", error);
      revalidatePath("/admin/products");
      revalidatePath("/menu");
      return {
        status: "error",
        message: "Ürün silindi ancak görsel dosyası temizlenemedi. Teknik destekle iletişime geçin."
      };
    }
    revalidatePath("/admin/products");
    revalidatePath("/menu");
    return { status: "success", message: "Ürün silindi." };
  } catch (error) {
    console.error("Product delete failed:", error);
    return { status: "error", message: "Ürün silinemedi. Lütfen tekrar deneyin." };
  }
}

export { idleState };
