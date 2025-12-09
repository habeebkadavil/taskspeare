'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import type { Customer, LedgerAccount, Technician, Item, Sale } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function CustomersClient({
  initialCustomers,
  ledgerAccounts,
  technicians,
  services,
  sales,
}: {
  initialCustomers: Customer[];
  ledgerAccounts: LedgerAccount[];
  technicians: Technician[];
  services: Item[];
  sales: Sale[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTechnicianId: '',
  });
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      return matchSearch;
    });
  }, [customers, searchTerm]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
      return;
    }

    const customer: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      serviceHistory: [],
      ledgerId: ledgerAccounts[0]?.id || '',
      preferredTechnicianId: newCustomer.preferredTechnicianId,
      lastServiceId: '',
    };

    setCustomers(prev => [...prev, customer]);
    toast({ title: 'Success', description: 'Customer added successfully.' });
    setIsAddDialogOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', preferredTechnicianId: '' });
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Customer deleted', description: 'The customer has been removed.' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customers</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Enter the details for a new customer.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={e => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="technician" className="text-right">Preferred Tech</Label>
                    <Select value={newCustomer.preferredTechnicianId} onValueChange={id => setNewCustomer(prev => ({ ...prev, preferredTechnicianId: id }))}>
                      <SelectTrigger id="technician" className="col-span-3">
                        <SelectValue placeholder="Select (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map(tech => (
                          <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Customer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <Label htmlFor="search">Search Customers</Label>
            <Input
              id="search"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Preferred Tech</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map(customer => {
                  const tech = technicians.find(t => t.id === customer.preferredTechnicianId);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://picsum.photos/seed/${customer.name}/200/200`} alt={customer.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{tech?.name || 'None'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}