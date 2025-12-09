'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Printer, Pencil } from 'lucide-react';
import type { Sale, Customer } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { CompanyDetails } from '@/lib/company';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ReceiptItem {
  id: string;
  saleId: string;
  itemName: string;
  quantity: number;
  amount: number;
  date: string;
}

function ReceiptVoucher({ sale, customer, companyDetails }: { sale: Sale; customer: Customer | undefined; companyDetails: CompanyDetails }) {
  const receiptAmount = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <DialogContent className="sm:max-w-3xl print:max-w-full print:border-0 print:shadow-none overflow-y-auto max-h-screen">
      <div className="printable-area print:p-8">
        <DialogHeader className="print:hidden">
          <DialogTitle>Receipt #{sale.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              {companyDetails.documentHeaderUrl && (
                <Image src={companyDetails.documentHeaderUrl} alt={`${companyDetails.name} Logo`} width={200} height={50} className="mb-4 object-contain" />
              )}
              <h3 className="font-bold text-lg">{companyDetails.name}</h3>
              <p className="text-sm text-muted-foreground">{companyDetails.address}</p>
              <p className="text-sm text-muted-foreground">{companyDetails.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold uppercase text-primary">Receipt</h2>
              <p className="text-muted-foreground">#{sale.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <h3 className="font-semibold">Received From:</h3>
              <p>{customer?.name}</p>
              <p>{customer?.email}</p>
              <p>{customer?.phone}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {format(new Date(sale.date), 'PPP')}</p>
              <p><strong>Receipt #:</strong> {sale.id}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell className="text-right">{companyDetails.currencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-4 border-t pt-4">
            <div className="text-right">
              <p className="text-lg font-bold">Total: {companyDetails.currencySymbol}{receiptAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export function ReceiptsClient({ initialSales, customers, companyDetails }: { initialSales: Sale[]; customers: Customer[]; companyDetails: CompanyDetails }) {
  const [receipts, setReceipts] = useState(initialSales);
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchCustomer = filterCustomer === 'all' || receipt.customerId === filterCustomer;
      const matchSearch = receipt.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCustomer && matchSearch;
    });
  }, [receipts, filterCustomer, searchTerm]);

  const handleDelete = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Receipt deleted', description: 'The receipt has been deleted.' });
  };

  const handlePrint = (sale: Sale) => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Receipts</CardTitle>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Receipt</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Receipts</Label>
                <Input
                  id="search"
                  placeholder="Search by receipt number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-filter">Filter by Customer</Label>
                <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                  <SelectTrigger id="customer-filter">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map(receipt => {
                  const customer = customers.find(c => c.id === receipt.customerId);
                  const amount = receipt.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                  return (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.id}</TableCell>
                      <TableCell>{customer?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(receipt.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right font-semibold">{companyDetails.currencySymbol}{amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={receipt.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                          {receipt.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <ReceiptVoucher sale={receipt} customer={customer} companyDetails={companyDetails} />
                          </Dialog>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(receipt.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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