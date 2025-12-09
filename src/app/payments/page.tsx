import { PaymentsClient } from "./payments-client";
import { expenses, items, ledgerAccounts } from "@/lib/data";
import { companyDetails } from "@/lib/company";

export default function PaymentsPage() {

  const payableAccounts = ledgerAccounts.filter(acc => acc.type === 'Liability');
  const cashAccounts = ledgerAccounts.filter(acc => acc.type === 'Asset' && acc.name.toLowerCase().includes('cash'));

  return <PaymentsClient 
    initialExpenses={expenses} 
    payableAccounts={payableAccounts}
    cashAccounts={cashAccounts}
    items={items}
    companyDetails={companyDetails}
  />;
}
