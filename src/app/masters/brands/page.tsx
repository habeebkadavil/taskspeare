
import { BrandClient } from "./brand-client";
import { brands } from "@/lib/data";

export default function BrandsPage() {
  return <BrandClient initialBrands={brands} />;
}
