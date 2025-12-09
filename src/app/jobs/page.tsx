

import { jobOrders, technicians, customers, items, users, surveys } from "@/lib/data";
import { JobOrdersClient } from "./job-orders-client";
import type { Technician, Customer, Service } from "@/lib/types";

// This is a server component, but we're using a hook.
// To make this work, we'd need to wrap it in a client component or move logic.
// For the prototype, we'll assume a way to get the current user on the server.
// Let's simulate getting a user.
const getCurrentUser = () => {
    // In a real app, you'd get this from the session.
    // We'll hardcode a technician user for demonstration.
    return users.find(u => u.id === 'tech-user-1');
}

export default function JobOrdersPage() {
  const currentUser = getCurrentUser();
  const loggedInTechnicianId = currentUser?.technicianId;
  
  const serviceItems = items.filter(i => i.itemTypeId === 'type-3');
  
  const jobsForUser = loggedInTechnicianId 
    ? jobOrders.filter(job => job.technicianId === loggedInTechnicianId)
    : jobOrders;

  const enrichedJobOrders = jobsForUser.map(job => ({
    ...job,
    technician: technicians.find(t => t.id === job.technicianId),
    customer: customers.find(c => c.id === job.customerId),
  }));

  const customerOptions = customers.map(c => ({id: c.id, name: c.name, preferredTechnicianId: c.preferredTechnicianId, lastServiceId: c.lastServiceId}));
  const serviceOptions = serviceItems.map(s => ({id: s.id, name: s.name, price: s.price, taxId: s.taxId}));


  return (
    <div className="w-full">
      <JobOrdersClient 
        initialJobs={enrichedJobOrders} 
        allJobs={jobsForUser} 
        technicians={technicians}
        customers={customerOptions}
        services={serviceOptions}
        surveys={surveys}
      />
    </div>
  );
}
