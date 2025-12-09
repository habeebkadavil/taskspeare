
import { InventoryClient } from "./inventory-client";
import { items, ledgerAccounts, taxes, itemTypes, brands, units, categories } from "@/lib/data";

export default function InventoryPage() {
  const accountOptions = ledgerAccounts.filter(acc => acc.type === 'Asset' || acc.type === 'Expense');
  return <InventoryClient 
    initialItems={items} 
    ledgerAccounts={accountOptions}
    taxes={taxes}
    itemTypes={itemTypes}
    brands={brands}
    units={units}
    categories={categories}
  />;
}
