/* eslint-disable @next/next/no-img-element */
import type { MenuProduct } from "@/lib/data/ports";

type MenuListProps = {
  products: Array<MenuProduct & { categoryName: string; categorySlug: string }>;
};

export function MenuList({ products }: MenuListProps) {
  return (
    <div className="mt-5 space-y-3">
      {products.map((product) => (
        <article
          className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-black/[0.03]"
          id={product.categorySlug}
          key={product.id}
        >
          {product.imageUrl ? (
            <img
              alt={`${product.name} görseli`}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
              src={product.imageUrl}
            />
          ) : (
            <div
              aria-label="Görsel yok"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-center text-[10px] font-bold uppercase leading-4 tracking-wide text-zinc-400"
              role="img"
            >
              Görsel
              <br />
              yok
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-extrabold leading-5">{product.name}</h3>
              <span className="shrink-0 font-black text-brand">
                {(product.priceCents / 100).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{" "}
                ₺
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 text-zinc-600">{product.description}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {product.categoryName}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
