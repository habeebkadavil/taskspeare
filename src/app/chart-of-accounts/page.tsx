import { ChartOfAccountsClient } from "./chart-of-accounts-client";
import { ledgerAccounts } from "@/lib/data";

export default function ChartOfAccountsPage() {
  return <ChartOfAccountsClient initialAccounts={ledgerAccounts} />;
}
