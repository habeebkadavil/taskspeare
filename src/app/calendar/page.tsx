
import { CalendarClient } from './calendar-client';
import { activities, appointments, jobOrders, users, technicians } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';

export default function CalendarPage() {
  const currentUser = getCurrentUser();

  return (
      <CalendarClient
        initialAppointments={appointments}
        initialJobOrders={jobOrders}
        initialActivities={activities}
        users={users}
        technicians={technicians}
        currentUser={currentUser}
      />
  );
}
