

import { ReportsClient } from "./reports-client";
import { ledgerAccounts, sales, expenses, items, jobOrders, technicians, customers } from "@/lib/data";

export default function ReportsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const serviceItems = items.filter(i => i.itemTypeId === 'type-3');
  const reportId = searchParams?.report as string;

  return <ReportsClient 
    initialReportId={reportId}
    ledgerAccounts={ledgerAccounts} 
    sales={sales}
    expenses={expenses}
    items={items}
    jobOrders={jobOrders}
    technicians={technicians}
    customers={customers}
    services={serviceItems}
  />;
}
