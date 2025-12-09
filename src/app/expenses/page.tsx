
import { ExpensesClient } from "./expenses-client";
import { expenses, items, ledgerAccounts, itemTypes, taxes } from "@/lib/data";

export default function ExpensesPage() {
  const payableAccounts = ledgerAccounts.filter(acc => acc.type === 'Liability');

  return (
    <div>
      <ExpensesClient 
        initialExpenses={expenses} 
        items={items}
        itemTypes={itemTypes}
        payableAccounts={payableAccounts}
        allLedgerAccounts={ledgerAccounts}
        taxes={taxes}
      />
    </div>
  );
}

    