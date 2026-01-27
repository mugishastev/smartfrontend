import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getProfile, getTransactions, getTransactionById } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/lib/types";
import { DollarSign, Filter, Eye, Calendar, TrendingUp, TrendingDown, Clock } from "lucide-react";

const getStatusText = (status: string) => {
    if (status === 'PENDING') return 'Processing';
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const AccountantTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [filters, setFilters] = useState<{
        type: string;
        status: string;
        startDate: string;
        endDate: string;
    }>({
        type: "all",
        status: "all",
        startDate: "",
        endDate: "",
    });
    const { toast } = useToast();

    useEffect(() => {
        loadTransactions();
    }, [filters]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const profileRes = await getProfile();
            const cooperativeId = profileRes.data.cooperativeId;

            if (!cooperativeId) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No cooperative found",
                });
                return;
            }

            const response = await getTransactions(cooperativeId, {
                type: filters.type === "all" ? undefined : filters.type,
                status: filters.status === "all" ? undefined : filters.status as "PENDING" | "APPROVED" | "REJECTED",
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            });

            setTransactions(response.data.transactions || []);
        } catch (error: any) {
            console.error('Error loading transactions:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to load transactions",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (transactionId: string) => {
        try {
            const response = await getTransactionById(transactionId);
            setSelectedTransaction(response.data);
            setShowDetailsDialog(true);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load transaction details",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'INCOME':
            case 'CONTRIBUTION':
            case 'DIVIDEND':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'EXPENSE':
            case 'LOAN':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            case 'LOAN_REPAYMENT':
                return <DollarSign className="h-4 w-4 text-blue-600" />;
            default:
                return <DollarSign className="h-4 w-4 text-gray-600" />;
        }
    };

    const totalIncome = transactions
        .filter(t => ['INCOME', 'CONTRIBUTION', 'DIVIDEND'].includes(t.type) && t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => ['EXPENSE', 'LOAN'].includes(t.type) && t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Ledger</h1>
                <p className="text-gray-600">Review and auditing all cooperative transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total count</p>
                                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Settled Income</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Settled Expenses</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Net Flow</p>
                                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totalIncome - totalExpenses)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                    <SelectItem value="CONTRIBUTION">Contribution</SelectItem>
                                    <SelectItem value="DIVIDEND">Dividend</SelectItem>
                                    <SelectItem value="LOAN">Loan</SelectItem>
                                    <SelectItem value="LOAN_REPAYMENT">Loan Repayment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Processing</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                        <Button onClick={loadTransactions} variant="outline" className="h-10">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transactions List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading ledger...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No transactions recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(transaction.type)}
                                                    <span className="text-sm">{transaction.type.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate text-sm" title={transaction.description}>
                                                    {transaction.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className={`font-semibold text-sm ${['INCOME', 'CONTRIBUTION', 'DIVIDEND'].includes(transaction.type)
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {['INCOME', 'CONTRIBUTION', 'DIVIDEND'].includes(transaction.type) ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusBadge(transaction.status)} border text-[10px]`}>
                                                    {getStatusText(transaction.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(transaction.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-xl">
                    {selectedTransaction && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Transaction Detailed View</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Type</p>
                                        <p className="font-semibold text-gray-900">{selectedTransaction.type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                                        <Badge className={`${getStatusBadge(selectedTransaction.status)} border`}>
                                            {getStatusText(selectedTransaction.status)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Amount</p>
                                        <p className={`font-bold text-xl ${['INCOME', 'CONTRIBUTION', 'DIVIDEND'].includes(selectedTransaction.type)
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}>
                                            {['INCOME', 'CONTRIBUTION', 'DIVIDEND'].includes(selectedTransaction.type) ? '+' : '-'}
                                            {formatCurrency(selectedTransaction.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Category</p>
                                        <p className="font-semibold text-gray-900">{selectedTransaction.category || 'Uncategorized'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Description</p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {selectedTransaction.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 text-xs text-gray-500">
                                    <div className="flex justify-between border-b pb-2">
                                        <span>Date & Time</span>
                                        <span className="font-medium text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                                    </div>
                                    {selectedTransaction.reference && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span>Ref Number</span>
                                            <span className="font-mono text-gray-900">{selectedTransaction.reference}</span>
                                        </div>
                                    )}
                                    {selectedTransaction.blockchainHash && (
                                        <div className="space-y-1">
                                            <span>Blockchain Ledger Hash</span>
                                            <p className="font-mono text-[10px] text-gray-400 break-all bg-gray-50 p-2 rounded">
                                                {selectedTransaction.blockchainHash}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AccountantTransactions;
