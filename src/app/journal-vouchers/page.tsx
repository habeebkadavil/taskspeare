import { JournalVouchersClient } from "./journal-vouchers-client";
import { ledgerAccounts, journalVouchers } from "@/lib/data";
import { companyDetails } from "@/lib/company";

export default function JournalVouchersPage() {

  return <JournalVouchersClient 
    ledgerAccounts={ledgerAccounts}
    companyDetails={companyDetails}
    initialVouchers={journalVouchers}
  />;
}
