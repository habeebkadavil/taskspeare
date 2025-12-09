
import { TaxClient } from "./tax-client";
import { taxes } from "@/lib/data";

export default function TaxesPage() {
  return <TaxClient initialTaxes={taxes} />;
}
