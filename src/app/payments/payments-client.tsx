'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Item, LedgerAccount } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { CompanyDetails } from '@/lib/company';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  date: string;
  amount: number;
  payableAccountId: string;
  cashAccountId: string;
  description: string;
  referenceNumber?: string;
}

export function PaymentsClient({
  initialExpenses,
  payableAccounts,
  cashAccounts,
  items,
  companyDetails,
}: {
  initialExpenses: any[];
  payableAccounts: LedgerAccount[];
  cashAccounts: LedgerAccount[];
  items: Item[];
  companyDetails: CompanyDetails;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterAccount, setFilterAccount] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    payableAccountId: '',
    cashAccountId: '',
    description: '',
    referenceNumber: '',
  });
  const { toast } = useToast();

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchAccount = filterAccount === 'all' || payment.payableAccountId === filterAccount;
      const matchSearch =
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      return matchAccount && matchSearch;
    });
  }, [payments, filterAccount, searchTerm]);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.description || !newPayment.payableAccountId || !newPayment.cashAccountId || newPayment.amount <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
      return;
    }

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      date: newPayment.date,
      amount: newPayment.amount,
      payableAccountId: newPayment.payableAccountId,
      cashAccountId: newPayment.cashAccountId,
      description: newPayment.description,
      referenceNumber: newPayment.referenceNumber,
    };

    setPayments(prev => [...prev, payment]);
    toast({ title: 'Success', description: 'Payment recorded successfully.' });
    setIsAddDialogOpen(false);
    setNewPayment({
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      payableAccountId: '',
      cashAccountId: '',
      description: '',
      referenceNumber: '',
    });
  };

  const handleDelete = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Payment deleted', description: 'The payment has been removed.' });
  };

  const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Record Payment</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>Enter payment details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newPayment.date}
                      onChange={e => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input
                      id="description"
                      value={newPayment.description}
                      onChange={e => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPayment.amount}
                      onChange={e => setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="payable" className="text-right">Pay To</Label>
                    <Select value={newPayment.payableAccountId} onValueChange={id => setNewPayment(prev => ({ ...prev, payableAccountId: id }))}>
                      <SelectTrigger id="payable" className="col-span-3">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {payableAccounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cash" className="text-right">From</Label>
                    <Select value={newPayment.cashAccountId} onValueChange={id => setNewPayment(prev => ({ ...prev, cashAccountId: id }))}>
                      <SelectTrigger id="cash" className="col-span-3">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {cashAccounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Record Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Payments</Label>
                <Input
                  id="search"
                  placeholder="Search by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-filter">Filter by Account</Label>
                <Select value={filterAccount} onValueChange={setFilterAccount}>
                  <SelectTrigger id="account-filter">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {payableAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Pay To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map(payment => {
                  const payableAccount = payableAccounts.find(a => a.id === payment.payableAccountId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{format(new Date(payment.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>{payableAccount?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-right font-semibold">{companyDetails.currencySymbol}{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(payment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end border-t pt-4">
            <div className="text-lg font-bold">Total: {companyDetails.currencySymbol}{totalPayments.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}