
import { CustomersClient } from "./customers-client";
import { customers, ledgerAccounts, technicians, items, sales } from "@/lib/data";

export default function CustomersPage() {
  const accountOptions = ledgerAccounts.filter(acc => acc.type === 'Asset');
  const serviceOptions = items.filter(i => i.category === 'service');

  return <CustomersClient 
    initialCustomers={customers} 
    ledgerAccounts={accountOptions}
    technicians={technicians} 
    services={serviceOptions}
    sales={sales}
    />;
}
