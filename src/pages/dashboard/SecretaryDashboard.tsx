import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Eye,
  Download
} from "lucide-react";
import { getSecretaryDashboard, getPendingApprovals, approveTransaction, rejectTransaction, getProfile } from "@/lib/api";
import type { User, SecretaryDashboardStats, PendingApproval } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const SecretaryDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SecretaryDashboardStats | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

        // Load secretary dashboard data
        const statsRes = await getSecretaryDashboard(cooperativeId);
        setStats(statsRes.data.stats);

        // Load pending approvals
        const approvalsRes = await getPendingApprovals(cooperativeId);
        setPendingApprovals(approvalsRes.data.approvals || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(approvalId);
      if (action === 'approve') {
        await approveTransaction(approvalId);
        toast({
          title: "Success",
          description: "Transaction approved successfully",
        });
      } else {
        await rejectTransaction(approvalId);
        toast({
          title: "Success",
          description: "Transaction rejected successfully",
        });
      }

      // Refresh pending approvals and stats
      if (profile?.cooperativeId) {
        const [approvalsRes, statsRes] = await Promise.all([
          getPendingApprovals(profile.cooperativeId),
          getSecretaryDashboard(profile.cooperativeId)
        ]);
        setPendingApprovals(approvalsRes.data.approvals || []);
        setStats(statsRes.data.stats);
      }
    } catch (err: any) {
      console.error('Error processing approval:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${action} transaction`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const dashboardStats = [
    {
      label: "Total Members",
      value: stats?.totalMembers ?? '-',
      icon: Users,
      color: "blue" as const,
      description: "Active members"
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingApprovals ?? '-',
      icon: Clock,
      color: "orange" as const,
      description: "Awaiting review"
    },
    {
      label: "Monthly Transactions",
      value: stats?.monthlyTransactions ?? '-',
      icon: DollarSign,
      color: "green" as const,
      description: "This month"
    },
    {
      label: "Compliance Rate",
      value: stats ? `${stats.complianceRate}%` : '-',
      icon: CheckCircle,
      color: "purple" as const,
      description: "Last 30 days"
    }
  ];

  return (
    <div className="p-6">
      <DashboardHeader
        title={loading ? undefined : `Secretary Dashboard - ${profile?.cooperative?.name || 'Cooperative'}`}
        subtitle={loading ? undefined : `Welcome back, ${profile?.firstName}! Review and approve cooperative transactions`}
        loading={loading}
        actions={
          !loading && profile && (
            <>
              <Button 
                className="w-full sm:w-auto min-h-[44px] bg-[#b7eb34] hover:bg-[#b7eb34] text-white text-sm sm:text-base"
                onClick={() => navigate('/secretary-reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full sm:w-auto min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </>
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

      {/* Pending Approvals Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Pending Approvals
            {!loading && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({pendingApprovals.length})
              </span>
            )}
          </h3>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <p>No pending approvals at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {approval.type.replace('_', ' ')}
                        </h4>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          approval.priority === "HIGH"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
                            : approval.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        }`}>
                          {approval.priority} Priority
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          approval.status === "PENDING"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                            : approval.status === "APPROVED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
                        }`}>
                          {approval.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(approval.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Requested By</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {approval.requestedBy}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(approval.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {approval.category}
                          </p>
                        </div>
                      </div>

                      {approval.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {approval.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {approval.status === 'PENDING' && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 min-h-[44px] border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm sm:text-base"
                        onClick={() => navigate(`/secretary-transactions/${approval.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Details
                      </Button>
                      <Button
                        className="w-full sm:flex-1 min-h-[44px] bg-[#b7eb34] hover:bg-[#b7eb34] text-white text-sm sm:text-base"
                        onClick={() => handleApproval(approval.id, 'approve')}
                        disabled={processingId === approval.id}
                      >
                        {processingId === approval.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 min-h-[44px] border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm sm:text-base"
                        onClick={() => handleApproval(approval.id, 'reject')}
                        disabled={processingId === approval.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/secretary-transactions')}>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">All Transactions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View all transaction history</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/secretary-reports')}>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Generate Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create committee reports</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/coop-members')}>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Member Oversight</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Review member activities</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
