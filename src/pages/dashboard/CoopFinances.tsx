import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { getTransactions, createTransaction, getFinancialSummary, generateFinancialReport, getProfile } from "@/lib/api";
import { Transaction, FinancialSummary } from "@/lib/types";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, FileText, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "CONTRIBUTION", "DIVIDEND", "LOAN", "LOAN_REPAYMENT"]),
  amount: z.number().min(1, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  reference: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const CoopFinances = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [showReportDialog, setShowReportDialog] = useState(false);
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
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "INCOME",
      amount: 0,
      description: "",
      category: "",
      reference: "",
    },
  });

  // Get user profile to extract cooperativeId
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const cooperativeId = user.cooperativeId || user.cooperative_id;

  useEffect(() => {
    if (cooperativeId) {
      loadData();
    }
  }, [cooperativeId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, summaryRes] = await Promise.all([
        getTransactions(cooperativeId, {
          type: filters.type === "all" ? undefined : filters.type,
          status: filters.status === "all" ? undefined : filters.status as "PENDING" | "APPROVED" | "REJECTED",
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        }),
        getFinancialSummary(cooperativeId)
      ]);

      setTransactions(transactionsRes.data.transactions);
      setFinancialSummary(summaryRes.data);
    } catch (error: any) {
      console.error('Error loading financial data:', error.message || error);
      toast({
        title: "Error",
        description: error.message || "Failed to load financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: 'monthly' | 'quarterly' | 'annual') => {
    if (!cooperativeId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No cooperative found",
      });
      return;
    }

    try {
      setGeneratingReport(true);
      
      // Use the existing generateFinancialReport API for PDF download
      const blob = await generateFinancialReport(cooperativeId, type);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} report generated and downloaded successfully`,
      });
      
      setShowReportDialog(false);
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setCreating(true);
      const transactionData = {
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        reference: data.reference,
      };
      await createTransaction(cooperativeId, transactionData);
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      setDialogOpen(false);
      form.reset();
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Processing</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      INCOME: "bg-green-100 text-green-800",
      EXPENSE: "bg-red-100 text-red-800",
      CONTRIBUTION: "bg-blue-100 text-blue-800",
      DIVIDEND: "bg-yellow-100 text-yellow-800",
      LOAN: "bg-purple-100 text-purple-800",
      LOAN_REPAYMENT: "bg-indigo-100 text-indigo-800",
    };
    return <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{type}</Badge>;
  };

  if (!cooperativeId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-12">No cooperative access found. Please contact administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your cooperative finances and transactions</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#b7eb34] text-[#b7eb34] hover:bg-[#b7eb34] hover:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Financial Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Report Period</Label>
                  <Select value={reportType} onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="quarterly">Quarterly Report</SelectItem>
                      <SelectItem value="annual">Annual Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleGenerateReport(reportType)}
                    disabled={generatingReport}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    {generatingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate & Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Transaction
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INCOME">Income</SelectItem>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                          <SelectItem value="CONTRIBUTION">Contribution</SelectItem>
                          <SelectItem value="DIVIDEND">Dividend</SelectItem>
                          <SelectItem value="LOAN">Loan</SelectItem>
                          <SelectItem value="LOAN_REPAYMENT">Loan Repayment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (RWF)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reference" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Transaction"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {financialSummary.totalIncome.toLocaleString()} RWF
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {financialSummary.totalExpenses.toLocaleString()} RWF
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financialSummary.netBalance.toLocaleString()} RWF
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="CONTRIBUTION">Contribution</SelectItem>
                  <SelectItem value="DIVIDEND">Dividend</SelectItem>
                  <SelectItem value="LOAN">Loan</SelectItem>
                  <SelectItem value="LOAN_REPAYMENT">Loan Repayment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PENDING">Processing</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`font-medium ${transaction.type === 'INCOME' || transaction.type === 'CONTRIBUTION' || transaction.type === 'DIVIDEND' || transaction.type === 'LOAN_REPAYMENT' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'INCOME' || transaction.type === 'CONTRIBUTION' || transaction.type === 'DIVIDEND' || transaction.type === 'LOAN_REPAYMENT' ? '+' : '-'}
                      {transaction.amount.toLocaleString()} RWF
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.isApproved ? 'APPROVED' : 'PENDING')}</TableCell>
                    <TableCell>
                      {transaction.user ? `${transaction.user.firstName} ${transaction.user.lastName}` : 'System'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoopFinances;

