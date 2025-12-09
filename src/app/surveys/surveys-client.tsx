
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Survey, Customer, JobOrder, Service } from '@/lib/types';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Rating = ({ value }: { value: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

export function SurveysClient({ 
    initialSurveys,
    customers,
    jobOrders,
    services
}: {
    initialSurveys: Survey[],
    customers: Customer[],
    jobOrders: JobOrder[],
    services: Service[]
}) {
    const [surveys, setSurveys] = useState(initialSurveys);

    // Filters
    const [selectedJobId, setSelectedJobId] = useState<string | 'all'>('all');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | 'all'>('all');
    const [minRating, setMinRating] = useState<number | 'all'>('all');
    
    const filteredSurveys = useMemo(() => {
        return surveys.filter(survey => {
            const matchesJob = selectedJobId !== 'all' ? survey.jobId === selectedJobId : true;
            const matchesCustomer = selectedCustomerId !== 'all' ? survey.customerId === selectedCustomerId : true;
            const matchesRating = minRating !== 'all' ? survey.rating >= minRating : true;
            return matchesJob && matchesCustomer && matchesRating;
        });
    }, [surveys, selectedJobId, selectedCustomerId, minRating]);
    

    const getJobServices = (jobId: string) => {
        const job = jobOrders.find(j => j.id === jobId);
        if (!job) return 'N/A';
        return job.services.map(s => services.find(service => service.id === s.serviceId)?.name).join(', ');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Surveys</CardTitle>
                <CardDescription>Feedback received from customers after job completion.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="All Customers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={String(minRating)} onValueChange={(val) => setMinRating(val === 'all' ? 'all' : Number(val))}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Min Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Min Rating</SelectItem>
                            <SelectItem value="1">1 Star & Up</SelectItem>
                            <SelectItem value="2">2 Stars & Up</SelectItem>
                            <SelectItem value="3">3 Stars & Up</SelectItem>
                            <SelectItem value="4">4 Stars & Up</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Comments</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSurveys.map(survey => {
                                const customer = customers.find(c => c.id === survey.customerId);
                                return (
                                    <TableRow key={survey.id}>
                                        <TableCell>{customer?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="link" className="p-0 h-auto font-mono text-xs">{survey.jobId}</Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <h4 className="font-semibold text-sm mb-2">Job Details</h4>
                                                    <p className="text-xs text-muted-foreground">{getJobServices(survey.jobId)}</p>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell><Rating value={survey.rating} /></TableCell>
                                        <TableCell className="max-w-xs truncate">{survey.comments}</TableCell>
                                        <TableCell>{format(new Date(survey.date), 'PPP')}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    );
}
