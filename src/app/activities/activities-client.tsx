
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Activity, User, JobOrder, Appointment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

export function ActivitiesClient({
  initialActivities,
  users,
  jobOrders,
  appointments,
}: {
  initialActivities: Activity[];
  users: User[];
  jobOrders: JobOrder[];
  appointments: Appointment[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Activity['type']>('Call');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assignedToUserId, setAssignedToUserId] = useState<string | undefined>();
  const [status, setStatus] = useState<Activity['status']>('Pending');
  const [notes, setNotes] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [userFilter, setUserFilter] = useState<string | 'all'>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesStatus =
        statusFilter !== 'all' ? activity.status === statusFilter : true;
      const matchesUser =
        userFilter !== 'all' ? activity.assignedToUserId === userFilter : true;
      return matchesStatus && matchesUser;
    });
  }, [activities, statusFilter, userFilter]);

  const resetForm = () => {
    setSelectedActivity(null);
    setTitle('');
    setType('Call');
    setDueDate(undefined);
    setAssignedToUserId(undefined);
    setStatus('Pending');
    setNotes('');
  };

  const handleOpenForm = (activity?: Activity) => {
    if (activity) {
      setSelectedActivity(activity);
      setTitle(activity.title);
      setType(activity.type);
      setDueDate(new Date(activity.dueDate));
      setAssignedToUserId(activity.assignedToUserId);
      setStatus(activity.status);
      setNotes(activity.notes || '');
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!title || !assignedToUserId || !dueDate) {
      toast({ variant: 'destructive', title: 'Missing required fields.' });
      return;
    }

    const newActivity: Activity = {
      id: selectedActivity ? selectedActivity.id : `act-${Date.now()}`,
      title,
      type,
      dueDate: dueDate.toISOString(),
      assignedToUserId,
      status,
      notes,
    };

    if (selectedActivity) {
      setActivities((prev) =>
        prev.map((act) => (act.id === newActivity.id ? newActivity : act))
      );
      toast({ title: 'Activity updated successfully!' });
    } else {
      setActivities((prev) => [newActivity, ...prev]);
      toast({ title: 'Activity created successfully!' });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      case 'Pending':
      default:
        return 'outline';
    }
  };

  const getRelatedToLink = (relatedTo?: { type: string; id: string }) => {
    if (!relatedTo) return 'N/A';
    if (relatedTo.type === 'job') {
      return `/jobs#${relatedTo.id}`;
    }
    if (relatedTo.type === 'appointment') {
      return `/appointments#${relatedTo.id}`;
    }
    return '#';
  };

  const getRelatedToText = (relatedTo?: { type: string; id: string }) => {
    if (!relatedTo) return 'N/A';
    return `${relatedTo.type.charAt(0).toUpperCase() + relatedTo.type.slice(1)} #${relatedTo.id.substring(0, 5)}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Activities</CardTitle>
            <CardDescription>Manage all tasks and follow-ups.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => handleOpenForm()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Activity
            </span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.title}</TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>
                      {users.find((u) => u.id === activity.assignedToUserId)
                        ?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(activity.dueDate), 'PPP')}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <a href={getRelatedToLink(activity.relatedTo)}>
                          {getRelatedToText(activity.relatedTo)}
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(activity)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Activity</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedActivity ? 'Edit Activity' : 'Add New Activity'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activity-title">Title</Label>
              <Input
                id="activity-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Follow up call with customer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="activity-type">Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as Activity['type'])}>
                        <SelectTrigger id="activity-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Presentation">Presentation</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="activity-status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as Activity['status'])}>
                        <SelectTrigger id="activity-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-assignedTo">Assign To</Label>
                <Select
                  value={assignedToUserId}
                  onValueChange={setAssignedToUserId}
                >
                  <SelectTrigger id="activity-assignedTo">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-notes">Notes</Label>
              <Textarea
                id="activity-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>
              {selectedActivity ? 'Save Changes' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
