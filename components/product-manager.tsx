"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { AdminCategory, AdminProduct } from "@/lib/data/ports";
import { deleteProduct, idleState, saveProduct } from "@/lib/data/product-actions";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Kaydediliyor..." : editing ? "Değişiklikleri kaydet" : "Ürün ekle"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Siliniyor..." : "Sil"}
    </button>
  );
}

function Feedback({ state }: { state: { status: string; message: string | null } }) {
  if (!state.message) return null;
  return (
    <p
      aria-live="polite"
      className={`rounded-xl px-3 py-2 text-sm ${
        state.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-normal text-red-700">{message}</p> : null;
}

function formatPrice(priceCents: number) {
  return (priceCents / 100).toFixed(2).replace(".", ",");
}

export function ProductManager({
  products,
  categories
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveState, saveAction] = useFormState(saveProduct, idleState);
  const [deleteState, deleteAction] = useFormState(deleteProduct, idleState);

  useEffect(() => {
    if (saveState.status === "success" || deleteState.status === "success") {
      setEditing(null);
      router.refresh();
    }
  }, [deleteState.status, router, saveState.status]);

  useEffect(() => {
    setSelectedFile(null);
  }, [editing?.id]);

  if (categories.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Ürün yönetimi</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Önce bir kategori ekleyin</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Ürün ekleyebilmek için en az bir aktif kategori gerekiyor.
        </p>
        <a
          className="mt-5 inline-flex rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
          href="/admin/categories"
        >
          Kategori yönetimine git
        </a>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Ürün yönetimi</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">
            {editing ? "Ürünü düzenle" : "Yeni ürün ekle"}
          </h1>
        </div>
        <form action={saveAction} className="space-y-4" key={editing?.id ?? "new"}>
          <input name="id" type="hidden" value={editing?.id ?? ""} />
          <label className="block text-sm font-bold" htmlFor="product-name">
            Ürün adı
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
              defaultValue={editing?.name ?? ""}
              id="product-name"
              maxLength={120}
              name="name"
              placeholder="Örneğin: Köz Burger"
              required
            />
            <FieldError message={saveState.fieldErrors?.name?.[0]} />
          </label>
          <label className="block text-sm font-bold" htmlFor="product-description">
            Açıklama
            <textarea
              className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
              defaultValue={editing?.description ?? ""}
              id="product-description"
              maxLength={500}
              name="description"
              placeholder="Ürünün kısa açıklaması"
              required
            />
            <FieldError message={saveState.fieldErrors?.description?.[0]} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-bold" htmlFor="product-price">
              Fiyat (₺)
              <input
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
                defaultValue={editing ? formatPrice(editing.priceCents) : ""}
                id="product-price"
                inputMode="decimal"
                name="price"
                placeholder="280,00"
                required
                type="text"
              />
              <FieldError message={saveState.fieldErrors?.price?.[0]} />
            </label>
            <label className="block text-sm font-bold" htmlFor="product-category">
              Kategori
              <select
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
                defaultValue={editing?.categoryId ?? categories[0].id}
                id="product-category"
                name="categoryId"
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={saveState.fieldErrors?.categoryId?.[0]} />
            </label>
            <label className="block text-sm font-bold" htmlFor="product-sort-order">
              Sıra numarası
              <input
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
                defaultValue={editing?.sortOrder ?? 0}
                id="product-sort-order"
                min={0}
                name="sortOrder"
                required
                type="number"
              />
              <FieldError message={saveState.fieldErrors?.sortOrder?.[0]} />
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold">
            <input defaultChecked={editing?.isActive ?? true} name="isActive" type="checkbox" />
            Aktif ürün
          </label>
          <div>
            <label className="block text-sm font-bold" htmlFor="product-image">
              Ürün görseli
              <input
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="mt-2 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                id="product-image"
                name="image"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <p className="mt-1 text-xs text-zinc-500">JPG, PNG veya WebP · En fazla 5 MB</p>
            {selectedFile ? (
              <p className="mt-2 text-xs font-bold text-zinc-600">
                Seçilen dosya: {selectedFile.name}
              </p>
            ) : null}
            {editing?.imageUrl ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  alt={`${editing.name} mevcut görseli`}
                  className="h-20 w-20 rounded-xl border border-zinc-200 object-cover"
                  src={editing.imageUrl}
                />
                <p className="text-xs text-zinc-500">
                  Yeni dosya seçerseniz mevcut görsel kaydedilen dosyayla değiştirilir.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">Henüz görsel yok; ürün placeholder ile gösterilir.</p>
            )}
          </div>
          <Feedback state={saveState} />
          <div className="flex flex-wrap gap-2">
            <SubmitButton editing={Boolean(editing)} />
            {editing ? (
              <button
                className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-600 hover:border-brand hover:text-brand"
                onClick={() => setEditing(null)}
                type="button"
              >
                Vazgeç
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section aria-labelledby="product-list-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Mevcut ürünler</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight" id="product-list-heading">
              Ürün listesi
            </h2>
          </div>
          <span className="text-sm text-zinc-500">{products.length} ürün</span>
        </div>
        <Feedback state={deleteState} />
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
            Henüz ürün eklenmemiş. Yukarıdaki formdan ilk ürünü ekleyin.
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <article className="rounded-2xl border border-zinc-200 bg-white p-4" key={product.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black">{product.name}</h3>
                      <span className="font-bold text-brand">{formatPrice(product.priceCents)} ₺</span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          product.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {product.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{product.description}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {product.categoryName} · Sıra: {product.sortOrder}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 hover:border-brand hover:text-brand"
                      onClick={() => setEditing(product)}
                      type="button"
                    >
                      Düzenle
                    </button>
                    <form
                      action={deleteAction}
                      onSubmit={(event) => {
                        if (!window.confirm("Bu ürün silinsin mi?")) event.preventDefault();
                      }}
                    >
                      <input name="id" type="hidden" value={product.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
