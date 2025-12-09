
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuickAddStore } from '@/hooks/use-quick-add-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { customers, technicians, items, ledgerAccounts, taxes, itemTypes } from '@/lib/data';
import { companyDetails } from '@/lib/company';
import type { JobOrderService, InvoiceItem, ExpenseItem } from '@/lib/types';


export function GlobalQuickAdd() {
  const { dialog, close } = useQuickAddStore();
  const { toast } = useToast();

  const handleSave = (entity: string) => {
    toast({
        title: `${entity} Created`,
        description: `The new ${entity.toLowerCase()} has been saved successfully.`,
    });
    close();
  };

  const renderContent = () => {
    switch (dialog) {
      case 'add-customer':
        return <AddCustomerForm onSave={() => handleSave('Customer')} />;
      case 'add-job':
        return <AddJobForm onSave={() => handleSave('Job Order')} />;
      case 'add-sale':
        return <AddSaleForm onSave={() => handleSave('Sale')} />;
      case 'add-expense':
        return <AddExpenseForm onSave={() => handleSave('Expense')} />;
      default:
        return null;
    }
  };
  
  const getDialogTitle = () => {
    switch (dialog) {
        case 'add-customer': return 'Add New Customer';
        case 'add-job': return 'Add New Job Order';
        case 'add-sale': return 'Create New Invoice';
        case 'add-expense': return 'Log New Expense';
        default: return '';
    }
  }

  const getDialogDescription = () => {
     switch (dialog) {
        case 'add-customer': return 'Enter details for the new customer.';
        case 'add-job': return 'Enter details for the new job order.';
        case 'add-sale': return 'Create a new sales invoice for a customer.';
        case 'add-expense': return 'Create a new expense voucher.';
        default: return '';
    }
  }


  return (
    <Dialog open={!!dialog} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent className="lg:max-w-screen-lg max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

const AddCustomerForm = ({ onSave }: { onSave: () => void }) => (
  <div className="grid gap-4 py-4">
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" className="col-span-3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">Email</Label>
        <Input id="email" type="email" className="col-span-3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">Phone</Label>
        <Input id="phone" className="col-span-3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
        <Label htmlFor="preferredTechnician" className="text-right">Technician</Label>
        <Select>
            <SelectTrigger id="preferredTechnician" className="col-span-3"><SelectValue placeholder="Select technician" /></SelectTrigger>
            <SelectContent>{technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}</SelectContent>
        </Select>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
        <Label htmlFor="ledger" className="text-right">Ledger</Label>
        <Select>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select ledger" /></SelectTrigger>
            <SelectContent>{ledgerAccounts.filter(a => a.type === 'Asset').map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
        </Select>
    </div>
    <DialogFooter><Button onClick={onSave}>Save Customer</Button></DialogFooter>
  </div>
);

const AddJobForm = ({ onSave }: { onSave: () => void }) => {
    const serviceItems = items.filter(i => i.itemTypeId === 'type-3');
    const [currentServices, setCurrentServices] = useState<JobOrderService[]>([{ serviceId: '', price: 0 }]);
    const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
    const [deadline, setDeadline] = useState<Date | undefined>(new Date());

    const handleServiceChange = (index: number, serviceId: string) => {
        const service = serviceItems.find(s => s.id === serviceId);
        const newServices = [...currentServices];
        newServices[index] = { serviceId, price: service?.price || 0 };
        setCurrentServices(newServices);
    };

    const handleAddService = () => setCurrentServices([...currentServices, { serviceId: '', price: 0 }]);
    const handleRemoveService = (index: number) => setCurrentServices(currentServices.filter((_, i) => i !== index));

    const currentPrice = useMemo(() => currentServices.reduce((total, service) => total + service.price, 0), [currentServices]);

    return (
        <div className="grid gap-4 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <Label htmlFor="customer">Customer</Label>
                <Select><SelectTrigger id="customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                </div>
                <div>
                <Label htmlFor="technician">Technician</Label>
                <Select><SelectTrigger id="technician"><SelectValue placeholder="Select technician" /></SelectTrigger>
                    <SelectContent>{technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label>Services</Label>
                <div className="space-y-2 rounded-md border p-4">
                    {currentServices.map((service, index) => (
                        <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                            <Select value={service.serviceId} onValueChange={(val) => handleServiceChange(index, val)}>
                                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                                <SelectContent>{serviceItems.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <span className="text-sm font-medium">{companyDetails.currencySymbol}{service.price.toFixed(2)}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveService(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddService} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Order Date</Label>
                    <Popover>
                        <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !orderDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={orderDate} onSelect={setOrderDate} initialFocus/></PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label>Deadline</Label>
                     <Popover>
                        <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{deadline ? format(deadline, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus/></PopoverContent>
                    </Popover>
                </div>
            </div>
             <div>
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="Pending"><SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Any specific instructions..." />
            </div>
            <DialogFooter>
                <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-bold">Total: {companyDetails.currencySymbol}{currentPrice.toFixed(2)}</span>
                    <Button type="submit" onClick={onSave}>Save Job</Button>
                </div>
            </DialogFooter>
        </div>
    );
};

const AddSaleForm = ({ onSave }: { onSave: () => void }) => {
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ itemId: '', quantity: 1, price: 0, taxRate: 0 }]);
    const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Unpaid');
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank'>('Cash');
    const [paidAmount, setPaidAmount] = useState<number | undefined>();
    
    const handleAddItem = () => setInvoiceItems([...invoiceItems, { itemId: '', quantity: 1, price: 0, taxRate: 0 }]);
    const handleRemoveItem = (index: number) => setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        const newItems = [...invoiceItems];
        newItems[index].itemId = itemId;
        newItems[index].price = item?.price || 0;
        newItems[index].taxRate = taxes.find(t => t.id === item?.taxId)?.rate || 0;
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

    return (
        <div className="space-y-4 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select><SelectTrigger id="customer"><SelectValue placeholder="Select a customer" /></SelectTrigger>
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
                    <Select><SelectTrigger id="technician"><SelectValue placeholder="Select a technician" /></SelectTrigger>
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
            <DialogFooter className="flex-col items-stretch gap-2 pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{companyDetails.currencySymbol}{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total {companyDetails.taxType}</span><span>{companyDetails.currencySymbol}{totalTax.toFixed(2)}</span></div><hr />
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{companyDetails.currencySymbol}{total.toFixed(2)}</span></div>
                <Button onClick={onSave} className="w-full">Create Invoice</Button>
            </DialogFooter>
        </div>
    );
};

const AddExpenseForm = ({ onSave }: { onSave: () => void }) => {
    const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([{ itemId: '', quantity: 1, price: 0, taxRate: 0 }]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const payableAccounts = ledgerAccounts.filter(acc => acc.type === 'Liability');

    const handleAddItem = () => setExpenseItems([...expenseItems, { itemId: '', quantity: 1, price: 0, taxRate: 0 }]);
    const handleRemoveItem = (index: number) => setExpenseItems(expenseItems.filter((_, i) => i !== index));
    const handleItemChange = (index: number, field: 'itemId' | 'quantity' | 'price', value: string | number) => {
        const newItems = [...expenseItems];
        const newExpenseItem = {...newItems[index]};
        if (field === 'itemId') {
            const item = items.find(i => i.id === value);
            newExpenseItem.itemId = value as string;
            newExpenseItem.price = item?.cost || item?.price || 0;
            newExpenseItem.taxRate = taxes.find(t => t.id === item?.taxId)?.rate || 0;
        } else if (field === 'quantity') {
            newExpenseItem.quantity = Number(value);
        } else if (field === 'price') {
            newExpenseItem.price = Number(value);
        }
        newItems[index] = newExpenseItem;
        setExpenseItems(newItems);
    }
    
    const subtotal = useMemo(() => expenseItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [expenseItems]);
    const totalTax = useMemo(() => expenseItems.reduce((acc, item) => acc + (item.price * (item.taxRate || 0) / 100) * item.quantity, 0), [expenseItems]);
    const total = subtotal + totalTax;

    return (
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="voucherNumber">Voucher #</Label><Input id="voucherNumber" /></div>
                <div className="space-y-2"><Label htmlFor="payableTo">Payable To</Label><Select><SelectTrigger id="payableTo"><SelectValue placeholder="Select a liability account" /></SelectTrigger><SelectContent>{payableAccounts.map(account => (<SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="date">Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" placeholder="Enter a brief description" /></div>
                <div className="space-y-2"><Label htmlFor="item-type">Filter Items by Type</Label><Select><SelectTrigger id="item-type"><SelectValue placeholder="Select an item type" /></SelectTrigger><SelectContent>{itemTypes.map(it => (<SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="space-y-2">
                <Label>Expense Items</Label>
                <div className="relative w-full overflow-auto">
                    <Table><TableHeader><TableRow><TableHead className="min-w-[200px] w-2/5">Item</TableHead><TableHead>Qty</TableHead><TableHead>Rate</TableHead><TableHead>{companyDetails.taxType}</TableHead><TableHead className="text-right">Amount</TableHead><TableHead><span className="sr-only">Remove</span></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {expenseItems.map((item, index) => {
                                const itemSubtotal = item.price * item.quantity;
                                const taxAmount = itemSubtotal * ((item.taxRate || 0) / 100);
                                const itemTotal = itemSubtotal + taxAmount;
                                return (<TableRow key={index}><TableCell><Select value={item.itemId} onValueChange={(value) => handleItemChange(index, 'itemId', value)}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></TableCell><TableCell><Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-16 text-center" min="1" /></TableCell><TableCell><Input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} className="w-24 text-right" /></TableCell><TableCell className="text-right text-sm">{item.taxRate || 0}%</TableCell><TableCell className="text-right font-medium">{companyDetails.currencySymbol}{itemTotal.toFixed(2)}</TableCell><TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)
                            })}
                        </TableBody>
                    </Table>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
            <DialogFooter className="flex-col items-stretch gap-2 pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{companyDetails.currencySymbol}{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total {companyDetails.taxType}</span><span>{companyDetails.currencySymbol}{totalTax.toFixed(2)}</span></div><hr />
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{companyDetails.currencySymbol}{total.toFixed(2)}</span></div>
                <Button onClick={onSave} className="w-full">Save Expense</Button>
            </DialogFooter>
        </div>
    );
};
