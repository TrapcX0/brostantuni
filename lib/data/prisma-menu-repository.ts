import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type {
  AdminCategory,
  AdminProduct,
  AdminSiteSettings,
  CategoryInput,
  MenuDataSource,
  ProductInput,
  PublicCategory,
  PublicSiteSettings,
  SiteSettingsInput
} from "@/lib/data/ports";
import { CategoryHasProductsError as CategoryHasProductsDomainError } from "@/lib/data/ports";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toAdminCategory(category: {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}): AdminCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productCount: category._count.products
  };
}

function toAdminProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  category: { name: string };
}): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    sortOrder: product.sortOrder,
    isActive: product.isActive
  };
}

export class PrismaMenuRepository implements MenuDataSource {
  constructor(private readonly db: PrismaClient) {}

  private async assertActiveCategory(categoryId: string) {
    const category = await this.db.category.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true }
    });
    if (!category) throw new Error("PRODUCT_CATEGORY_UNAVAILABLE");
  }

  async listActiveWithProducts(): Promise<PublicCategory[]> {
    const categories = await this.db.category.findMany({
      where: {
        isActive: true,
        products: { some: { isActive: true } }
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            priceCents: true,
            imageUrl: true,
            sortOrder: true
          }
        }
      }
    });

    return categories;
  }

  async get(): Promise<PublicSiteSettings | null> {
    return this.db.siteSettings.findUnique({
      where: { id: "singleton" },
      select: {
        brandName: true,
        description: true,
        logoUrl: true,
        instagramUrl: true,
        whatsappNumber: true,
        whatsappMessage: true
      }
    });
  }

  async getForAdmin(): Promise<AdminSiteSettings | null> {
    const settings = await this.db.siteSettings.findUnique({
      where: { id: "singleton" },
      select: {
        brandName: true,
        description: true,
        logoUrl: true,
        instagramUrl: true,
        whatsappNumber: true,
        whatsappMessage: true,
        seoTitle: true,
        seoDescription: true
      }
    });
    if (!settings) return null;
    return {
      restaurantName: settings.brandName,
      description: settings.description,
      logoUrl: settings.logoUrl,
      instagramUrl: settings.instagramUrl,
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription
    };
  }

  async updateSettings(input: SiteSettingsInput): Promise<AdminSiteSettings> {
    const settings = await this.db.siteSettings.upsert({
      where: { id: "singleton" },
      update: {
        brandName: input.restaurantName,
        description: input.description,
        logoUrl: input.logoUrl,
        instagramUrl: input.instagramUrl,
        whatsappNumber: input.whatsappNumber,
        whatsappMessage: input.whatsappMessage,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription
      },
      create: {
        id: "singleton",
        brandName: input.restaurantName,
        description: input.description,
        logoUrl: input.logoUrl,
        instagramUrl: input.instagramUrl,
        whatsappNumber: input.whatsappNumber,
        whatsappMessage: input.whatsappMessage,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription
      },
      select: {
        brandName: true,
        description: true,
        logoUrl: true,
        instagramUrl: true,
        whatsappNumber: true,
        whatsappMessage: true,
        seoTitle: true,
        seoDescription: true
      }
    });
    return { restaurantName: settings.brandName, ...settings };
  }

  async listForAdmin(): Promise<AdminCategory[]> {
    const categories = await this.db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } }
    });
    return categories.map(toAdminCategory);
  }

  async create(input: CategoryInput): Promise<AdminCategory> {
    try {
      const category = await this.db.category.create({
        data: { ...input, slug: slugify(input.name) },
        include: { _count: { select: { products: true } } }
      });
      return toAdminCategory(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("CATEGORY_SLUG_CONFLICT");
      }
      throw error;
    }
  }

  async update(id: string, input: CategoryInput): Promise<AdminCategory> {
    try {
      const category = await this.db.category.update({
        where: { id },
        data: { ...input, slug: slugify(input.name) },
        include: { _count: { select: { products: true } } }
      });
      return toAdminCategory(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("CATEGORY_SLUG_CONFLICT");
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const category = await this.db.category.findUnique({
      where: { id },
      select: { _count: { select: { products: true } } }
    });
    if (!category) throw new Error("CATEGORY_NOT_FOUND");
    if (category._count.products > 0) throw new CategoryHasProductsDomainError();

    await this.db.category.delete({ where: { id } });
  }

  async listProductsForAdmin(): Promise<AdminProduct[]> {
    const products = await this.db.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: { select: { name: true } } }
    });
    return products.map(toAdminProduct);
  }

  async createProduct(input: ProductInput): Promise<AdminProduct> {
    try {
      await this.assertActiveCategory(input.categoryId);
      const product = await this.db.product.create({
        data: { ...input, slug: slugify(input.name) },
        include: { category: { select: { name: true } } }
      });
      return toAdminProduct(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("PRODUCT_SLUG_CONFLICT");
      }
      throw error;
    }
  }

  async updateProduct(id: string, input: ProductInput): Promise<AdminProduct> {
    try {
      await this.assertActiveCategory(input.categoryId);
      const product = await this.db.product.update({
        where: { id },
        data: { ...input, slug: slugify(input.name) },
        include: { category: { select: { name: true } } }
      });
      return toAdminProduct(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("PRODUCT_SLUG_CONFLICT");
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<{ imageUrl: string | null }> {
    try {
      const product = await this.db.product.delete({
        where: { id },
        select: { imageUrl: true }
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      throw error;
    }
  }

  async getProductImage(id: string): Promise<string | null> {
    const product = await this.db.product.findUnique({
      where: { id },
      select: { imageUrl: true }
    });
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product.imageUrl;
  }
}
