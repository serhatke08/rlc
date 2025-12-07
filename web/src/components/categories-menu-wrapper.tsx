import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/category-server";
import { CategoriesMenu } from "@/components/categories-menu";

export async function CategoriesMenuWrapper() {
  const supabase = await createSupabaseServerClient();
  
  // Giriş kontrolü - giriş yapmamış kullanıcılar için kategori menüsünü gizle
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Session missing error is normal for anonymous users - silently handle
  if (userError && userError.name !== "AuthSessionMissingError" && userError.status !== 400) {
    console.error("Error checking auth in CategoriesMenuWrapper:", userError);
  }
  
  // Giriş yapmamış kullanıcılar için kategori menüsünü gösterme
  if (!user) {
    return null;
  }
  
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return <CategoriesMenu categories={categories} />;
}

