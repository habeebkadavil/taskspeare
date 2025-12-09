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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { User, UserPermission, Technician } from '@/lib/types';
import { useAuth, auth as authService } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allPermissions: { id: UserPermission, label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'jobs', label: 'Job Orders' },
    { id: 'sales', label: 'Sales' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'customers', label: 'Customers' },
    { id: 'technicians', label: 'Technicians' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'chart-of-accounts', label: 'Chart of Accounts' },
    { id: 'reports', label: 'Reports' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'Settings' },
];

export function UsersClient({ initialUsers, technicians }: { initialUsers: User[], technicians: Technician[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserPermissions, setCurrentUserPermissions] = useState<Set<UserPermission>>(new Set());
  const [currentTechnicianId, setCurrentTechnicianId] = useState<string | undefined>();
  
  const auth = useAuth();
  const { toast } = useToast();

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');


  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setCurrentUserPermissions(new Set(user.permissions));
    setCurrentTechnicianId(user.technicianId);
    setIsEditDialogOpen(true);
  };

  const handlePermissionChange = (permission: UserPermission, checked: boolean) => {
    setCurrentUserPermissions(prev => {
        const newPermissions = new Set(prev);
        if (checked) {
            newPermissions.add(permission);
        } else {
            newPermissions.delete(permission);
        }
        return newPermissions;
    });
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await authService.register(newUserEmail, newUserPassword, newUserName);

      const newUser: User = {
        id: created.id,
        name: created.name || newUserName,
        email: created.email,
        avatarUrl: `https://picsum.photos/seed/${newUserName}/200/200`,
        permissions: Array.from(currentUserPermissions),
        technicianId: currentTechnicianId,
      };
      setUsers(prev => [...prev, newUser]);

      toast({ title: 'Success', description: 'User created successfully.' });
      setIsAddDialogOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setCurrentUserPermissions(new Set());
      setCurrentTechnicianId(undefined);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error creating user', description: error.message });
    }
  };


  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Enter the details for the new user and set their permissions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="technician" className="text-right">Technician</Label>
                   <Select value={currentTechnicianId} onValueChange={setCurrentTechnicianId}>
                    <SelectTrigger id="technician" className="col-span-3">
                        <SelectValue placeholder="Link to technician (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        {technicians.map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 border p-4 rounded-md">
                        {allPermissions.map(p => (
                            <div key={`add-${p.id}`} className="flex items-center gap-2">
                                <Checkbox 
                                    id={`add-${p.id}`} 
                                    onCheckedChange={(checked) => handlePermissionChange(p.id, !!checked)}
                                />
                                <Label htmlFor={`add-${p.id}`} className="font-normal">{p.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save User</Button>
              </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Linked Technician</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.technicianId ? technicians.find(t => t.id === user.technicianId)?.name : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map(permission => <Badge key={permission} variant="secondary">{permission.replace('-', ' ')}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the details and permissions for {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" defaultValue={selectedUser?.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input id="edit-email" type="email" defaultValue={selectedUser?.email} className="col-span-3" disabled />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">New Password</Label>
              <Input id="edit-password" type="password" placeholder="Leave blank to keep current" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-technician" className="text-right">Technician</Label>
              <Select value={currentTechnicianId} onValueChange={setCurrentTechnicianId}>
                <SelectTrigger id="edit-technician" className="col-span-3">
                    <SelectValue placeholder="Link to technician (optional)" />
                </SelectTrigger>
                <SelectContent>
                    {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-4 mt-2">
                    {allPermissions.map(p => (
                        <div key={p.id} className="flex items-center gap-2">
                            <Checkbox 
                                id={`edit-${p.id}`} 
                                checked={currentUserPermissions.has(p.id)}
                                onCheckedChange={(checked) => handlePermissionChange(p.id, !!checked)}
                            />
                            <Label htmlFor={`edit-${p.id}`} className="font-normal">{p.label}</Label>
                        </div>
                    ))}
                </div>
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
