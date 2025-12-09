
'use client';

import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Appointment, JobOrder, Activity, User, Technician } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import './calendar.css';

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    type: 'appointment' | 'job' | 'activity';
    data: Appointment | JobOrder | Activity;
    customerName?: string;
    technicianName?: string;
    assignedUserName?: string;
  };
  backgroundColor: string;
  borderColor: string;
};

export function CalendarClient({
  initialAppointments,
  initialJobOrders,
  initialActivities,
  users,
  technicians,
  currentUser,
}: {
  initialAppointments: Appointment[];
  initialJobOrders: JobOrder[];
  initialActivities: Activity[];
  users: User[];
  technicians: Technician[];
  currentUser: User | undefined;
}) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const isAdmin = currentUser?.permissions.includes('calendar');
  const userTechnicianId = currentUser?.technicianId;

  const events = useMemo(() => {
    const appointmentEvents: CalendarEvent[] = initialAppointments
      .filter(appt => isAdmin || appt.technicianId === userTechnicianId)
      .map(appt => ({
        id: appt.id,
        title: `Appt: ${users.find(u => u.id === appt.customerId)?.name || 'Unknown'}`,
        start: appt.startTime,
        end: appt.endTime,
        allDay: false,
        extendedProps: {
          type: 'appointment',
          data: appt,
          customerName: users.find(u => u.id === appt.customerId)?.name,
          technicianName: technicians.find(t => t.id === appt.technicianId)?.name,
        },
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary))',
      }));

    const jobOrderEvents: CalendarEvent[] = initialJobOrders
      .filter(job => isAdmin || job.technicianId === userTechnicianId)
      .map(job => ({
        id: job.id,
        title: `Job: ${job.services.map(s => s.serviceId).join(', ')}`,
        start: job.orderDate,
        end: job.deadline,
        allDay: true, // Jobs can be all-day events on the calendar
        extendedProps: {
          type: 'job',
          data: job,
          customerName: users.find(u => u.id === job.customerId)?.name,
          technicianName: technicians.find(t => t.id === job.technicianId)?.name,
        },
        backgroundColor: 'hsl(var(--accent))',
        borderColor: 'hsl(var(--accent))',
      }));
      
    const activityEvents: CalendarEvent[] = initialActivities
        .filter(act => isAdmin || act.assignedToUserId === currentUser?.id)
        .map(act => ({
            id: act.id,
            title: `Activity: ${act.title}`,
            start: act.dueDate,
            end: act.dueDate,
            allDay: true,
            extendedProps: {
                type: 'activity',
                data: act,
                assignedUserName: users.find(u => u.id === act.assignedToUserId)?.name,
            },
            backgroundColor: 'hsl(var(--secondary))',
            borderColor: 'hsl(var(--secondary))',
        }));

    return [...appointmentEvents, ...jobOrderEvents, ...activityEvents];
  }, [initialAppointments, initialJobOrders, initialActivities, isAdmin, userTechnicianId, currentUser, users, technicians]);

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event as CalendarEvent);
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'Scheduled':
        case 'In Progress': 
        case 'Pending':
            return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
};

  const renderEventContent = () => {
    if (!selectedEvent) return null;

    const { type, data, customerName, technicianName, assignedUserName } = selectedEvent.extendedProps;

    switch (type) {
      case 'appointment':
        const appt = data as Appointment;
        return (
          <>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {`For ${customerName} with ${technicianName}`}
            </DialogDescription>
            <div className="space-y-2 py-4 text-sm">
                <p><strong>Status:</strong> <Badge variant={getStatusVariant(appt.status)}>{appt.status}</Badge></p>
                <p><strong>Time:</strong> {format(new Date(appt.startTime), 'p')} - {format(new Date(appt.endTime), 'p')}</p>
                <p><strong>Location:</strong> {appt.bookingType === 'Onsite' ? `Onsite at Store ID ${appt.storeId}` : `Customer Location: ${appt.address}`}</p>
                <p><strong>Notes:</strong> {appt.notes}</p>
            </div>
          </>
        );
      case 'job':
        const job = data as JobOrder;
        return (
          <>
            <DialogTitle>Job Order Details</DialogTitle>
             <DialogDescription>
              {`For ${customerName} by ${technicianName}`}
            </DialogDescription>
             <div className="space-y-2 py-4 text-sm">
                <p><strong>Status:</strong> <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge></p>
                <p><strong>Deadline:</strong> {format(new Date(job.deadline), 'PPP')}</p>
                <p><strong>Notes:</strong> {job.notes}</p>
            </div>
          </>
        );
      case 'activity':
          const activity = data as Activity;
          return (
             <>
                <DialogTitle>Activity Details</DialogTitle>
                <DialogDescription>
                    {`Assigned to ${assignedUserName}`}
                </DialogDescription>
                <div className="space-y-2 py-4 text-sm">
                    <p><strong>Type:</strong> {activity.type}</p>
                    <p><strong>Status:</strong> <Badge variant={getStatusVariant(activity.status)}>{activity.status}</Badge></p>
                    <p><strong>Due Date:</strong> {format(new Date(activity.dueDate), 'PPP')}</p>
                    <p><strong>Notes:</strong> {activity.notes}</p>
                </div>
             </>
          )
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col rounded-none border-0 sm:border sm:rounded-lg">
      <CardHeader className="p-4 md:p-6">
        <CardTitle>Master Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 md:p-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            height="100%"
            themeSystem="standard"
          />
      </CardContent>
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            {renderEventContent()}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
