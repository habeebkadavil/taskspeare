'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { PlusCircle, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type AppointmentRow = {
  id: string;
  customer: string;
  service: string;
  technician?: string | null;
  booking_type?: string | null;
  store_location?: string | null;
  preferred_date?: string | null;
  notes?: string | null;
  status?: string | null;
  created_by?: string | null;
  created_date?: string | null;
};

type ApiResponse = {
  rows: AppointmentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function AppointmentsListComponent() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer: '',
    service: '',
    technician: '',
    booking_type: 'Onsite',
    store_location: '',
    preferred_date: '',
    notes: '',
    status: 'Scheduled',
  });

  const fetchAppointments = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments?page=${pageNum}&pageSize=${pageSize}`
      );
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data: ApiResponse = await res.json();
      setAppointments(data.rows);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      toast({
        title: 'Error',
        description: String(err),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, [pageSize]);

  const handleCreateAppointment = async () => {
    if (!formData.customer || !formData.service) {
      toast({
        title: 'Validation Error',
        description: 'Customer and Service are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by: 'user',
          preferred_date: formData.preferred_date
            ? new Date(formData.preferred_date).toISOString()
            : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create appointment');
      }

      toast({
        title: 'Success',
        description: 'Appointment created successfully',
      });

      setFormData({
        customer: '',
        service: '',
        technician: '',
        booking_type: 'Onsite',
        store_location: '',
        preferred_date: '',
        notes: '',
        status: 'Scheduled',
      });
      setIsDialogOpen(false);
      fetchAppointments(1);
    } catch (err) {
      toast({
        title: 'Error',
        description: String(err),
        variant: 'destructive',
      });
    }
  };

  const handleEditAppointment = (apt: AppointmentRow) => {
    setEditingId(apt.id);
    setFormData({
      customer: apt.customer,
      service: apt.service,
      technician: apt.technician || '',
      booking_type: apt.booking_type || 'Onsite',
      store_location: apt.store_location || '',
      preferred_date: apt.preferred_date ? new Date(apt.preferred_date).toISOString().slice(0, 16) : '',
      notes: apt.notes || '',
      status: apt.status || 'Scheduled',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!formData.customer || !formData.service) {
      toast({
        title: 'Validation Error',
        description: 'Customer and Service are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData.customer,
          service: formData.service,
          technician: formData.technician || null,
          booking_type: formData.booking_type || null,
          store_location: formData.store_location || null,
          preferred_date: formData.preferred_date ? new Date(formData.preferred_date).toISOString() : null,
          notes: formData.notes || null,
          status: formData.status || 'Scheduled',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update appointment');
      }

      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });

      setIsEditDialogOpen(false);
      setEditingId(null);
      setFormData({
        customer: '',
        service: '',
        technician: '',
        booking_type: 'Onsite',
        store_location: '',
        preferred_date: '',
        notes: '',
        status: 'Scheduled',
      });
      fetchAppointments(page);
    } catch (err) {
      toast({
        title: 'Error',
        description: String(err),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete appointment');

      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });

      fetchAppointments(page);
    } catch (err) {
      toast({
        title: 'Error',
        description: String(err),
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Appointments</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Appointment
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                  Enter appointment details below
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Input
                      id="customer"
                      placeholder="Customer name"
                      value={formData.customer}
                      onChange={(e) =>
                        setFormData({ ...formData, customer: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service *</Label>
                    <Input
                      id="service"
                      placeholder="Service type"
                      value={formData.service}
                      onChange={(e) =>
                        setFormData({ ...formData, service: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="technician">Technician</Label>
                    <Input
                      id="technician"
                      placeholder="Technician name"
                      value={formData.technician}
                      onChange={(e) =>
                        setFormData({ ...formData, technician: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking_type">Booking Type</Label>
                    <Input
                      id="booking_type"
                      placeholder="e.g. Onsite, Customer Location"
                      value={formData.booking_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          booking_type: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store_location">Store Location</Label>
                    <Input
                      id="store_location"
                      placeholder="Store location"
                      value={formData.store_location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          store_location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred Date</Label>
                    <Input
                      id="preferred_date"
                      type="datetime-local"
                      value={formData.preferred_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferred_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    placeholder="e.g. Scheduled, Pending, Completed"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={!formData.customer || !formData.service}
                >
                  Create Appointment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>Update appointment details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customer">Customer *</Label>
                  <Input
                    id="edit-customer"
                    placeholder="Customer name"
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-service">Service *</Label>
                  <Input
                    id="edit-service"
                    placeholder="Service type"
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-technician">Technician</Label>
                  <Input
                    id="edit-technician"
                    placeholder="Technician name"
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData({ ...formData, technician: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-booking_type">Booking Type</Label>
                  <Input
                    id="edit-booking_type"
                    placeholder="e.g. Onsite, Customer Location"
                    value={formData.booking_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        booking_type: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-store_location">Store Location</Label>
                  <Input
                    id="edit-store_location"
                    placeholder="Store location"
                    value={formData.store_location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        store_location: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-preferred_date">Preferred Date</Label>
                  <Input
                    id="edit-preferred_date"
                    type="datetime-local"
                    value={formData.preferred_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferred_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  placeholder="Additional notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Input
                  id="edit-status"
                  placeholder="e.g. Scheduled, Pending, Completed"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={!formData.customer || !formData.service}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CardContent className="space-y-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Booking Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.customer}</TableCell>
                      <TableCell>{apt.service}</TableCell>
                      <TableCell>{apt.technician || '-'}</TableCell>
                      <TableCell>{apt.booking_type || '-'}</TableCell>
                      <TableCell>{apt.store_location || '-'}</TableCell>
                      <TableCell>
                        {apt.preferred_date
                          ? format(new Date(apt.preferred_date), 'MMM dd, HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            apt.status === 'Scheduled'
                              ? 'default'
                              : apt.status === 'Pending'
                              ? 'secondary'
                              : apt.status === 'Completed'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {apt.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {apt.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAppointment(apt)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Showing {appointments.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppointments(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppointments(page + 1)}
                disabled={page >= totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
