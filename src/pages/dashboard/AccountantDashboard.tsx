import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Calculator,
  BarChart3,
  Download,
  Plus,
  Eye,
  PiggyBank,
  Receipt
} from "lucide-react";
import { getAccountantDashboard, getProfile, getFinancialSummary, generateFinancialReport, createTransaction } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { User, AccountantDashboardStats, FinancialSummary, CreateTransactionRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AccountantDashboardStats | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transactionForm, setTransactionForm] = useState<{
    amount: number;
    type: CreateTransactionRequest['type'];
    category: string;
    description: string;
    reference: string;
    paymentMethod: string;
  }>({
    amount: 0,
    type: "EXPENSE",
    category: "Operations",
    description: "",
    reference: "",
    paymentMethod: "CASH",
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        // Load user profile first to get cooperativeId
        const profileRes = await getProfile();
        setProfile(profileRes.data);

        if (!profileRes.data.cooperativeId) {
          setStats(null);
          return;
        }

        const cooperativeId = profileRes.data.cooperativeId;

        // Load accountant dashboard data
        const statsRes = await getAccountantDashboard(cooperativeId);
        setStats(statsRes.data.stats);

        // Load financial summary
        const summaryRes = await getFinancialSummary(cooperativeId);
        setFinancialSummary(summaryRes.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleGenerateReport = async (type: 'monthly' | 'quarterly' | 'annual') => {
    try {
      setGeneratingReport(true);
      if (profile?.cooperativeId) {
        const reportRes = await generateFinancialReport(profile.cooperativeId, type);
        // Handle report download
        const blob = new Blob([reportRes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.cooperativeId) return;

    try {
      setSubmitting(true);
      await createTransaction(profile.cooperativeId, transactionForm);
      toast({
        title: "Transaction Recorded",
        description: "The transaction has been successfully recorded.",
      });
      setIsRecordDialogOpen(false);
      // Refresh dashboard
      window.location.reload();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to record transaction",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dashboardStats = [
    {
      label: "Total Balance",
      value: stats ? formatCurrency(stats.totalBalance) : '-',
      icon: Wallet,
      color: "green" as const,
      description: "Current balance"
    },
    {
      label: "Monthly Income",
      value: stats ? formatCurrency(stats.monthlyIncome) : '-',
      icon: TrendingUp,
      color: "blue" as const,
      description: "This month"
    },
    {
      label: "Monthly Expenses",
      value: stats ? formatCurrency(stats.monthlyExpenses) : '-',
      icon: TrendingDown,
      color: "red" as const,
      description: "This month"
    },
    {
      label: "Member Savings",
      value: stats ? formatCurrency(stats.totalSavings) : '-',
      icon: PiggyBank,
      color: "purple" as const,
      description: "Total accumulated"
    }
  ];

  return (
    <div className="p-6">
      <DashboardHeader
        title={loading ? undefined : `Accountant Dashboard - ${profile?.cooperative?.name || 'Cooperative'}`}
        subtitle={loading ? undefined : `Welcome back, ${profile?.firstName}! Manage financial operations and reports`}
        loading={loading}
        actions={
          !loading && profile && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto min-h-[44px] bg-[#b7eb34] hover:bg-[#a5d62f] text-white text-sm sm:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record New Transaction</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRecordTransaction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        required
                        value={transactionForm.amount}
                        onChange={e => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select
                        value={transactionForm.type}
                        onValueChange={(v: CreateTransactionRequest['type']) => setTransactionForm({ ...transactionForm, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INCOME">Income</SelectItem>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                          <SelectItem value="CONTRIBUTION">Contribution</SelectItem>
                          <SelectItem value="DIVIDEND">Dividend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        required
                        value={transactionForm.category}
                        onChange={e => setTransactionForm({ ...transactionForm, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        required
                        value={transactionForm.description}
                        onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                          value={transactionForm.paymentMethod}
                          onValueChange={v => setTransactionForm({ ...transactionForm, paymentMethod: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                            <SelectItem value="CHECK">Check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Reference / Receipt #</Label>
                        <Input
                          id="reference"
                          placeholder="Ref-123..."
                          value={transactionForm.reference}
                          onChange={e => setTransactionForm({ ...transactionForm, reference: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#b7eb34] hover:bg-[#a5d62f] text-white"
                        disabled={submitting}
                      >
                        {submitting ? "Saving..." : "Save Transaction"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                className="w-full sm:w-auto min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                onClick={() => handleGenerateReport('monthly')}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Monthly Report
                  </>
                )}
              </Button>
            </div>
          )
        }
      />

      {/* Stats Grid */}
      <DashboardStatGrid loading={loading}>
        {!loading && dashboardStats.map((stat, index) => (
          <DashboardStatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            description={stat.description}
          />
        ))}
      </DashboardStatGrid>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Income vs Expenses</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Total Income</p>
                    <p className="text-sm text-gray-600">All sources</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {financialSummary ? formatCurrency(financialSummary.totalIncome) : '-'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Total Expenses</p>
                    <p className="text-sm text-gray-600">All categories</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-red-600">
                  {financialSummary ? formatCurrency(financialSummary.totalExpenses) : '-'}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900">Net Balance</p>
                  <p className={`text-xl font-bold ${financialSummary && financialSummary.netBalance >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                    }`}>
                    {financialSummary ? formatCurrency(financialSummary.netBalance) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Member Financial Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">Total Members</p>
                  <p className="text-sm text-gray-600">Active contributors</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {stats?.activeMembers || '-'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">Average Savings</p>
                  <p className="text-sm text-gray-600">Per member</p>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  {stats ? formatCurrency(stats.averageSavings) : '-'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">Pending Dividends</p>
                  <p className="text-sm text-gray-600">To be distributed</p>
                </div>
                <p className="text-xl font-bold text-orange-600">
                  {stats ? formatCurrency(stats.pendingDividends) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsRecordDialogOpen(true)}>
          <CardContent className="pt-6 text-center">
            <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Record Transaction</h3>
            <p className="text-sm text-gray-600">Add income or expense</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/accountant-member-finances')}>
          <CardContent className="pt-6 text-center">
            <PiggyBank className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Member Finances</h3>
            <p className="text-sm text-gray-600">Track individual savings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/accountant-reports')}>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 text-[#b7eb34] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Financial Reports</h3>
            <p className="text-sm text-gray-600">Generate detailed reports</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/accountant-wallet')}>
          <CardContent className="pt-6 text-center">
            <Wallet className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Cooperative Wallet</h3>
            <p className="text-sm text-gray-600">Manage digital payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Generate Financial Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleGenerateReport('monthly')}
              disabled={generatingReport}
              className="h-16 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              variant="ghost"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Monthly Report</span>
            </Button>
            <Button
              onClick={() => handleGenerateReport('quarterly')}
              disabled={generatingReport}
              className="h-16 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
              variant="ghost"
            >
              <Calculator className="h-6 w-6" />
              <span className="text-sm font-medium">Quarterly Report</span>
            </Button>
            <Button
              onClick={() => handleGenerateReport('annual')}
              disabled={generatingReport}
              className="h-16 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
              variant="ghost"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Annual Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantDashboard;
