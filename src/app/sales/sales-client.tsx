
'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Printer, Pencil, CalendarIcon } from 'lucide-react';
import type { Sale, Customer, Item, Technician, Tax } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { CompanyDetails } from '@/lib/company';
import { format } from 'date-fns';
import { taxes } from '@/lib/data';
import { useQuickAddStore } from '@/hooks/use-quick-add-store';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


function SaleVoucher({ sale, customer, items, companyDetails, technicianName }: { sale: Sale; customer: Customer | undefined, items: (Item | {taxId?: string})[], companyDetails: CompanyDetails, technicianName?: string }) {
  const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalTax = sale.items.reduce((acc, item) => {
    const taxAmount = (item.price * (item.taxRate || 0) / 100) * item.quantity;
    return acc + taxAmount;
  }, 0);

  return (
    <DialogContent className="sm:max-w-3xl print:max-w-full print:border-0 print:shadow-none overflow-y-auto max-h-screen">
      <div className="printable-area print:p-8">
        <DialogHeader className="print:hidden">
          <DialogTitle>Sale Voucher #{sale.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
              <div>
                  {companyDetails.documentHeaderUrl && (
                      <Image src={companyDetails.documentHeaderUrl} alt={`${companyDetails.name} Logo`} width={200} height={50} className="mb-4 object-contain"/>
                  )}
                  <h3 className="font-bold text-lg">{companyDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">{companyDetails.address}</p>
                  <p className="text-sm text-muted-foreground">{companyDetails.email}</p>
                  <p className="text-sm text-muted-foreground">{companyDetails.taxType}IN: {companyDetails.gstn}</p>
              </div>
              <div className="text-right">
                  <h2 className="text-2xl font-bold uppercase text-primary">Invoice</h2>
                  <p className="text-muted-foreground">#{sale.id}</p>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <h3 className="font-semibold">Billed To:</h3>
              <p>{customer?.name}</p>
              <p>{customer?.email}</p>
              <p>{customer?.phone}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {format(new Date(sale.date), 'PPP')}</p>
              {technicianName && <p><strong>Technician:</strong> {technicianName}</p>}
              <div className="flex items-center justify-end"><strong>Status:</strong> <Badge variant={sale.paymentStatus === 'Paid' ? 'default' : 'secondary'} className="ml-2">{sale.paymentStatus}</Badge></div>
            </div>
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">{companyDetails.taxType}</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((saleItem, index) => {
                  const itemDetails = items.find(i => 'id' in i && i.id === saleItem.itemId);
                  const itemSubtotal = saleItem.price * saleItem.quantity;
                  const taxAmount = itemSubtotal * ((saleItem.taxRate || 0) / 100);
                  const itemTotal = itemSubtotal + taxAmount;
                  return (
                    <TableRow key={index}>
                      <TableCell>{itemDetails && 'name' in itemDetails ? itemDetails.name : 'Service'}</TableCell>
                      <TableCell className="text-center">{saleItem.quantity}</TableCell>
                      <TableCell className="text-right">{companyDetails.currencySymbol}{saleItem.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{companyDetails.currencySymbol}{itemSubtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{companyDetails.currencySymbol}{taxAmount.toFixed(2)} ({saleItem.taxRate || 0}%)</TableCell>
                      <TableCell className="text-right">{companyDetails.currencySymbol}{itemTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{companyDetails.currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total {companyDetails.taxType}:</span>
                <span>{companyDetails.currencySymbol}{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{companyDetails.currencySymbol}{sale.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6 print:hidden">
            <Button onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4" /> Print Invoice</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}

type InvoiceItem = {
    itemId: string;
    quantity: number;
    price: number;
    taxRate?: number;
};

export function SalesClient({ 
    initialSales, 
    customers, 
    items, 
    technicians,
    companyDetails,
    isDialog = false,
    defaultSale,
    onDialogClose
}: { 
    initialSales: Sale[], 
    customers: Customer[], 
    items: (Item | { id: string; name: string; price: number; taxId?: string })[],
    technicians: Technician[],
    companyDetails: CompanyDetails,
    isDialog?: boolean,
    defaultSale?: { customerId: string; technicianId?: string; items: InvoiceItem[] }
    onDialogClose?: () => void
}) {
  const [sales, setSales] = useState(initialSales);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Unpaid');
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number | undefined>();

  const { open: openQuickAdd } = useQuickAddStore();
  const { toast } = useToast();


  useEffect(() => {
    if (defaultSale) {
        setSelectedCustomerId(defaultSale.customerId);
        setSelectedTechnicianId(defaultSale.technicianId);
        setInvoiceItems(defaultSale.items);
    }
  }, [defaultSale]);

  const resetForm = () => {
    setInvoiceItems([]);
    setSelectedCustomerId(undefined);
    setSelectedTechnicianId(undefined);
    setPaymentStatus('Unpaid');
    setInvoiceDate(new Date());
    setPaymentMode('Cash');
    setPaidAmount(undefined);
    setSelectedSale(null);
  }

  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setInvoiceItems(sale.items);
    setSelectedCustomerId(sale.customerId);
    setSelectedTechnicianId(sale.technicianId);
    setPaymentStatus(sale.paymentStatus);
    setInvoiceDate(sale.invoiceDate ? new Date(sale.invoiceDate) : new Date(sale.date));
    setPaymentMode(sale.paymentMode || 'Cash');
    setPaidAmount(sale.paidAmount);
    setIsEditDialogOpen(true);
  };
  

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { itemId: '', quantity: 1, price: 0, taxRate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };
  
  const handleItemChange = (index: number, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    const newItems = [...invoiceItems];
    newItems[index].itemId = itemId;
    newItems[index].price = item?.price || 0;
    const tax = taxes.find(t => t.id === (item as Item)?.taxId);
    newItems[index].taxRate = tax?.rate || 0;
    setInvoiceItems(newItems);
  }
  
  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...invoiceItems];
    newItems[index].quantity = quantity;
    setInvoiceItems(newItems);
  }

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...invoiceItems];
    newItems[index].price = price;
    setInvoiceItems(newItems);
  };

  const subtotal = useMemo(() => invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [invoiceItems]);
  const totalTax = useMemo(() => invoiceItems.reduce((acc, item) => acc + (item.price * (item.taxRate || 0) / 100) * item.quantity, 0), [invoiceItems]);
  const total = subtotal + totalTax;

  useEffect(() => {
    if (paymentStatus === 'Paid') {
        setPaidAmount(total);
    } else {
        setPaidAmount(undefined);
    }
  }, [paymentStatus, total]);

  const handleSave = () => {
    // In a real app, this would be an API call
    toast({
      title: `Invoice ${selectedSale ? 'updated' : 'created'}`,
      description: "The invoice has been saved successfully.",
    });
    if (onDialogClose) {
      onDialogClose();
    } else {
      setIsEditDialogOpen(false);
    }
    resetForm();
  };

  const invoiceDialogContent = (
      <>
        <DialogHeader>
            <DialogTitle>{selectedSale ? `Edit Invoice #${selectedSale.id}` : 'Create Invoice'}</DialogTitle>
            <DialogDescription>
                {selectedSale ? `Update the invoice details for ${customers.find(c => c.id === selectedSale.customerId)?.name}.` : 'Create a new sales invoice for a customer.'}
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                        <SelectTrigger id="customer"><SelectValue placeholder="Select a customer" /></SelectTrigger>
                        <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !invoiceDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={invoiceDate} onSelect={setInvoiceDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="technician">Technician</Label>
                    <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                        <SelectTrigger id="technician"><SelectValue placeholder="Select a technician" /></SelectTrigger>
                        <SelectContent>{technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
             </div>
            <div className="space-y-2">
                <Label>Invoice Items</Label>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead className="min-w-[200px] w-2/5">Item</TableHead><TableHead>Qty</TableHead><TableHead>Rate</TableHead><TableHead>{companyDetails.taxType}</TableHead><TableHead className="text-right">Amount</TableHead><TableHead><span className="sr-only">Remove</span></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {invoiceItems.map((item, index) => {
                                const itemSubtotal = item.price * item.quantity;
                                const taxAmount = itemSubtotal * ((item.taxRate || 0) / 100);
                                const itemTotal = itemSubtotal + taxAmount;
                                return (
                                    <TableRow key={index}>
                                        <TableCell><Select value={item.itemId} onValueChange={(v) => handleItemChange(index, v)}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></TableCell>
                                        <TableCell><Input type="number" value={item.quantity} onChange={e => handleQuantityChange(index, parseInt(e.target.value))} className="w-16 text-center" min="1" /></TableCell>
                                        <TableCell><Input type="number" value={item.price} onChange={e => handlePriceChange(index, parseFloat(e.target.value))} className="w-24 text-right" /></TableCell>
                                        <TableCell className="text-right text-sm">{item.taxRate || 0}%</TableCell>
                                        <TableCell className="text-right font-medium">{companyDetails.currencySymbol}{itemTotal.toFixed(2)}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
            <div className="space-y-2">
                <Label>Payment Status</Label>
                <RadioGroup value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as 'Paid' | 'Unpaid')} className="flex gap-4">
                    <div><RadioGroupItem value="Paid" id="paid" className="peer sr-only" /><Label htmlFor="paid" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Paid</Label></div>
                    <div><RadioGroupItem value="Unpaid" id="unpaid" className="peer sr-only" /><Label htmlFor="unpaid" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Unpaid</Label></div>
                </RadioGroup>
            </div>
            {paymentStatus === 'Paid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                     <div className="space-y-2">
                        <Label htmlFor="payment-mode">Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as 'Cash' | 'Bank')}>
                            <SelectTrigger id="payment-mode"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank">Bank</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paid-amount">Paid Amount</Label>
                        <Input id="paid-amount" type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} placeholder="Amount paid"/>
                    </div>
                </div>
            )}
        </div>
        <DialogFooter className="flex-col items-stretch gap-2 pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{companyDetails.currencySymbol}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total {companyDetails.taxType}</span><span>{companyDetails.currencySymbol}{totalTax.toFixed(2)}</span></div><hr />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{companyDetails.currencySymbol}{total.toFixed(2)}</span></div>
            <Button onClick={handleSave} className="w-full">Create Invoice</Button>
        </DialogFooter>
      </>
  );

  if (isDialog) {
      return (
        <DialogContent className="lg:max-w-screen-lg overflow-y-auto max-h-screen">
            {invoiceDialogContent}
        </DialogContent>
      )
  }

  return (
    <div className="p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sales</CardTitle>
             <Button size="sm" className="gap-1" onClick={() => openQuickAdd('add-sale')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Invoice</span>
              </Button>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map(sale => {
                    const customer = customers.find(c => c.id === sale.customerId);
                    const technician = technicians.find(t => t.id === sale.technicianId);
                    return (
                      <TableRow key={sale.id}>
                         <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{customer?.name}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">{customer?.email}</div>
                        </TableCell>
                        <TableCell>{technician?.name}</TableCell>
                        <TableCell>
                          <Badge variant={sale.paymentStatus === 'Paid' ? 'default' : 'secondary'}>{sale.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(sale.date), 'PPP')}</TableCell>
                        <TableCell className="text-right">{companyDetails.currencySymbol}{sale.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">View Voucher</Button>
                            </DialogTrigger>
                            <SaleVoucher sale={sale} customer={customer} items={items} companyDetails={companyDetails} technicianName={technician?.name} />
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(sale)}>
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
        <DialogContent className="lg:max-w-screen-lg overflow-y-auto max-h-screen">
          {invoiceDialogContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}
