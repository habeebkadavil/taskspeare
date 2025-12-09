
import { ItemTypeClient } from "./item-type-client";
import { itemTypes } from "@/lib/data";

export default function ItemTypesPage() {
  return <ItemTypeClient initialItemTypes={itemTypes} />;
}
