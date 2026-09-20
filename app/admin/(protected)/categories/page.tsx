import { CategoryManager } from "@/components/category-manager";
import { menuRepository } from "@/lib/data/repositories";

export default async function CategoriesPage() {
  const categories = await menuRepository.listForAdmin();
  return <CategoryManager categories={categories} />;
}
