
import { AppointmentsClient } from "./appointments-client";
import { appointments, customers, technicians, items, stores, activities } from "@/lib/data";

export default function AppointmentsPage() {
    const serviceItems = items.filter(i => i.itemTypeId === 'type-3');

    return <AppointmentsClient 
        initialAppointments={appointments}
        customers={customers}
        technicians={technicians}
        services={serviceItems}
        stores={stores}
        activities={activities}
    />;
}
