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
import type { Item, ItemType, LedgerAccount, Tax } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  payableAccountId: string;
  itemId?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Paid';
  notes?: string;
}

export function ExpensesClient({
  initialExpenses,
  items,
  itemTypes,
  payableAccounts,
  allLedgerAccounts,
  taxes,
}: {
  initialExpenses: Expense[];
  items: Item[];
  itemTypes: ItemType[];
  payableAccounts: LedgerAccount[];
  allLedgerAccounts: LedgerAccount[];
  taxes: Tax[];
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: 0,
    payableAccountId: '',
    itemId: '',
    status: 'Draft' as const,
  });
  const { toast } = useToast();

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchStatus = filterStatus === 'all' || expense.status === filterStatus;
      const matchSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [expenses, filterStatus, searchTerm]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.payableAccountId || newExpense.amount <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
      return;
    }

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      date: newExpense.date,
      description: newExpense.description,
      amount: newExpense.amount,
      payableAccountId: newExpense.payableAccountId,
      itemId: newExpense.itemId,
      status: newExpense.status,
    };

    setExpenses(prev => [...prev, expense]);
    toast({ title: 'Success', description: 'Expense added successfully.' });
    setIsAddDialogOpen(false);
    setNewExpense({
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      amount: 0,
      payableAccountId: '',
      itemId: '',
      status: 'Draft',
    });
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Expense deleted', description: 'The expense has been removed.' });
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expenses</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Enter the details for a new expense.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={e => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input
                      id="description"
                      value={newExpense.description}
                      onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={e => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account" className="text-right">Account</Label>
                    <Select value={newExpense.payableAccountId} onValueChange={id => setNewExpense(prev => ({ ...prev, payableAccountId: id }))}>
                      <SelectTrigger id="account" className="col-span-3">
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
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={newExpense.status} onValueChange={s => setNewExpense(prev => ({ ...prev, status: s as any }))}>
                      <SelectTrigger id="status" className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Expense</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Expenses</Label>
                <Input
                  id="search"
                  placeholder="Search by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map(expense => {
                  const account = allLedgerAccounts.find(a => a.id === expense.payableAccountId);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{account?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-right font-semibold">₹{expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={expense.status === 'Paid' ? 'default' : 'secondary'}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
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
            <div className="text-lg font-bold">Total: ₹{totalExpenses.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}