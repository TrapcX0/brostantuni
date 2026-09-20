"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { AdminSiteSettings } from "@/lib/data/ports";
import { idleState, saveSettings } from "@/lib/data/settings-actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Kaydediliyor..." : "Ayarları kaydet"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-normal text-red-700">{message}</p> : null;
}

export function SettingsManager({ settings }: { settings: AdminSiteSettings }) {
  const [state, action] = useFormState(saveSettings, idleState);
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">İşletme ayarları</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight">Menü bilgilerini düzenle</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Ziyaretçilerin göreceği temel bilgileri buradan güncelleyebilirsiniz.
      </p>
      <form action={action} className="mt-6 space-y-5">
        <label className="block text-sm font-bold" htmlFor="restaurant-name">
          İşletme adı
          <input
            className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
            defaultValue={settings.restaurantName}
            id="restaurant-name"
            maxLength={120}
            name="restaurantName"
            required
          />
          <FieldError message={state.fieldErrors?.restaurantName?.[0]} />
        </label>
        <label className="block text-sm font-bold" htmlFor="settings-description">
          Kısa açıklama
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
            defaultValue={settings.description}
            id="settings-description"
            maxLength={500}
            name="description"
            required
          />
          <FieldError message={state.fieldErrors?.description?.[0]} />
        </label>
        <div className="rounded-2xl border border-zinc-200 p-4">
          <h2 className="font-black">Logo referansı</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Gerçek logo asset yolunu girin. Logo çizilmez veya CSS ile taklit edilmez.
          </p>
          <input
            className="mt-3 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
            defaultValue={settings.logoUrl ?? ""}
            id="logo-url"
            name="logoUrl"
            placeholder="/brand/logo.svg"
            type="text"
          />
          <FieldError message={state.fieldErrors?.logoUrl?.[0]} />
          <p className="mt-2 text-xs text-zinc-500">Mevcut asset yolu: /brand/logo.svg</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold" htmlFor="instagram-url">
            Instagram adresi
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
              defaultValue={settings.instagramUrl ?? ""}
              id="instagram-url"
              name="instagramUrl"
              placeholder="https://instagram.com/..."
              type="url"
            />
            <FieldError message={state.fieldErrors?.instagramUrl?.[0]} />
          </label>
          <label className="block text-sm font-bold" htmlFor="whatsapp-number">
            WhatsApp numarası
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
              defaultValue={settings.whatsappNumber ?? ""}
              id="whatsapp-number"
              inputMode="tel"
              name="whatsappNumber"
              placeholder="+905xxxxxxxxx"
              type="tel"
            />
            <FieldError message={state.fieldErrors?.whatsappNumber?.[0]} />
          </label>
        </div>
        <label className="block text-sm font-bold" htmlFor="whatsapp-message">
          WhatsApp hazır mesajı
          <textarea
            className="mt-2 min-h-20 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
            defaultValue={settings.whatsappMessage ?? ""}
            id="whatsapp-message"
            maxLength={500}
            name="whatsappMessage"
            placeholder="Merhaba, menü hakkında bilgi almak istiyorum."
          />
          <FieldError message={state.fieldErrors?.whatsappMessage?.[0]} />
        </label>
        <details className="rounded-2xl border border-zinc-200 p-4">
          <summary className="cursor-pointer text-sm font-black">Arama motoru ayarları</summary>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-bold" htmlFor="seo-title">
              SEO başlığı
              <input
                className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
                defaultValue={settings.seoTitle ?? ""}
                id="seo-title"
                maxLength={70}
                name="seoTitle"
              />
              <FieldError message={state.fieldErrors?.seoTitle?.[0]} />
            </label>
            <label className="block text-sm font-bold" htmlFor="seo-description">
              SEO açıklaması
              <textarea
                className="mt-2 min-h-20 w-full rounded-xl border border-zinc-200 px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
                defaultValue={settings.seoDescription ?? ""}
                id="seo-description"
                maxLength={160}
                name="seoDescription"
              />
              <FieldError message={state.fieldErrors?.seoDescription?.[0]} />
            </label>
          </div>
        </details>
        {state.message ? (
          <p
            aria-live="polite"
            className={`rounded-xl px-3 py-2 text-sm ${
              state.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        <SaveButton />
      </form>
    </section>
  );
}
