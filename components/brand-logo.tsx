/* eslint-disable @next/next/no-img-element */
export function BrandLogo({ logoUrl }: { logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <img
        alt="İşletme logosu"
        className="h-24 w-24 rounded-3xl object-contain"
        src={logoUrl}
      />
    );
  }

  return (
    <div
      aria-label="Logo asset alanı"
      className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-dashed border-brand/40 bg-white text-center text-[10px] font-bold uppercase leading-4 tracking-wider text-brand"
      data-asset-path="/brand/logo.svg"
      role="img"
    >
      Logo
      <br />
      asset
    </div>
  );
}
