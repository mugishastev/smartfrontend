import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import { getMemberContributions, getMemberProfile } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type Contribution = {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  cooperative?: {
    name: string;
  };
};

const MemberContributions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    count: number;
    averageMonthly: number;
    period: string;
  } | null>(null);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const profileRes = await getMemberProfile();
      if (!profileRes.data.id) {
        throw new Error('No member profile found');
      }
      const res = await getMemberContributions(profileRes.data.id);
      setContributions(res.data.contributions || []);
      setSummary((res.data as any).summary || null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load contributions",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group contributions by month for chart
  const monthlyData = contributions.reduce((acc, contribution) => {
    const date = new Date(contribution.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, total: 0, count: 0 };
    }
    acc[monthKey].total += contribution.amount;
    acc[monthKey].count += 1;
    return acc;
  }, {} as { [key: string]: { month: string; total: number; count: number } });

  const monthlyArray = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  const maxAmount = Math.max(...monthlyArray.map(m => m.total), 1);

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
            <p className="text-gray-600">Loading contributions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Contributions</h1>
        <p className="text-gray-600">Track your contribution history to the cooperative</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Total Contributions</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(summary.total)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Over {summary.period}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Average Monthly</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(summary.averageMonthly)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-purple-600">{summary.count}</p>
              <p className="text-xs text-gray-500 mt-1">Contributions made</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Chart */}
      {monthlyArray.length > 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Monthly Contributions (Last 12 Months)
            </h3>
            <div className="space-y-3">
              {monthlyArray.map((month) => {
                const date = new Date(month.month + '-01');
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                const percentage = (month.total / maxAmount) * 100;
                return (
                  <div key={month.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{monthName}</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(month.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-[#b7eb34] h-4 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contributions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Contribution History</h3>
          </div>
          {contributions.length === 0 ? (
            <div className="text-center py-12 px-6">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No contributions found</p>
              <p className="text-sm text-gray-500 mt-2">
                Your contribution history will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-600">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-900">
                        {contribution.type || 'Contribution'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {contribution.description || 'No description'}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(contribution.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(contribution.status)}>
                        {contribution.status}
                      </Badge>
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

export default MemberContributions;
