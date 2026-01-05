import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  PiggyBank,
  TrendingUp,
  BadgeAlert,
  Landmark,
  ArrowDownCircle,
  History,
  Bell,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMemberDashboard, getMemberProfile } from "@/lib/api";
import type { User, MemberDashboardData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const MemberDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load user profile first to get memberId
        const profileRes = await getMemberProfile();
        setProfile(profileRes.data);

        if (!profileRes.data.id) {
          throw new Error('No member profile found');
        }

        // Load member dashboard data
        const dashboardRes = await getMemberDashboard(profileRes.data.id);
        setDashboardData(dashboardRes.data);
      } catch (err: any) {
        console.error('Error loading dashboard:', err);
        setError(err?.message || 'Failed to load dashboard data');
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.message || 'Failed to load dashboard data',
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [toast]);

  const financialSummary = dashboardData?.financialSummary;

  // Financial Summary Cards
  const financialCards = [
    {
      label: "Total Shares",
      value: financialSummary ? formatCurrency(financialSummary.shares) : "RWF 0",
      icon: PieChart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Your ownership stake in the cooperative",
    },
    {
      label: "Total Savings",
      value: financialSummary ? formatCurrency(financialSummary.savings) : "RWF 0",
      icon: PiggyBank,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Your personal savings account balance",
    },
    {
      label: "Total Contributions",
      value: financialSummary ? formatCurrency(financialSummary.contributions) : "RWF 0",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Lifetime contributions made",
    },
    {
      label: "Outstanding Loans",
      value: financialSummary ? formatCurrency(financialSummary.loans) : "RWF 0",
      icon: BadgeAlert,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Current loan balance to be repaid",
    },
    {
      label: "Total Dividends",
      value: financialSummary ? formatCurrency(financialSummary.dividends) : "RWF 0",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Dividends earned from cooperative",
    },
  ];

  const handleRequestLoan = () => {
    navigate('/member-requests', { state: { action: 'loan' } });
  };

  const handleRequestWithdrawal = () => {
    navigate('/member-requests', { state: { action: 'withdrawal' } });
  };

  const handleViewRequests = () => {
    navigate('/member-requests');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CONTRIBUTION':
        return TrendingUp;
      case 'LOAN':
        return Landmark;
      case 'LOAN_REPAYMENT':
        return DollarSign;
      case 'WITHDRAWAL':
        return ArrowDownCircle;
      default:
        return DollarSign;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CONTRIBUTION':
        return 'text-green-600 bg-green-50';
      case 'LOAN':
        return 'text-orange-600 bg-orange-50';
      case 'LOAN_REPAYMENT':
        return 'text-blue-600 bg-blue-50';
      case 'WITHDRAWAL':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Member Dashboard</h1>
        <p className="text-gray-600 dark:text-white">
          Welcome back, {dashboardData?.member?.firstName || 'Member'} {dashboardData?.member?.lastName || ''}! Here's your financial overview.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {financialCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-white">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {dashboardData?.pendingRequests || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">Awaiting approval</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Active Loans</p>
                <p className="text-3xl font-bold text-orange-600">
                  {dashboardData?.activeLoans || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">Currently active</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg">
                <Landmark className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Member Since</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {dashboardData?.member?.joinedAt 
                    ? new Date(dashboardData.member.joinedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">
                  {dashboardData?.member?.email || ''}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleRequestLoan}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Landmark className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Request a Loan</p>
                <p className="text-xs opacity-90">Submit a new loan request</p>
              </div>
            </Button>
            <Button
              onClick={handleRequestWithdrawal}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <ArrowDownCircle className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Request Withdrawal</p>
                <p className="text-xs opacity-90">Withdraw from savings</p>
              </div>
            </Button>
            <Button
              onClick={handleViewRequests}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 border-2"
            >
              <History className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">View My Requests</p>
                <p className="text-xs text-gray-600 dark:text-white">Track request status</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Financial Activities */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Financial Activities</h3>
              <Link to="/member-contributions" className="text-sm text-[#b7eb34] hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                dashboardData.recentTransactions.slice(0, 10).map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`${getTransactionColor(transaction.type)} p-2 rounded-lg`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {transaction.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.description || 'No description'}
                          </p>
                          {transaction.cooperative && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {transaction.cooperative.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge className={`${getStatusBadge(transaction.status)} text-xs`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contribution History Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contribution History</h3>
              <Link to="/member-contributions" className="text-sm text-[#b7eb34] hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.contributionHistory && dashboardData.contributionHistory.length > 0 ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-[#b7eb34]">
                      {formatCurrency(
                        dashboardData.contributionHistory.reduce((sum, c) => sum + c.amount, 0)
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 12 months</p>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboardData.contributionHistory.slice(-5).reverse().map((contribution, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(contribution.amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(contribution.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p>No contribution history</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Announcements</h3>
            <Link to="/member-announcements" className="text-sm text-[#b7eb34] hover:underline">
              View All
            </Link>
          </div>
            <div className="space-y-4">
              {dashboardData?.recentAnnouncements && dashboardData.recentAnnouncements.length > 0 ? (
                dashboardData.recentAnnouncements.slice(0, 5).map((announcement) => (
                  <Link
                    key={announcement.id}
                    to={`/member-announcements`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
                        <Bell className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{announcement.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {announcement.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p>No recent announcements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default MemberDashboard;
