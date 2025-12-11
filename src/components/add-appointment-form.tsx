'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button as PopoverButton } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const AddAppointmentForm = ({ onSave }: { onSave: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('');
  const [technician, setTechnician] = useState('');
  const [bookingType, setBookingType] = useState('Onsite');
  const [storeLocation, setStoreLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Scheduled');

  const handleSubmit = async () => {
    if (!customer || !service) {
      toast({
        title: 'Validation Error',
        description: 'Customer and Service are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          service,
          technician: technician || undefined,
          booking_type: bookingType,
          store_location: storeLocation || undefined,
          preferred_date: preferredDate ? preferredDate.toISOString() : undefined,
          notes: notes || undefined,
          status,
          created_by: 'quick-add',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appointment');
      }

      toast({
        title: 'Success',
        description: 'Appointment created successfully.',
      });

      // Reset form
      setCustomer('');
      setService('');
      setTechnician('');
      setBookingType('Onsite');
      setStoreLocation('');
      setPreferredDate(undefined);
      setNotes('');
      setStatus('Scheduled');

      onSave();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create appointment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Input
            id="customer"
            placeholder="Customer name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Service *</Label>
          <Input
            id="service"
            placeholder="Service type"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="technician">Technician</Label>
          <Input
            id="technician"
            placeholder="Technician name"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-type">Booking Type</Label>
          <Select value={bookingType} onValueChange={setBookingType}>
            <SelectTrigger id="booking-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Onsite">Onsite</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Walk-in">Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-location">Store Location</Label>
        <Input
          id="store-location"
          placeholder="Location"
          value={storeLocation}
          onChange={(e) => setStoreLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Preferred Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <PopoverButton
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !preferredDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {preferredDate ? format(preferredDate, 'PPP') : <span>Pick a date</span>}
              </PopoverButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={preferredDate} onSelect={setPreferredDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Appointment'}
        </Button>
      </DialogFooter>
    </div>
  );
};
