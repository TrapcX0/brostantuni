import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brostantuni | Menü",
  description: "Brostantuni demo menü sayfası."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
