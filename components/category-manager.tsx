"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { AdminCategory } from "@/lib/data/ports";
import { deleteCategory, idleState, saveCategory } from "@/lib/data/category-actions";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Kaydediliyor..." : editing ? "Değişiklikleri kaydet" : "Kategori ekle"}
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

export function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [saveState, saveAction] = useFormState(saveCategory, idleState);
  const [deleteState, deleteAction] = useFormState(deleteCategory, idleState);

  useEffect(() => {
    if (saveState.status === "success" || deleteState.status === "success") {
      setEditing(null);
      router.refresh();
    }
  }, [deleteState.status, router, saveState.status]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Kategori yönetimi</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">
            {editing ? "Kategoriyi düzenle" : "Yeni kategori ekle"}
          </h1>
        </div>
        <form action={saveAction} className="space-y-4" key={editing?.id ?? "new"}>
          <input name="id" type="hidden" value={editing?.id ?? ""} />
          <label className="block text-sm font-bold" htmlFor="category-name">
            Kategori adı
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
              defaultValue={editing?.name ?? ""}
              id="category-name"
              maxLength={80}
              name="name"
              placeholder="Örneğin: Burgerler"
              required
            />
            <FieldError message={saveState.fieldErrors?.name?.[0]} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold" htmlFor="category-sort-order">
              Sıra numarası
              <input
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
                defaultValue={editing?.sortOrder ?? 0}
                id="category-sort-order"
                max={10000}
                min={0}
                name="sortOrder"
                required
                type="number"
              />
              <FieldError message={saveState.fieldErrors?.sortOrder?.[0]} />
            </label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold">
              <input defaultChecked={editing?.isActive ?? true} name="isActive" type="checkbox" />
              Aktif kategori
            </label>
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

      <section aria-labelledby="category-list-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Mevcut kategoriler</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight" id="category-list-heading">
              Kategori listesi
            </h2>
          </div>
          <span className="text-sm text-zinc-500">{categories.length} kategori</span>
        </div>
        <Feedback state={deleteState} />
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
            Henüz kategori eklenmemiş. Yukarıdaki formdan ilk kategoriyi ekleyin.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <article className="rounded-2xl border border-zinc-200 bg-white p-4" key={category.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black">{category.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          category.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {category.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Sıra: {category.sortOrder} · {category.productCount} ürün
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 hover:border-brand hover:text-brand"
                      onClick={() => setEditing(category)}
                      type="button"
                    >
                      Düzenle
                    </button>
                    <form
                      action={deleteAction}
                      onSubmit={(event) => {
                        if (!window.confirm("Bu kategori silinsin mi?")) event.preventDefault();
                      }}
                    >
                      <input name="id" type="hidden" value={category.id} />
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
