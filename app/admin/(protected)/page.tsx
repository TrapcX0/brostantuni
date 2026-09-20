export default function AdminDashboardPage() {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Kontrol merkezi</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Hoş geldiniz</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Menü içeriklerinizi buradan düzenleyebilirsiniz. İlgili bölümü seçerek başlayın.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black">Ürünler</h2>
          <p className="mt-2 text-sm text-zinc-600">Ürün yönetimi bir sonraki aşamada hazırlanacak.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black">Kategoriler</h2>
          <p className="mt-2 text-sm text-zinc-600">Kategori yönetimi bir sonraki aşamada hazırlanacak.</p>
        </div>
      </div>
    </>
  );
}
