import { ProductManager } from "@/components/product-manager";
import { menuRepository } from "@/lib/data/repositories";

export default async function ProductsPage() {
  const [products, allCategories] = await Promise.all([
    menuRepository.listProductsForAdmin(),
    menuRepository.listForAdmin()
  ]);
  const categories = allCategories.filter((category) => category.isActive);
  return <ProductManager categories={categories} products={products} />;
}
