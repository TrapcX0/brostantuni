# Brostantuni

## Geliştirme

```bash
npm install
Copy-Item .env.example .env
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Veritabanı Supabase PostgreSQL üzerinde çalışır. `DATABASE_URL` pooled bağlantıyı,
`DIRECT_URL` ise Prisma migrationları için doğrudan bağlantıyı gösterir.
`prisma/schema.prisma`, uygulamanın tek işletmeye uygun temel veri modelini içerir.

Yönetici hesabı seed dosyasına veya repoya yazılmaz. `.env` içinde geçici olarak en az 12 karakterlik
`ADMIN_EMAIL` ve `ADMIN_PASSWORD` ayarlayıp `npm run db:seed:admin` çalıştırın; işlemden sonra bu
değerleri ortamdan kaldırın. Oturum imzalama için en az 32 karakterlik rastgele `SESSION_SECRET`
gereklidir. Gerçek secret veya parola commit edilmemelidir.

`lib/data/ports.ts` UI'dan bağımsız veri erişim sözleşmelerini, `lib/data/prisma-menu-repository.ts`
ise mevcut Prisma adapter'ını içerir. İleride veri kaynağı değiştirilecekse UI katmanına dokunmadan
aynı port uygulanabilir.

`npm run db:seed` içeriği yalnızca demo veridir; gerçek işletme bilgisi, admin parolası veya secret
içermez. `/admin` oturumu HttpOnly, production'da Secure, SameSite=Lax cookie ile korunur.

Ürün görselleri Supabase Storage'daki public `menu-images` bucket'ının `products/` klasöründe
saklanır. Yüklemeler JPG/JPEG, PNG veya WebP ve en fazla 5 MB ile sınırlıdır.
`SUPABASE_SERVICE_ROLE_KEY` yalnızca server-side ortam değişkeni olarak tutulmalıdır; client
koduna veya `NEXT_PUBLIC_*` değişkenlerine taşınmamalıdır.

## Vercel deployment

Vercel ortamında `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, en az 32 karakterlik `SESSION_SECRET` ve QR kodun kullanacağı
gerçek alan adı için `NEXT_PUBLIC_SITE_URL` tanımlanmalıdır. Supabase projesinde public
`menu-images` bucket'ı oluşturulmalıdır. PostgreSQL migrationları `DIRECT_URL` üzerinden
çalıştırılmalıdır.

Yönetici panelindeki QR Kod sayfası, `NEXT_PUBLIC_SITE_URL` yoksa mevcut origin'i kullanarak
`/menu` adresini QR koduna dönüştürür ve PNG indirmesine izin verir.
