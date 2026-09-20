"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const menuPath = "/menu";

export function QrCodeManager() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [menuUrl, setMenuUrl] = useState(menuPath);

  useEffect(() => {
    setMenuUrl(`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}${menuPath}`);
  }, []);

  function downloadQrCode() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "menu-qr-kodu.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">QR kod</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight">Menünü paylaş</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Müşteriler bu kodu okutarak herkese açık menü sayfanıza ulaşabilir.
      </p>
      <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div ref={canvasRef} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <QRCodeCanvas
            aria-label={`Menü sayfası QR kodu: ${menuUrl}`}
            includeMargin
            size={220}
            value={menuUrl}
          />
        </div>
        <div className="space-y-3">
          <p className="break-all rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            {menuUrl}
          </p>
          <button
            className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={downloadQrCode}
            type="button"
          >
            PNG olarak indir
          </button>
        </div>
      </div>
    </section>
  );
}
