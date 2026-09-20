import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

const navigation = [
  { href: "/admin", label: "Genel bakış" },
  { href: "/admin/products", label: "Ürünler" },
  { href: "/admin/categories", label: "Kategoriler" },
  { href: "/admin/settings", label: "Ayarlar" },
  { href: "/admin/qr", label: "QR Kod" }
];

export default async function ProtectedAdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="font-black tracking-tight" href="/admin">
            Brostantuni <span className="text-brand">Yönetim</span>
          </Link>
          <form action={logout}>
            <button className="text-sm font-bold text-zinc-600 hover:text-brand" type="submit">
              Çıkış yap
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 md:flex-row">
        <nav aria-label="Yönetim menüsü" className="overflow-x-auto">
          <div className="flex gap-2 md:w-48 md:flex-col">
            {navigation.map((item) => (
              <Link
                className="whitespace-nowrap rounded-xl bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition hover:text-brand"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
