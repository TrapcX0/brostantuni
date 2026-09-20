export function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Yönetim paneli</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
      <p className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm leading-6 text-zinc-600">
        Bu bölüm hazırlık aşamasında. Şimdilik burada herhangi bir değişiklik yapmanız gerekmiyor.
      </p>
    </>
  );
}
