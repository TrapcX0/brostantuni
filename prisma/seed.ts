import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Burgerler", slug: "burgerler", sortOrder: 1 },
    { name: "Atıştırmalık", slug: "atistirmalik", sortOrder: 2 },
    { name: "İçecekler", slug: "icecekler", sortOrder: 3 }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder, isActive: true },
      create: category
    });
  }

  const categoryBySlug = Object.fromEntries(
    (
      await prisma.category.findMany({
        where: { slug: { in: categories.map(({ slug }) => slug) } }
      })
    ).map((category) => [category.slug, category])
  );

  const products = [
    {
      categorySlug: "burgerler",
      name: "Köz Burger",
      slug: "koz-burger",
      description: "Izgara köfte, cheddar, köz biber ve özel sos.",
      priceCents: 28000,
      sortOrder: 1
    },
    {
      categorySlug: "atistirmalik",
      name: "Çıtır Tavuk Sepeti",
      slug: "citir-tavuk-sepeti",
      description: "Baharatlı çıtır tavuk, patates ve dip sos.",
      priceCents: 22000,
      sortOrder: 1
    },
    {
      categorySlug: "icecekler",
      name: "Ev Yapımı Limonata",
      slug: "ev-yapimi-limonata",
      description: "Taze limon, nane ve hafif tatlı dokunuş.",
      priceCents: 9000,
      sortOrder: 1
    }
  ];

  for (const product of products) {
    const category = categoryBySlug[product.categorySlug];
    if (!category) {
      throw new Error(`Seed category not found: ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: product.slug } },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        sortOrder: product.sortOrder,
        isActive: true
      },
      create: {
        categoryId: category.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        sortOrder: product.sortOrder
      }
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      brandName: "Brostantuni",
      description: "Demo işletme ayarları; gerçek işletme verisi değildir."
    },
    create: {
      id: "singleton",
      brandName: "Brostantuni",
      description: "Demo işletme ayarları; gerçek işletme verisi değildir."
    }
  });

  console.info("Demo seed tamamlandı. Gerçek admin hesabı veya secret oluşturulmadı.");
}

main()
  .catch((error) => {
    console.error("Demo seed başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
