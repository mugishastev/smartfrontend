import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getActivityLogs } from '@/lib/admin-settings-api';
import { Activity, Search, Filter, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface Log {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
    createdAt: string;
    user?: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

export default function ActivityAuditSection() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        userId: '',
        action: '',
    });

    const limit = 20;

    useEffect(() => {
        loadLogs();
    }, [page, filters]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * limit;
            const response = await getActivityLogs({
                userId: filters.userId || undefined,
                action: filters.action || undefined,
                limit,
                offset,
            });

            if (response.data) {
                setLogs(response.data.logs);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
        setPage(1); // Reset to first page
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Audit & Activity Logs
                </CardTitle>
                <CardDescription>
                    View system activities and user actions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search by User ID..."
                                className="pl-9"
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                            />
                        </div>
                        <div className="w-[200px]">
                            <Select
                                value={filters.action || 'all'}
                                onValueChange={(val) => handleFilterChange('action', val)}
                            >
                                <SelectTrigger>
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                    <SelectItem value="REGISTER">Register</SelectItem>
                                    <SelectItem value="UPDATE_PROFILE">Update Profile</SelectItem>
                                    <SelectItem value="PASSWORD_CHANGED">Password Change</SelectItem>
                                    <SelectItem value="CREATE_ORDER">Create Order</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{log.user.firstName} {log.user.lastName}</span>
                                                        <span className="text-xs text-gray-500">{log.user.email}</span>
                                                    </div>
                                                ) : 'System'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {log.entity}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                                                {/* Simple rendering for now */}
                                                {JSON.stringify(log.details) || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-500">
                            Page {page} of {totalPages || 1}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
