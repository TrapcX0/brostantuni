import { BrandLogo } from "@/components/brand-logo";
import { CategoryChips } from "@/components/category-chips";
import { MenuList } from "@/components/menu-list";
import { menuRepository } from "@/lib/data/repositories";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await menuRepository.get();
  const brandName = settings?.brandName || "Menü";
  const description = settings?.description || "Güncel menümüzü keşfedin.";

  return {
    title: `${brandName} | Menü`,
    description
  };
}

function getWhatsAppUrl(number: string | null, message: string | null) {
  if (!number) return null;
  const normalizedNumber = number.replace(/\D/g, "");
  if (!normalizedNumber) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalizedNumber}${query}`;
}

export default async function MenuPage() {
  const [categories, settings] = await Promise.all([
    menuRepository.listActiveWithProducts(),
    menuRepository.get()
  ]);
  const brandName = settings?.brandName || "Menü";
  const description = settings?.description || "Güncel menümüzü keşfedin.";
  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsappNumber ?? null,
    settings?.whatsappMessage ?? null
  );
  const products = categories.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryName: category.name,
      categorySlug: category.slug
    }))
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 pb-12 pt-8 sm:px-8">
        <header className="flex flex-col items-center text-center">
          <BrandLogo logoUrl={settings?.logoUrl ?? null} />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-brand">
            {brandName}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {brandName}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
            {description}
          </p>
          {settings?.instagramUrl || whatsappUrl ? (
            <div className="mt-5 flex gap-2">
              {settings?.instagramUrl ? (
                <a
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  href={settings.instagramUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Instagram
                </a>
              ) : null}
              {whatsappUrl ? (
                <a
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
        </header>

        <section aria-labelledby="menu-heading" className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Menü</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight" id="menu-heading">
                Bugün ne yesek?
              </h2>
            </div>
          </div>
          <CategoryChips categories={categories.map(({ name, slug }) => ({ name, slug }))} />
          {products.length > 0 ? (
            <MenuList products={products} />
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600">
              Menü içeriği henüz hazır değil.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
