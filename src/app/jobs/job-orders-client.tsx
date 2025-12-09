

'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Loader2, Pencil, Search, CalendarIcon, PlusCircle, FileText, Trash2, MessageSquare, Play, Square, History, Star, ClipboardCheck, Upload } from 'lucide-react';
import type { PrioritizedJobOrder, JobOrder, Service, Technician, JobOrderService, TimeEntry, Survey, Activity, Customer as CustomerType } from '@/lib/types';
import { getPrioritizedTasks } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, formatDistance } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { SalesClient } from '../sales/sales-client';
import { companyDetails } from '@/lib/company';
import { taxes, users, activities as allActivities } from '@/lib/data';
import { useQuickAddStore } from '@/hooks/use-quick-add-store';
import { useUser } from '@/firebase';

type EnrichedJobOrder = PrioritizedJobOrder & {
  technician?: { id: string, name: string, avatarUrl: string };
  customer?: { id: string, name: string };
};

type JobOrdersClientProps = {
    initialJobs: EnrichedJobOrder[];
    allJobs: JobOrder[];
    technicians: Technician[];
    customers: {id: string, name: string, preferredTechnicianId?: string, lastServiceId?: string}[];
    services: {id: string, name: string, price: number, taxId?: string}[];
    surveys: Survey[];
    isDialog?: boolean;
    onDialogClose?: () => void;
    defaultJob?: {
        customerId: string;
        technicianId?: string;
        services: JobOrderService[];
        notes?: string;
        orderDate?: string;
    };
};

export function JobOrdersClient({ 
  initialJobs, 
  allJobs, 
  technicians, 
  customers, 
  services,
  surveys: initialSurveys,
  isDialog = false,
  onDialogClose,
  defaultJob,
}: JobOrdersClientProps) {
  const [jobs, setJobs] = useState<EnrichedJobOrder[]>(initialJobs);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertToInvoiceOpen, setConvertToInvoiceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<EnrichedJobOrder | null>(null);
  const { open: openQuickAdd } = useQuickAddStore();
  const { user: currentUser } = useUser();

  const [orderDate, setOrderDate] = useState<Date | undefined>();
  const [deadline, setDeadline] = useState<Date | undefined>();
  
  const [surveys, setSurveys] = useState(initialSurveys);
  const [surveyRating, setSurveyRating] = useState(0);
  const [surveyComments, setSurveyComments] = useState('');
  const [serviceFeedback, setServiceFeedback] = useState<{[key: string]: { photoUrl?: string }}>({});

  const [activities, setActivities] = useState(allActivities);


  // State for new/edit job forms
  const [currentServices, setCurrentServices] = useState<JobOrderService[]>([]);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | undefined>();
  const [currentTechnicianId, setCurrentTechnicianId] = useState<string | undefined>();
  const [currentStatus, setCurrentStatus] = useState<string | undefined>();
  const [currentNotes, setCurrentNotes] = useState<string | undefined>();

  // State for Activity form
    const [activityTitle, setActivityTitle] = useState('');
    const [activityType, setActivityType] = useState<Activity['type']>('Call');
    const [activityDueDate, setActivityDueDate] = useState<Date | undefined>();
    const [activityAssignedTo, setActivityAssignedTo] = useState<string | undefined>();
    const [activityNotes, setActivityNotes] = useState('');

  useEffect(() => {
    if (isDialog && defaultJob) {
        setCurrentCustomerId(defaultJob.customerId);
        setCurrentTechnicianId(defaultJob.technicianId);
        setCurrentServices(defaultJob.services);
        setCurrentNotes(defaultJob.notes);
        setOrderDate(defaultJob.orderDate ? new Date(defaultJob.orderDate) : new Date());
        setDeadline(new Date());
    }
  }, [isDialog, defaultJob]);


  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedService, setSelectedService] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');

  const handleEditClick = (job: EnrichedJobOrder) => {
    setSelectedJob(job);
    setOrderDate(new Date(job.orderDate));
    setDeadline(new Date(job.deadline));
    setCurrentServices(job.services);
    setCurrentCustomerId(job.customerId);
    setCurrentTechnicianId(job.technicianId);
    setCurrentStatus(job.status);
    setCurrentNotes(job.notes);
    setIsEditDialogOpen(true);
  };
  

  const handleConvertToInvoiceClick = (job: EnrichedJobOrder) => {
    setSelectedJob(job);
    setConvertToInvoiceOpen(true);
  }

  const handleHistoryClick = (job: EnrichedJobOrder) => {
    setSelectedJob(job);
    setIsHistoryOpen(true);
  }

  const handleActivityHistoryClick = (job: EnrichedJobOrder) => {
    setSelectedJob(job);
    setIsActivityHistoryOpen(true);
  };
  
  const handleStatusUpdate = (activityId: string, newStatus: Activity['status']) => {
    setActivities(prev => prev.map(act => act.id === activityId ? { ...act, status: newStatus } : act));
    toast({ title: 'Activity status updated!' });
  };

  const handleOpenAddActivity = () => {
    // Reset form fields
    setActivityTitle('');
    setActivityType('Call');
    setActivityDueDate(undefined);
    setActivityAssignedTo(undefined);
    setActivityNotes('');
    setIsActivityOpen(true);
  };

  const handleActivitySubmit = () => {
      if (!selectedJob || !activityTitle || !activityAssignedTo || !activityDueDate) {
        toast({ variant: 'destructive', title: 'Missing fields' });
        return;
      }
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        title: activityTitle,
        type: activityType,
        dueDate: activityDueDate.toISOString(),
        assignedToUserId: activityAssignedTo,
        status: 'Pending',
        notes: activityNotes,
        relatedTo: { type: 'job', id: selectedJob.id }
      };
      setActivities(prev => [newActivity, ...prev]);
      toast({ title: 'Activity created' });
      setIsActivityOpen(false);
  }

  const handleSurveyClick = (job: EnrichedJobOrder) => {
    setSelectedJob(job);
    const existingSurvey = surveys.find(s => s.jobId === job.id);
    setSurveyRating(existingSurvey?.rating || 0);
    setSurveyComments(existingSurvey?.comments || '');
    
    const initialFeedback: {[key: string]: { photoUrl?: string }} = {};
    if (existingSurvey?.serviceFeedback) {
        existingSurvey.serviceFeedback.forEach(fb => {
            initialFeedback[fb.serviceId] = { photoUrl: fb.photoUrl };
        });
    }
    setServiceFeedback(initialFeedback);

    setIsSurveyOpen(true);
  };

  const handleSurveySubmit = () => {
    if (!selectedJob) return;

    const newSurvey: Survey = {
        id: `survey-${Date.now()}`,
        jobId: selectedJob.id,
        customerId: selectedJob.customerId,
        rating: surveyRating,
        comments: surveyComments,
        date: new Date().toISOString(),
        serviceFeedback: Object.entries(serviceFeedback).map(([serviceId, feedback]) => ({
            serviceId,
            photoUrl: feedback.photoUrl,
        })),
    };

    // In a real app, this would be an API call.
    setSurveys(prev => {
        const existing = prev.find(s => s.jobId === selectedJob.id);
        if (existing) {
            return prev.map(s => s.jobId === selectedJob.id ? { ...s, ...newSurvey, id: s.id } : s);
        }
        return [...prev, newSurvey];
    });

    toast({
        title: "Survey Submitted",
        description: "Thank you for the feedback!",
    });
    setIsSurveyOpen(false);
  };

  const handlePhotoUpload = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceFeedback(prev => ({
          ...prev,
          [serviceId]: { ...prev[serviceId], photoUrl: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleToggleTimer = (jobId: string) => {
      setJobs(prevJobs => prevJobs.map(job => {
          if (job.id === jobId) {
              const now = new Date().toISOString();
              const newTimeEntries = [...job.timeEntries];
              const activeEntry = newTimeEntries.find(entry => entry.endTime === null);

              if (activeEntry) {
                  // Stop the timer
                  activeEntry.endTime = now;
              } else {
                  // Start a new timer
                  newTimeEntries.push({ startTime: now, endTime: null });
              }
              
              return { ...job, timeEntries: newTimeEntries, status: 'In Progress' };
          }
          return job;
      }));
  }

  const handlePrioritize = () => {
    startTransition(async () => {
      const result = await getPrioritizedTasks(allJobs);
      if (result.success) {
        const priorityMap = new Map(result.data.map((p: any) => [p.taskId, { priorityScore: p.priorityScore, reason: p.reason }]));
        
        const enriched = initialJobs.map(job => {
            const priorityInfo = priorityMap.get(job.id);
            return {
                ...job,
                priorityScore: priorityInfo?.priorityScore,
                reason: priorityInfo?.reason,
            };
        });

        const updatedJobs = enriched.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
        
        setJobs(updatedJobs);
        toast({
          title: "Success",
          description: "Tasks have been prioritized by AI.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  };
  
  const currentPrice = useMemo(() => {
    return currentServices.reduce((total, service) => total + service.price, 0);
  }, [currentServices]);


  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const jobServiceNames = job.services.map(s => services.find(service => service.id === s.serviceId)?.name || '');
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm ? (
        job.id.toLowerCase().includes(searchLower) ||
        jobServiceNames.some(name => name.toLowerCase().includes(searchLower)) ||
        job.customer?.name.toLowerCase().includes(searchLower) ||
        job.technician?.name.toLowerCase().includes(searchLower) ||
        job.notes.toLowerCase().includes(searchLower)
      ) : true;

      // Date range filter
      const jobDate = new Date(job.orderDate);
      const matchesDate = dateRange ? (
        (!dateRange.from || jobDate >= dateRange.from) &&
        (!dateRange.to || jobDate <= dateRange.to)
      ) : true;

      // Service filter
      const matchesService = selectedService !== 'all' ? job.services.some(s => s.serviceId === selectedService) : true;
      
      // Customer filter
      const matchesCustomer = selectedCustomer !== 'all' ? job.customerId === selectedCustomer : true;

      return matchesSearch && matchesDate && matchesService && matchesCustomer;
    });
  }, [jobs, searchTerm, dateRange, selectedService, selectedCustomer, services]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeClass = (score?: number) => {
    if (score === undefined) return 'hidden';
    if (score > 7) return 'bg-red-500 text-white';
    if (score > 4) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };
  
  const getServiceNames = (jobServices: JobOrderService[]) => {
    return jobServices.map(js => services.find(s => s.id === js.serviceId)?.name).join(', ');
  }
  
  const { firstStartTime, lastEndTime } = useMemo(() => {
    if (!selectedJob || selectedJob.timeEntries.length === 0) {
      return { firstStartTime: null, lastEndTime: null };
    }
    const startTimes = selectedJob.timeEntries.map(e => new Date(e.startTime).getTime());
    const endTimes = selectedJob.timeEntries.filter(e => e.endTime).map(e => new Date(e.endTime!).getTime());

    const firstStart = Math.min(...startTimes);
    const lastEnd = endTimes.length > 0 ? Math.max(...endTimes) : null;
    
    return {
      firstStartTime: format(new Date(firstStart), 'Pp'),
      lastEndTime: lastEnd ? format(new Date(lastEnd), 'Pp') : 'In Progress'
    };

  }, [selectedJob]);

  const jobActivities = selectedJob ? activities.filter(a => a.relatedTo?.id === selectedJob.id) : [];


  const renderJobDialogContent = () => (
    <>
      <DialogHeader>
          <DialogTitle>{(selectedJob || defaultJob) ? `Edit Job Order` : 'Add New Job Order'}</DialogTitle>
          <DialogDescription>{(selectedJob || defaultJob) ? 'Update the details for this job.' : 'Enter the details for the new job.'}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
        {/* Customer and Technician selection */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={currentCustomerId} onValueChange={setCurrentCustomerId}>
                <SelectTrigger id="customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="technician">Technician</Label>
              <Select value={currentTechnicianId} onValueChange={setCurrentTechnicianId}>
                <SelectTrigger id="technician"><SelectValue placeholder="Select technician" /></SelectTrigger>
                <SelectContent>{technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
            <Label>Services</Label>
            <div className="space-y-2 rounded-md border p-4">
              {currentServices.map((service, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <Select 
                      value={service.serviceId} 
                      onValueChange={(val) => {
                        const newServices = [...currentServices];
                        const selectedService = services.find(s => s.id === val);
                        newServices[index] = { serviceId: val, price: selectedService?.price || 0 };
                        setCurrentServices(newServices);
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-sm font-medium">{companyDetails.currencySymbol}{service.price.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentServices(currentServices.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentServices([...currentServices, { serviceId: '', price: 0 }])} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button>
            </div>
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order Date</Label>
              <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !orderDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={orderDate} onSelect={setOrderDate} initialFocus/></PopoverContent></Popover>
            </div>
            <div>
              <Label>Deadline</Label>
              <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{deadline ? format(deadline, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus/></PopoverContent></Popover>
            </div>
        </div>
        
        {selectedJob && (
           <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Start Time</Label>
              <Input value={firstStartTime || 'Not Started'} readOnly disabled />
            </div>
            <div>
              <Label>Last End Time</Label>
              <Input value={lastEndTime || 'Not Finished'} readOnly disabled />
            </div>
          </div>
        )}

        {/* Status */}
        <div>
            <Label htmlFor="status">Status</Label>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent>
            </Select>
        </div>
        
        {/* Notes */}
        <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Any specific instructions..." value={currentNotes} onChange={(e) => setCurrentNotes(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold">Total: {companyDetails.currencySymbol}{currentPrice.toFixed(2)}</span>
          <Button type="submit" onClick={() => (selectedJob ? setIsEditDialogOpen(false) : onDialogClose?.())}>Save Job</Button>
        </div>
      </DialogFooter>
    </>
  );

  if (isDialog) {
    return (
        <DialogContent className="sm:max-w-2xl">
            {renderJobDialogContent()}
        </DialogContent>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Job Orders</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1" onClick={() => openQuickAdd('add-job')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Job</span>
            </Button>
            <Button onClick={handlePrioritize} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Prioritize with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <div className="relative w-full md:w-auto flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search orders by ID, service, customer..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
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
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job #</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const isJobRunning = job.timeEntries.some(entry => entry.endTime === null);
                  return (
                      <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">{job.id}</TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={job.technician?.avatarUrl} alt={job.technician?.name} data-ai-hint="person portrait" />
                              <AvatarFallback>{job.technician?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{job.technician?.name}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="font-medium">{getServiceNames(job.services)}</div>
                          <div className="text-sm text-muted-foreground">{job.notes}</div>
                      </TableCell>
                      <TableCell>{job.customer?.name}</TableCell>
                      <TableCell>{companyDetails.currencySymbol}{job.price.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(job.deadline), 'PPP')}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                      </TableCell>
                      <TableCell>
                          <div className="flex flex-col">
                          <Badge className={cn('w-fit', getPriorityBadgeClass(job.priorityScore))}>
                              {job.priorityScore !== undefined ? `Score: ${job.priorityScore}` : ''}
                          </Badge>
                          {job.reason && <span className="text-xs text-muted-foreground mt-1">{job.reason}</span>}
                          </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button
                              variant={isJobRunning ? "destructive" : "outline"}
                              size="icon"
                              onClick={() => handleToggleTimer(job.id)}
                              disabled={job.status === 'Completed' || job.status === 'Cancelled'}
                          >
                              {isJobRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              <span className="sr-only">{isJobRunning ? "Stop Timer" : "Start Timer"}</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleHistoryClick(job)}>
                              <History className="h-4 w-4" />
                              <span className="sr-only">View Time History</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActivityHistoryClick(job)}>
                              <ClipboardCheck className="h-4 w-4" />
                              <span className="sr-only">View Activities</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleSurveyClick(job)} disabled={job.status !== 'Completed'}>
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Survey</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleConvertToInvoiceClick(job)}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Convert to Invoice</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(job)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                          </Button>
                      </TableCell>
                      </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            {renderJobDialogContent()}
        </DialogContent>
      </Dialog>
      <Dialog open={isConvertToInvoiceOpen} onOpenChange={setConvertToInvoiceOpen}>
        <SalesClient
            initialSales={[]}
            customers={customers}
            items={services}
            technicians={technicians}
            companyDetails={companyDetails}
            isDialog={true}
            defaultSale={selectedJob ? {
                customerId: selectedJob.customerId,
                technicianId: selectedJob.technicianId,
                items: selectedJob.services.map(s => ({
                    itemId: s.serviceId,
                    quantity: 1,
                    price: s.price,
                    taxRate: taxes.find(t => t.id === services.find(srv => srv.id === s.serviceId)?.taxId)?.rate || 0
                }))
            } : undefined}
            onDialogClose={() => setConvertToInvoiceOpen(false)}
        />
      </Dialog>
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time History for Job #{selectedJob?.id}</DialogTitle>
            <DialogDescription>
              A log of all work sessions for this job.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedJob && selectedJob.timeEntries.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead className="text-right">Duration</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedJob.timeEntries.map((entry, index) => (
                            <TableRow key={index}>
                                <TableCell>{format(new Date(entry.startTime), 'Pp')}</TableCell>
                                <TableCell>{entry.endTime ? format(new Date(entry.endTime), 'Pp') : 'Running...'}</TableCell>
                                <TableCell className="text-right">
                                    {entry.endTime ? formatDistance(new Date(entry.endTime), new Date(entry.startTime)) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-center text-muted-foreground">No time entries logged for this job yet.</p>
            )}
          </div>
           <DialogFooter>
                <Button onClick={() => setIsHistoryOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isActivityHistoryOpen} onOpenChange={setIsActivityHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity History for Job #{selectedJob?.id.substring(0,5)}</DialogTitle>
            <DialogDescription>A log of all activities related to this job.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {jobActivities.length > 0 ? (
                <div className="space-y-4">
                    {jobActivities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-4">
                            <div className="flex-1">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{users.find(u => u.id === activity.assignedToUserId)?.name} - Due: {format(new Date(activity.dueDate), 'PPP')}</p>
                                <p className="text-sm">{activity.notes}</p>
                            </div>
                            {activity.assignedToUserId === currentUser?.uid ? (
                                <Select value={activity.status} onValueChange={(newStatus) => handleStatusUpdate(activity.id, newStatus as Activity['status'])}>
                                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant={getStatusVariant(activity.status)}>{activity.status}</Badge>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">No activities for this job.</p>
            )}
          </div>
           <DialogFooter>
                <Button variant="outline" onClick={handleOpenAddActivity}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
       <Dialog open={isSurveyOpen} onOpenChange={setIsSurveyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Survey</DialogTitle>
            <DialogDescription>
              Feedback for Job #{selectedJob?.id.substring(0,5)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                        <Button key={rating} variant="ghost" size="icon" onClick={() => setSurveyRating(rating)}>
                            <Star className={cn("h-6 w-6", rating <= surveyRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                        </Button>
                    ))}
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="survey-comments">Comments</Label>
                <Textarea 
                    id="survey-comments" 
                    placeholder="Any additional feedback..." 
                    value={surveyComments}
                    onChange={(e) => setSurveyComments(e.target.value)}
                />
            </div>
            <div className="space-y-4">
                <Label>Service Feedback & Photos</Label>
                <div className="space-y-4">
                    {selectedJob?.services.map(service => {
                        const serviceDetails = services.find(s => s.id === service.serviceId);
                        const feedback = serviceFeedback[service.serviceId];
                        return (
                            <div key={service.serviceId} className="p-3 border rounded-md">
                                <p className="font-semibold">{serviceDetails?.name}</p>
                                <div className="flex items-center gap-4 mt-2">
                                     <Input id={`photo-${service.serviceId}`} type="file" className="hidden" onChange={(e) => handlePhotoUpload(service.serviceId, e)} accept="image/*" />
                                     <Label htmlFor={`photo-${service.serviceId}`} className={cn( 'cursor-pointer', 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', 'border border-input bg-background hover:bg-accent hover:text-accent-foreground', 'h-10 px-4 py-2' )}>
                                        <Upload className="h-4 w-4" /> Upload Photo
                                    </Label>
                                    {feedback?.photoUrl && (
                                        <div className="w-16 h-16 rounded-md overflow-hidden relative">
                                            <Image src={feedback.photoUrl} alt="Service photo preview" layout="fill" objectFit="cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="space-y-2">
                <Label>Related Activities</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {jobActivities.length > 0 ? (
                    jobActivities.map(activity => (
                        <div key={activity.id} className="flex justify-between items-center text-sm py-1">
                            <p>{activity.title}</p>
                            <Badge variant={getStatusVariant(activity.status)}>{activity.status}</Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No related activities.</p>
                )}
                </div>
            </div>
          </div>
           <DialogFooter>
                <Button onClick={handleSurveySubmit}>Submit Survey</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity for Job #{selectedJob?.id.substring(0,5)}</DialogTitle>
            <DialogDescription>
              Create a new activity related to this job.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-title" className="text-right">Title</Label>
                    <Input id="activity-title" value={activityTitle} onChange={(e) => setActivityTitle(e.target.value)} className="col-span-3" placeholder="e.g., Follow up call" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-type" className="text-right">Type</Label>
                    <Select value={activityType} onValueChange={(v) => setActivityType(v as Activity['type'])}><SelectTrigger id="activity-type" className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Call">Call</SelectItem><SelectItem value="Follow-up">Follow-up</SelectItem><SelectItem value="Meeting">Meeting</SelectItem><SelectItem value="Presentation">Presentation</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-assignedTo" className="text-right">Assign To</Label>
                    <Select value={activityAssignedTo} onValueChange={setActivityAssignedTo}><SelectTrigger id="activity-assignedTo" className="col-span-3"><SelectValue placeholder="Select user" /></SelectTrigger><SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-dueDate" className="text-right">Due Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !activityDueDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{activityDueDate ? format(activityDueDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={activityDueDate} onSelect={setActivityDueDate} initialFocus /></PopoverContent></Popover>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="activity-notes" className="text-right pt-2">Notes</Label>
                    <Textarea id="activity-notes" value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)} className="col-span-3" placeholder="Add any relevant notes..." />
                </div>
          </div>
           <DialogFooter>
                <Button onClick={handleActivitySubmit}>Save Activity</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
