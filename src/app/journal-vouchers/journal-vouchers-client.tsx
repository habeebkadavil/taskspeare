'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableFooterComponent } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { LedgerAccount, JournalVoucher, JournalEntry } from '@/lib/types';
import type { CompanyDetails } from '@/lib/company';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2, Search, Printer, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { DateRange } from 'react-day-picker';

function JournalVoucherForm({
  ledgerAccounts,
  companyDetails,
  onVoucherAction,
  open,
  onOpenChange,
  initialVoucher,
}: {
  ledgerAccounts: LedgerAccount[];
  companyDetails: CompanyDetails;
  onVoucherAction: (voucher: JournalVoucher) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVoucher?: JournalVoucher | null;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [narration, setNarration] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([
    { accountId: '', debit: 0, credit: 0 },
    { accountId: '', debit: 0, credit: 0 },
  ]);
  const { toast } = useToast();

  const isEditMode = !!initialVoucher;

  const voucherNumber = useMemo(() => {
    return isEditMode ? initialVoucher.voucherNumber : `JV-${Date.now()}`;
  }, [isEditMode, initialVoucher]);

  const resetForm = () => {
    setDate(new Date());
    setNarration('');
    setEntries([
      { accountId: '', debit: 0, credit: 0 },
      { accountId: '', debit: 0, credit: 0 },
    ]);
  };

  useEffect(() => {
    if (isEditMode && initialVoucher) {
        setDate(new Date(initialVoucher.date));
        setNarration(initialVoucher.narration);
        setEntries(initialVoucher.entries.length > 0 ? initialVoucher.entries : [{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }]);
    } else {
        resetForm();
    }
  }, [initialVoucher, isEditMode, open]);

  const handleEntryChange = (index: number, field: keyof JournalEntry, value: string | number) => {
    const newEntries = [...entries];
    const entry = { ...newEntries[index] };
    
    if (field === 'accountId') {
        entry.accountId = value as string;
    } else if (field === 'debit') {
        entry.debit = Number(value);
        if (Number(value) > 0) entry.credit = 0;
    } else if (field === 'credit') {
        entry.credit = Number(value);
        if (Number(value) > 0) entry.debit = 0;
    }

    newEntries[index] = entry;
    setEntries(newEntries);
  };

  const addEntryRow = () => {
    setEntries([...entries, { accountId: '', debit: 0, credit: 0 }]);
  };

  const removeEntryRow = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    } else {
        toast({
            variant: "destructive",
            title: "Cannot remove row",
            description: "A journal voucher must have at least two entries.",
        });
    }
  };
  
  const totalDebit = useMemo(() => entries.reduce((acc, entry) => acc + (entry.debit || 0), 0), [entries]);
  const totalCredit = useMemo(() => entries.reduce((acc, entry) => acc + (entry.credit || 0), 0), [entries]);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = () => {
    if (!isBalanced) {
        toast({
            variant: "destructive",
            title: "Transaction is not balanced",
            description: "Total debits must equal total credits.",
        });
        return;
    }
     if (entries.some(e => !e.accountId)) {
        toast({
            variant: "destructive",
            title: "Incomplete Entry",
            description: "Please select a ledger account for all rows.",
        });
        return;
    }
    const voucherData: JournalVoucher = {
        id: isEditMode ? initialVoucher.id : `jv-${Date.now()}`,
        voucherNumber,
        date: date?.toISOString() || new Date().toISOString(),
        narration,
        entries,
        total: totalDebit
    };

    onVoucherAction(voucherData);
    toast({
        title: "Success",
        description: `Journal voucher ${isEditMode ? 'updated' : 'created'} successfully.`,
    });
    if (!isEditMode) resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="lg:max-w-screen-md overflow-y-auto max-h-screen">
          <DialogHeader>
            <DialogTitle>{isEditMode ? `Edit Journal Voucher #${voucherNumber}`: 'Create Journal Voucher'}</DialogTitle>
            <DialogDescription>{isEditMode ? 'Update the details for this journal entry.' : 'Manually enter debit and credit transactions between accounts.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                      <Label htmlFor="voucher-number">Voucher #</Label>
                      <Input id="voucher-number" value={voucherNumber} readOnly disabled />
                  </div>
                   <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button
                              id="date"
                              variant={"outline"}
                              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                              >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                          </PopoverContent>
                      </Popover>
                   </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="narration">Narration</Label>
                  <Textarea id="narration" placeholder="Enter a brief description for this entry" value={narration} onChange={e => setNarration(e.target.value)} />
              </div>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/5 min-w-[200px]">Account</TableHead>
                        <TableHead className="text-right min-w-[100px]">Debit</TableHead>
                        <TableHead className="text-right min-w-[100px]">Credit</TableHead>
                        <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {entries.map((entry, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Select value={entry.accountId} onValueChange={(val) => handleEntryChange(index, 'accountId', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ledgerAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Input type="number" className="text-right" value={entry.debit} onChange={e => handleEntryChange(index, 'debit', e.target.value)} placeholder="0.00" />
                            </TableCell>
                            <TableCell>
                                <Input type="number" className="text-right" value={entry.credit} onChange={e => handleEntryChange(index, 'credit', e.target.value)} placeholder="0.00" />
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeEntryRow(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" onClick={addEntryRow}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Row
              </Button>
          </div>
          <DialogFooter className="flex-col items-stretch gap-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Debit Total</span><span className="font-semibold">{companyDetails.currencySymbol}{totalDebit.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Credit Total</span><span className="font-semibold">{companyDetails.currencySymbol}{totalCredit.toFixed(2)}</span></div>
              <hr />
              <div className="flex sm:flex-row flex-col-reverse gap-2">
                <Button onClick={() => window.print()} variant="outline" className="sm:w-auto w-full gap-2"><Printer className="h-4 w-4"/> Print Voucher</Button>
                <Button onClick={handleSubmit} disabled={!isBalanced} className="flex-1">
                    {isEditMode ? 'Save Changes' : 'Create Voucher'}
                </Button>
              </div>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}


export function JournalVouchersClient({
  ledgerAccounts,
  companyDetails,
  initialVouchers,
}: {
  ledgerAccounts: LedgerAccount[];
  companyDetails: CompanyDetails;
  initialVouchers: JournalVoucher[];
}) {
  
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<JournalVoucher | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm ? (
        voucher.voucherNumber.toLowerCase().includes(searchLower) ||
        voucher.narration.toLowerCase().includes(searchLower)
      ) : true;

      const voucherDate = new Date(voucher.date);
      const matchesDate = dateRange ? (
        (!dateRange.from || voucherDate >= dateRange.from) &&
        (!dateRange.to || voucherDate <= dateRange.to)
      ) : true;

      return matchesSearch && matchesDate;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vouchers, searchTerm, dateRange]);
  
  const handleCreateVoucher = (newVoucher: JournalVoucher) => {
    setVouchers(prev => [newVoucher, ...prev]);
  };
  
  const handleUpdateVoucher = (updatedVoucher: JournalVoucher) => {
    setVouchers(prev => prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
  };

  const handleViewVoucher = (voucher: JournalVoucher) => {
    setSelectedVoucher(voucher);
    setIsViewOpen(true);
  };
  
  const handleEditVoucher = (voucher: JournalVoucher) => {
    setSelectedVoucher(voucher);
    setIsEditOpen(true);
  }


  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Journal Vouchers</CardTitle>
            <CardDescription>A list of all manual journal entries.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" /> Create Voucher
          </Button>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="relative w-full md:w-auto flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search by voucher # or narration..."
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
            </div>
            <div className="relative w-full overflow-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Voucher #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Narration</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredVouchers.map(voucher => (
                          <TableRow key={voucher.id}>
                              <TableCell className="font-mono text-xs">{voucher.voucherNumber}</TableCell>
                              <TableCell>{format(new Date(voucher.date), 'PPP')}</TableCell>
                              <TableCell>{voucher.narration}</TableCell>
                              <TableCell className="text-right font-medium">{companyDetails.currencySymbol}{voucher.total.toFixed(2)}</TableCell>
                              <TableCell className="text-right space-x-0">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewVoucher(voucher)}>
                                      View
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditVoucher(voucher)}>
                                      Edit
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
      
      <JournalVoucherForm 
        ledgerAccounts={ledgerAccounts} 
        companyDetails={companyDetails}
        onVoucherAction={handleCreateVoucher}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      
      <JournalVoucherForm 
        ledgerAccounts={ledgerAccounts} 
        companyDetails={companyDetails}
        onVoucherAction={handleUpdateVoucher}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialVoucher={selectedVoucher}
      />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        {selectedVoucher && (
            <DialogContent className="lg:max-w-screen-md printable-area">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Journal Voucher: {selectedVoucher.voucherNumber}</DialogTitle>
                    <DialogDescription>
                        {selectedVoucher.narration} - {format(new Date(selectedVoucher.date), 'PPP')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedVoucher.entries.map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{ledgerAccounts.find(acc => acc.id === entry.accountId)?.name}</TableCell>
                                        <TableCell className="text-right">{entry.debit > 0 ? companyDetails.currencySymbol + entry.debit.toFixed(2) : '-'}</TableCell>
                                        <TableCell className="text-right">{entry.credit > 0 ? companyDetails.currencySymbol + entry.credit.toFixed(2) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooterComponent className="font-semibold text-base bg-transparent">
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{companyDetails.currencySymbol}{selectedVoucher.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{companyDetails.currencySymbol}{selectedVoucher.total.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableFooterComponent>
                        </Table>
                    </div>
                </div>
                <DialogFooter className="print:hidden flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                    <Button onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4"/> Print</Button>
                </DialogFooter>
            </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
