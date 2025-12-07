import { getCategories } from "@/lib/queries/category-server";
import { CategoriesMenu } from "@/components/categories-menu";

export async function CategoriesMenuWrapper() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return <CategoriesMenu categories={categories} />;
}

