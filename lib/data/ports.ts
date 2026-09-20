export type MenuProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  sortOrder: number;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  products: MenuProduct[];
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export type CategoryInput = {
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string | null;
};

export class CategoryHasProductsError extends Error {
  constructor() {
    super("Bu kategoriye bağlı ürünler olduğu için silinemiyor.");
    this.name = "CategoryHasProductsError";
  }
}

export type PublicSiteSettings = {
  brandName: string;
  description: string;
  logoUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
};

export type AdminSiteSettings = {
  restaurantName: string;
  description: string;
  logoUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type SiteSettingsInput = AdminSiteSettings;

export interface CategoryRepository {
  listActiveWithProducts(): Promise<PublicCategory[]>;
  listForAdmin(): Promise<AdminCategory[]>;
  create(input: CategoryInput): Promise<AdminCategory>;
  update(id: string, input: CategoryInput): Promise<AdminCategory>;
  delete(id: string): Promise<void>;
}

export interface ProductRepository {
  listProductsForAdmin(): Promise<AdminProduct[]>;
  createProduct(input: ProductInput): Promise<AdminProduct>;
  updateProduct(id: string, input: ProductInput): Promise<AdminProduct>;
  getProductImage(id: string): Promise<string | null>;
  deleteProduct(id: string): Promise<{ imageUrl: string | null }>;
}

export interface SiteSettingsRepository {
  get(): Promise<PublicSiteSettings | null>;
  getForAdmin(): Promise<AdminSiteSettings | null>;
  updateSettings(input: SiteSettingsInput): Promise<AdminSiteSettings>;
}

export type MenuDataSource = CategoryRepository & ProductRepository & SiteSettingsRepository;
