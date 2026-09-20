"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { menuRepository } from "@/lib/data/repositories";
import type { SiteSettingsInput } from "@/lib/data/ports";

const optionalUrl = z
  .string()
  .trim()
  .max(500, "URL 500 karakterden uzun olamaz.")
  .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), "Geçerli bir http(s) URL girin.")
  .transform((value) => value || null);

const settingsSchema = z.object({
  restaurantName: z.string().trim().min(2, "İşletme adı en az 2 karakter olmalı.").max(120),
  description: z.string().trim().min(2, "Açıklama gerekli.").max(500),
  logoUrl: z
    .string()
    .trim()
    .max(500, "Logo referansı 500 karakterden uzun olamaz.")
    .refine(
      (value) => !value || value.startsWith("/") || /^https?:\/\/\S+$/i.test(value),
      "Logo yolu / ile başlamalı veya geçerli bir http(s) URL olmalı."
    )
    .transform((value) => value || null),
  instagramUrl: optionalUrl,
  whatsappNumber: z
    .string()
    .trim()
    .max(30, "WhatsApp numarası 30 karakterden uzun olamaz.")
    .refine(
      (value) => !value || /^[+\d\s().-]+$/.test(value),
      "WhatsApp numarası yalnızca rakam ve telefon işaretleri içerebilir."
    )
    .transform((value) => value.replace(/[^\d+]/g, ""))
    .refine((value) => !value || /^\+?\d{10,15}$/.test(value), "Geçerli bir WhatsApp numarası girin.")
    .transform((value) => value || null),
  whatsappMessage: z
    .string()
    .trim()
    .max(500, "WhatsApp mesajı 500 karakterden uzun olamaz.")
    .transform((value) => value || null),
  seoTitle: z
    .string()
    .trim()
    .max(70, "SEO başlığı 70 karakterden uzun olamaz.")
    .transform((value) => value || null),
  seoDescription: z
    .string()
    .trim()
    .max(160, "SEO açıklaması 160 karakterden uzun olamaz.")
    .transform((value) => value || null)
});

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
};

const idleState: SettingsActionState = { status: "idle", message: null };

export async function saveSettings(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    restaurantName: formData.get("restaurantName"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl"),
    instagramUrl: formData.get("instagramUrl"),
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappMessage: formData.get("whatsappMessage"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Formdaki bilgileri kontrol edin.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const input: SiteSettingsInput = parsed.data;
  try {
    await menuRepository.updateSettings(input);
    revalidatePath("/admin/settings");
    revalidatePath("/menu");
    return { status: "success", message: "Ayarlar kaydedildi." };
  } catch (error) {
    console.error("Settings save failed:", error);
    return { status: "error", message: "Ayarlar kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export { idleState };
