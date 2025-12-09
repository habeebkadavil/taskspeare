
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Item, LedgerAccount, Tax, ItemType, Brand, Unit, Category, AlternateUnit } from '@/lib/types';
import { companyDetails } from '@/lib/company';

export function InventoryClient({ 
  initialItems, 
  ledgerAccounts,
  taxes,
  itemTypes,
  brands,
  units,
  categories,
}: { 
  initialItems: Item[], 
  ledgerAccounts: LedgerAccount[],
  taxes: Tax[],
  itemTypes: ItemType[],
  brands: Brand[],
  units: Unit[],
  categories: Category[],
}) {
  const [items, setItems] = useState(initialItems);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [alternateUnits, setAlternateUnits] = useState<AlternateUnit[]>([]);

  useEffect(() => {
    if (selectedItem) {
      setAlternateUnits(selectedItem.alternateUnits || []);
    } else {
      setAlternateUnits([]);
    }
  }, [selectedItem]);


  const handleEditClick = (item: Item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };
  
  const handleAddAlternateUnit = () => {
    setAlternateUnits([...alternateUnits, { unitId: '', conversionFactor: 1 }]);
  };

  const handleRemoveAlternateUnit = (index: number) => {
    setAlternateUnits(alternateUnits.filter((_, i) => i !== index));
  };
  
  const handleAlternateUnitChange = (index: number, field: keyof AlternateUnit, value: string | number) => {
      const newUnits = [...alternateUnits];
      const unit = { ...newUnits[index] };
      if (field === 'unitId') {
          unit.unitId = value as string;
      } else {
          unit.conversionFactor = Number(value);
      }
      newUnits[index] = unit;
      setAlternateUnits(newUnits);
  };

  const getItemTypeName = (itemTypeId: string) => itemTypes.find(c => c.id === itemTypeId)?.name;
  const getTaxRate = (taxId: string) => taxes.find(t => t.id === taxId)?.rate;

  const renderDialogContent = (isEdit: boolean) => {
    const item = isEdit ? selectedItem : null;
    return (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>{isEdit ? `Update the details for ${item?.name}.` : 'Enter the details for the new item.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={item?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-type">Item Type</Label>
                <Select defaultValue={item?.itemTypeId}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{itemTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" defaultValue={item?.price} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" defaultValue={item?.stock} />
                </div>
             </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tax">{companyDetails.taxType}</Label>
                    <Select defaultValue={item?.taxId}>
                        <SelectTrigger><SelectValue placeholder="Select tax" /></SelectTrigger>
                        <SelectContent>{taxes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select defaultValue={item?.categoryId}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select defaultValue={item?.brandId}>
                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">Primary Unit</Label>
                    <Select defaultValue={item?.unitId}>
                        <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                        <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.abbreviation})</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger">Ledger</Label>
              <Select defaultValue={item?.ledgerId}>
                <SelectTrigger id="ledger"><SelectValue placeholder="Select ledger" /></SelectTrigger>
                <SelectContent>{ledgerAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div className="space-y-4">
              <Label>Alternate Units</Label>
              <div className="space-y-2 rounded-md border p-4">
                {alternateUnits.map((altUnit, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <Select value={altUnit.unitId} onValueChange={(val) => handleAlternateUnitChange(index, 'unitId', val)}>
                      <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                      <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={altUnit.conversionFactor}
                      onChange={(e) => handleAlternateUnitChange(index, 'conversionFactor', e.target.value)}
                      placeholder="Conversion Factor"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAlternateUnit(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddAlternateUnit} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Alternate Unit
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsEditDialogOpen(false)}>{isEdit ? 'Save Changes' : 'Save Item'}</Button>
          </DialogFooter>
        </DialogContent>
    );
  };


  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Item Inventory</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
               <Button size="sm" className="gap-1" onClick={() => setSelectedItem(null)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Item</span>
              </Button>
            </DialogTrigger>
            {renderDialogContent(false)}
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Primary Unit</TableHead>
                  <TableHead>{companyDetails.taxType} Rate</TableHead>
                  <TableHead>Ledger</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="secondary">{getItemTypeName(item.itemTypeId)}</Badge></TableCell>
                    <TableCell>{companyDetails.currencySymbol}{item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{units.find(u => u.id === item.unitId)?.name}</TableCell>
                    <TableCell>{getTaxRate(item.taxId) ?? 0}%</TableCell>
                    <TableCell>{ledgerAccounts.find(l => l.id === item.ledgerId)?.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {renderDialogContent(true)}
      </Dialog>
    </div>
  );
}
