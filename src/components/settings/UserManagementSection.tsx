import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { listAllUsers, updateUserStatus } from '@/lib/admin-settings-api';
import { User } from '@/lib/types';
import { Users, Search, Loader2, MoreHorizontal, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function UserManagementSection() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadUsers();
    }, [page, roleFilter, search]);

    // Debounce search could be added here, but for simplicity relying on direct effect

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await listAllUsers(search, roleFilter, page);
            if (response.data) {
                setUsers(response.data.users);
                setTotal(response.data.total);
            }
        } catch (error: any) {
            console.error('Failed to load users:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load users list',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
        try {
            await updateUserStatus(userId, action);
            toast({
                title: 'Success',
                description: `User ${action}d successfully`,
                className: 'bg-green-50 text-green-900 border-green-200',
            });
            loadUsers(); // Refresh list
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || `Failed to ${action} user`,
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User & Role Management
                </CardTitle>
                <CardDescription>
                    Manage platform users, roles, and access permissions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search users by name or email..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="COOP_ADMIN">Coop Admin</SelectItem>
                                <SelectItem value="MEMBER">Member</SelectItem>
                                <SelectItem value="BUYER">Buyer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                                                    <span className="text-xs text-gray-500">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{user.role.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                                                >
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(user.createdAt || '').toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                            Copy Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {user.isActive ? (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleStatusUpdate(user.id, 'deactivate')}
                                                            >
                                                                <Ban className="mr-2 h-4 w-4" />
                                                                Deactivate
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                className="text-green-600"
                                                                onClick={() => handleStatusUpdate(user.id, 'activate')}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Activate
                                                            </DropdownMenuItem>
                                                        )}
                                                        {/* Hidden delete for safety unless needed */}
                                                        {/* <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem> */}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-gray-500">
                            Showing {users.length} of {total} users
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={users.length < 20 || loading} // Simple pagination
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
