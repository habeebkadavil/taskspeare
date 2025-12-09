
'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Sparkles,
  Loader2,
  Workflow,
  Pencil,
  ClipboardCheck,
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type {
  Appointment,
  Customer,
  Technician,
  Service,
  JobOrder,
  StoreLocation,
  Activity,
} from '@/lib/types';
import { getAvailableSlots } from '../actions';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { useQuickAddStore } from '@/hooks/use-quick-add-store';
import { users } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

type EnrichedAppointment = Appointment & {
  customerName: string;
  technicianName: string;
  serviceName: string;
};

export function AppointmentsClient({
  initialAppointments,
  customers,
  technicians,
  services,
  stores,
  activities,
}: {
  initialAppointments: Appointment[];
  customers: Customer[];
  technicians: Technician[];
  services: Service[];
  stores: StoreLocation[];
  activities: Activity[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isJobOrderOpen, setIsJobOrderOpen] = useState(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | EnrichedAppointment | null
  >(null);

  // Form states for booking
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>();
  const [selectedServiceId, setSelectedServiceId] = useState<string>();
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    new Date()
  );
  const [bookingType, setBookingType] = useState<'Onsite' | 'Customer Location'>('Onsite');
  const [address, setAddress] = useState('');
  const [storeId, setStoreId] = useState<string>();
  const [notes, setNotes] = useState('');

  // Form states for editing
  const [editStatus, setEditStatus] = useState<Appointment['status']>();

  // AI Slot finder states
  const [isPending, startTransition] = useTransition();
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>();

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { toast } = useToast();
  const { open: openQuickAdd } = useQuickAddStore();

  const handleEditClick = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
    setEditStatus(appointment.status);
    setIsEditDialogOpen(true);
  };

  const handleConvertToJobClick = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
    openQuickAdd('add-job');
  };

  const handleActivityHistoryClick = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
    setIsActivityHistoryOpen(true);
  };

  const handleFindSlots = () => {
    if (!selectedTechnicianId || !selectedServiceId || !appointmentDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please select a technician, service, and preferred date to find slots.',
      });
      return;
    }

    const service = services.find((s) => s.id === selectedServiceId);
    // Assuming a fixed duration for now. This could come from the service data.
    const serviceDuration = 60;

    startTransition(async () => {
      const result = await getAvailableSlots(
        selectedTechnicianId,
        serviceDuration,
        appointmentDate.toISOString()
      );
      if (result.success) {
        setSuggestedSlots(result.data);
        toast({
          title: 'Slots Found',
          description: 'Available slots are shown below.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };

  const enrichedAppointments = useMemo(() => {
    return appointments
      .map((appt) => ({
        ...appt,
        customerName:
          customers.find((c) => c.id === appt.customerId)?.name || 'Unknown',
        technicianName:
          technicians.find((t) => t.id === appt.technicianId)?.name || 'Unknown',
        serviceName:
          services.find((s) => s.id === appt.serviceId)?.name || 'Unknown',
      }))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [appointments, customers, technicians, services]);

  const filteredAppointments = useMemo(() => {
    return enrichedAppointments.filter((appt) => {
      const matchesStatus = statusFilter !== 'all' ? appt.status === statusFilter : true;

      const apptDate = new Date(appt.startTime);
      const matchesDate = dateRange?.from
        ? isWithinInterval(apptDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to || dateRange.from),
          })
        : true;
      return matchesStatus && matchesDate;
    });
  }, [enrichedAppointments, statusFilter, dateRange]);

  const appointmentActivities = selectedAppointment
    ? activities.filter((a) => a.relatedTo?.id === selectedAppointment.id)
    : [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Scheduled':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const renderDialogContent = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogDescription>
          Find and book a new time slot for a customer.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select onValueChange={setSelectedCustomerId}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="service">Service</Label>
            <Select onValueChange={setSelectedServiceId}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="technician">Technician</Label>
            <Select onValueChange={setSelectedTechnicianId}>
              <SelectTrigger id="technician">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !appointmentDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? (
                    format(appointmentDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleFindSlots}
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Find Available Slots with AI
            </Button>
          </div>
        </div>

        {suggestedSlots.length > 0 && (
          <div className="space-y-2">
            <Label>Available Slots</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? 'default' : 'outline'}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {format(new Date(slot), 'p')}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
            <Label>Booking Type</Label>
            <Select value={bookingType} onValueChange={(value) => setBookingType(value as 'Onsite' | 'Customer Location')}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Onsite">Visit Store</SelectItem>
                    <SelectItem value="Customer Location">Onsite Service</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {bookingType === 'Onsite' && (
            <div className="space-y-2">
                <Label htmlFor="store">Store Location</Label>
                <Select value={storeId} onValueChange={setStoreId}>
                    <SelectTrigger id="store"><SelectValue placeholder="Select store"/></SelectTrigger>
                    <SelectContent>
                        {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        )}

        {bookingType === 'Customer Location' && (
            <div className="space-y-2">
                <Label htmlFor="address">Customer Address</Label>
                <Textarea id="address" placeholder="Enter full address" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
        )}

        <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Any additional notes or requests" value={notes} onChange={e => setNotes(e.target.value)}/>
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => {
            setIsBookDialogOpen(false);
            toast({ title: 'Appointment Booked!' });
          }}
          disabled={!selectedSlot}
        >
          Book Appointment
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              Manage your scheduled appointments.
            </CardDescription>
          </div>
          <Dialog
            open={isBookDialogOpen}
            onOpenChange={setIsBookDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Book Appointment</Button>
            </DialogTrigger>
            {renderDialogContent()}
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full md:w-[300px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.serviceName}</TableCell>
                    <TableCell>{appt.customerName}</TableCell>
                    <TableCell>{appt.technicianName}</TableCell>
                    <TableCell>
                      {format(new Date(appt.startTime), 'Pp')}
                    </TableCell>
                    <TableCell>
                      {appt.bookingType === 'Onsite'
                        ? stores.find(s => s.id === appt.storeId)?.name || 'Store'
                        : 'Customer'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(appt.status)}>
                        {appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConvertToJobClick(appt)}
                      >
                        <Workflow className="h-4 w-4" />
                        <span className="sr-only">Convert to Job Order</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleActivityHistoryClick(appt)}
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        <span className="sr-only">View Activities</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(appt)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Appointment</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isActivityHistoryOpen} onOpenChange={setIsActivityHistoryOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Activity History</DialogTitle>
                 <DialogDescription>
                    Activities related to appointment #{selectedAppointment?.id.substring(0,5)}
                 </DialogDescription>
            </DialogHeader>
             <div className="py-4 max-h-[60vh] overflow-y-auto">
                 {appointmentActivities.length > 0 ? (
                    <div className="space-y-4">
                        {appointmentActivities.map(activity => (
                            <div key={activity.id} className="flex items-start gap-4">
                                <div className="flex-1">
                                    <p className="font-medium">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">{users.find(u => u.id === activity.assignedToUserId)?.name} - Due: {format(new Date(activity.dueDate), 'PPP')}</p>
                                    <p className="text-sm">{activity.notes}</p>
                                </div>
                                <Badge variant={getStatusVariant(activity.status)}>{activity.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No activities for this appointment.</p>
                )}
             </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => {
                    setIsActivityHistoryOpen(false);
                    // In a real app you might open a more specific form
                    // for now, just a toast
                    toast({title: "New Activity form would open here."});
                }}>
                    Add Activity
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status">Status</Label>
            <Select value={editStatus} onValueChange={(value) => setEditStatus(value as Appointment['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setIsEditDialogOpen(false);
              toast({title: 'Appointment status updated.'})
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
