'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Pencil, Search, CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LedgerAccount, LedgerAccountType } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { companyDetails } from '@/lib/company';

const accountTypes: LedgerAccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

export function ChartOfAccountsClient({ initialAccounts }: { initialAccounts: LedgerAccount[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccount | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = searchTerm.toLowerCase() 
        ? account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          account.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesType = selectedType !== 'all' ? account.type === selectedType : true;
      
      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, selectedType]);

  const handleEditClick = (account: LedgerAccount) => {
    setSelectedAccount(account);
    setIsEditDialogOpen(true);
  };
  
  const getBadgeVariant = (type: LedgerAccount['type']) => {
    switch(type) {
      case 'Asset': return 'default';
      case 'Liability': return 'destructive';
      case 'Equity': return 'secondary';
      case 'Revenue': return 'default'; // Should be success, but using default
      case 'Expense': return 'outline';
      default: return 'outline';
    }
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chart of Accounts</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Ledger Account</DialogTitle>
                <DialogDescription>Enter the details for the new account.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                   <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea id="description" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="openingBalance" className="text-right">Opening Bal</Label>
                    <Input id="openingBalance" type="number" defaultValue={0} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">As of Date</Label>
                  <Popover>
                      <PopoverTrigger asChild>
                      <Button
                          variant={"outline"}
                          className={cn("col-span-3 justify-start text-left font-normal", !new Date() && "text-muted-foreground")}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(new Date(), "PPP")}
                      </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date()} initialFocus /></PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
           <div className="flex items-center gap-4 mb-4">
              <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search accounts by name or description..."
                      className="w-full rounded-lg bg-background pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {accountTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map(account => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell><Badge variant={getBadgeVariant(account.type)}>{account.type}</Badge></TableCell>
                  <TableCell>{account.description}</TableCell>
                  <TableCell className="text-right font-mono">{companyDetails.currencySymbol}{account.openingBalance?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(account)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Ledger Account</DialogTitle>
                <DialogDescription>Update the details for {selectedAccount?.name}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input id="edit-name" defaultValue={selectedAccount?.name} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">Type</Label>
                   <Select defaultValue={selectedAccount?.type}>
                    <SelectTrigger className="col-span-3" id="edit-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">Description</Label>
                  <Textarea id="edit-description" defaultValue={selectedAccount?.description} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-openingBalance" className="text-right">Opening Bal</Label>
                    <Input id="edit-openingBalance" type="number" defaultValue={selectedAccount?.openingBalance || 0} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">As of Date</Label>
                  <Popover>
                      <PopoverTrigger asChild>
                      <Button
                          variant={"outline"}
                          className={cn("col-span-3 justify-start text-left font-normal")}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedAccount?.openingBalanceDate ? format(new Date(selectedAccount.openingBalanceDate), "PPP") : "Pick a date"}
                      </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedAccount?.openingBalanceDate ? new Date(selectedAccount.openingBalanceDate) : undefined} initialFocus /></PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </div>
  );
}
