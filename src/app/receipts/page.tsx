import { ReceiptsClient } from "./receipts-client";
import { sales, customers, ledgerAccounts } from "@/lib/data";
import { companyDetails } from "@/lib/company";

export default function ReceiptsPage() {

  const cashAccounts = ledgerAccounts.filter(acc => acc.name === 'Cash');

  return <ReceiptsClient 
    initialSales={sales} 
    customers={customers} 
    cashAccounts={cashAccounts}
    companyDetails={companyDetails}
  />;
}
