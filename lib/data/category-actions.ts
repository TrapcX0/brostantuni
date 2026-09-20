"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { menuRepository } from "@/lib/data/repositories";
import {
  CategoryHasProductsError,
  CategoryInput
} from "@/lib/data/ports";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Kategori adı en az 2 karakter olmalı.")
    .max(80, "Kategori adı 80 karakterden uzun olamaz."),
  sortOrder: z
    .string()
    .trim()
    .min(1, "Sıra numarası gerekli.")
    .refine((value) => /^\d+$/.test(value), "Sıra numarası tam sayı olmalı.")
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(0, "Sıra numarası 0 veya daha büyük olmalı.")
        .max(10000, "Sıra numarası 10000 veya daha küçük olmalı.")
    ),
  isActive: z.enum(["on"]).optional()
});

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
};

const idleState: CategoryActionState = { status: "idle", message: null };

function readInput(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
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
  const input: CategoryInput = {
    name: parsed.data.name,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive === "on"
  };
  return { input };
}

export async function saveCategory(
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();
  const parsed = readInput(formData);
  if (!("input" in parsed) || !parsed.input) return parsed.error;
  const input = parsed.input;

  const id = String(formData.get("id") ?? "").trim();
  try {
    if (id) {
      await menuRepository.update(id, input);
    } else {
      await menuRepository.create(input);
    }
    revalidatePath("/admin/categories");
    revalidatePath("/menu");
    return { status: "success", message: id ? "Kategori güncellendi." : "Kategori eklendi." };
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_SLUG_CONFLICT") {
      return { status: "error", message: "Bu isimde bir kategori zaten var." };
    }
    console.error("Category save failed:", error);
    return { status: "error", message: "Kategori kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function deleteCategory(
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Silinecek kategori bulunamadı." };

  try {
    await menuRepository.delete(id);
    revalidatePath("/admin/categories");
    revalidatePath("/menu");
    return { status: "success", message: "Kategori silindi." };
  } catch (error) {
    if (error instanceof CategoryHasProductsError) {
      return {
        status: "error",
        message: "Bu kategoriye bağlı ürünler var. Önce ürünleri başka kategoriye taşıyın."
      };
    }
    console.error("Category delete failed:", error);
    return { status: "error", message: "Kategori silinemedi. Lütfen tekrar deneyin." };
  }
}

export { idleState };
