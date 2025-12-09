
import { CategoryClient } from "./category-client";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return <CategoryClient initialCategories={categories} />;
}
