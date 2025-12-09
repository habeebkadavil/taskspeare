
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Pencil } from 'lucide-react';
import type { Technician } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { companyDetails } from '@/lib/company';

export function TechniciansClient({ initialTechnicians }: { initialTechnicians: Technician[] }) {
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);

  const handleEditClick = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsEditDialogOpen(true);
  };
  
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Technicians</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Technician</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Technician</DialogTitle>
                <DialogDescription>Enter the details for the new technician.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payout" className="text-right">Payout/hr</Label>
                  <Input id="payout" type="number" placeholder="e.g. 50" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skills" className="text-right">Skills</Label>
                  <Input id="skills" placeholder="e.g., Haircut, Coloring" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Technician</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead className="text-right">Payout/hr</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map(tech => (
                  <TableRow key={tech.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={tech.avatarUrl} alt={tech.name} data-ai-hint="person portrait"/>
                          <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{tech.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tech.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {tech.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{companyDetails.currencySymbol}{tech.payoutPerHour?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(tech)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>Update the details for {selectedTechnician?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" defaultValue={selectedTechnician?.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input id="edit-email" type="email" defaultValue={selectedTechnician?.email} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-payout" className="text-right">Payout/hr</Label>
                <Input id="edit-payout" type="number" defaultValue={selectedTechnician?.payoutPerHour || 0} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-skills" className="text-right">Skills</Label>
              <Input id="edit-skills" defaultValue={selectedTechnician?.skills.join(', ')} placeholder="e.g., Haircut, Coloring" className="col-span-3" />
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
