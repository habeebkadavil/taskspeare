
import { SalesClient } from "./sales-client";
import { sales, customers, items, technicians, users } from "@/lib/data";
import { companyDetails } from "@/lib/company";

// This is a server component, but we're using a hook.
// To make this work, we'd need to wrap it in a client component or move logic.
// For the prototype, we'll assume a way to get the current user on the server.
// Let's simulate getting a user.
const getCurrentUser = () => {
    // In a real app, you'd get this from the session.
    // We'll hardcode a technician user for demonstration.
    return users.find(u => u.id === 'tech-user-1');
}

export default function SalesPage() {
  const allItems = items; // Both inventory and services can be sold
  const currentUser = getCurrentUser();
  const loggedInTechnicianId = currentUser?.technicianId;

  const salesForUser = loggedInTechnicianId 
    ? sales.filter(sale => sale.technicianId === loggedInTechnicianId)
    : sales;

  return <SalesClient 
    initialSales={salesForUser} 
    customers={customers} 
    items={allItems} 
    technicians={technicians}
    companyDetails={companyDetails} 
  />;
}
