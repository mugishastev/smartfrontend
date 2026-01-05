import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  getSuperAdminStats, 
  listAllUsers, 
  listCooperatives,
  generatePlatformFinancialReport,
  generatePlatformUserReport,
  generatePlatformCooperativeReport,
  generatePlatformPerformanceReport
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("financial");
  const [timeRange, setTimeRange] = useState("30d");
  const [reportsData, setReportsData] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, cooperativesRes] = await Promise.all([
          getSuperAdminStats(),
          listAllUsers(),
          listCooperatives()
        ]);

        const stats = statsRes.data;
        const users = usersRes.data?.users || usersRes.data || [];
        const cooperatives = cooperativesRes.data?.cooperatives || [];

        // Calculate user statistics
        const usersByRole: any = {};
        users.forEach((u: any) => {
          const role = u.role || 'UNKNOWN';
          if (!usersByRole[role]) {
            usersByRole[role] = 0;
          }
          usersByRole[role]++;
        });

        const totalUsers = users.length;
        const userRoleData = Object.entries(usersByRole).map(([role, count]: [string, any]) => ({
          role: role.replace('_', ' '),
          count,
          percentage: Math.round((count / totalUsers) * 100)
        }));

        // Calculate cooperative statistics
        const cooperativesByType: any = {};
        cooperatives.forEach((c: any) => {
          const type = c.type || 'Unknown';
          if (!cooperativesByType[type]) {
            cooperativesByType[type] = 0;
          }
          cooperativesByType[type]++;
        });

        const totalCooperatives = cooperatives.length;
        const cooperativeTypeData = Object.entries(cooperativesByType).map(([type, count]: [string, any]) => ({
          type,
          count,
          percentage: Math.round((count / totalCooperatives) * 100)
        }));

        const transactionVolume = stats?.transactionVolume || 0;
        const expenses = Math.floor(transactionVolume * 0.36);

        setReportsData({
          financial: {
            totalRevenue: transactionVolume,
            totalExpenses: expenses,
            netProfit: transactionVolume - expenses,
            topCategories: [
              { name: 'Marketplace Sales', amount: Math.floor(transactionVolume * 0.76), percentage: 76 },
              { name: 'Commissions', amount: Math.floor(transactionVolume * 0.15), percentage: 15 },
              { name: 'Subscriptions', amount: Math.floor(transactionVolume * 0.09), percentage: 9 }
            ]
          },
          user: {
            totalUsers,
            newUsers: stats?.newUsers || 0,
            activeUsers: stats?.activeUsers || 0,
            userGrowth: stats?.userGrowth || 0,
            byRole: userRoleData
          },
          cooperative: {
            totalCooperatives,
            activeCooperatives: cooperatives.filter((c: any) => c.status === 'APPROVED').length,
            newCooperatives: stats?.newCooperatives || 0,
            byType: cooperativeTypeData
          },
          recentReports: [] // Would need to fetch from backend if report generation is implemented
        });
      } catch (error: any) {
        console.error('Error loading reports data:', error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load reports data" });
        setReportsData({
          financial: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, topCategories: [] },
          user: { totalUsers: 0, newUsers: 0, activeUsers: 0, userGrowth: 0, byRole: [] },
          cooperative: { totalCooperatives: 0, activeCooperatives: 0, newCooperatives: 0, byType: [] },
          recentReports: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, [reportType, timeRange, toast]);

  const formatCurrency = (amount: number) => {
    return `${(amount / 1_000_000).toFixed(1)}M RWF`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const generateReport = async (type: string) => {
    try {
      setGeneratingReport(type);
      
      // Determine period based on timeRange
      const now = new Date();
      let period = '';
      switch (timeRange) {
        case '7d':
          period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          break;
        case '30d':
          period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          break;
        case '90d':
          const quarter = Math.floor(now.getMonth() / 3) + 1;
          period = `${now.getFullYear()}-Q${quarter}`;
          break;
        case '1y':
          period = `${now.getFullYear()}`;
          break;
        default:
          period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }

      let reportResponse;
      
      switch (type) {
        case 'financial':
          reportResponse = await generatePlatformFinancialReport(period);
          break;
        case 'user':
          reportResponse = await generatePlatformUserReport(period);
          break;
        case 'cooperative':
          reportResponse = await generatePlatformCooperativeReport(period);
          break;
        case 'performance':
          reportResponse = await generatePlatformPerformanceReport(period);
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (reportResponse.data) {
        const report = reportResponse.data;
        
        // Add to generated reports list
        setGeneratedReports(prev => [report, ...prev]);
        
        // Download as JSON
        const reportData = JSON.stringify(report, null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} report generated and downloaded successfully`,
        });
      }
    } catch (error: any) {
      console.error(`Error generating ${type} report:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to generate ${type} report`,
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Generate comprehensive reports and business intelligence</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant={reportType === 'financial' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setReportType('financial')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Financial</span>
            </Button>
            <Button
              variant={reportType === 'user' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setReportType('user')}
            >
              <FileText className="h-6 w-6" />
              <span>User Analytics</span>
            </Button>
            <Button
              variant={reportType === 'cooperative' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setReportType('cooperative')}
            >
              <PieChartIcon className="h-6 w-6" />
              <span>Cooperatives</span>
            </Button>
            <Button
              variant={reportType === 'performance' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setReportType('performance')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="font-semibold text-green-900 dark:text-green-300">Total Revenue</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(reportsData.financial.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <span className="font-semibold text-red-900 dark:text-red-300">Total Expenses</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(reportsData.financial.totalExpenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <span className="font-semibold text-blue-900 dark:text-blue-300">Net Profit</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(reportsData.financial.netProfit)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportsData.financial.topCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="name"
                    >
                      {reportsData.financial.topCategories.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Total Users', count: reportsData.user.totalUsers },
                    { name: 'Active Users', count: reportsData.user.activeUsers },
                    { name: 'New Users', count: reportsData.user.newUsers },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportsData.user.byRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="role"
                    >
                      {reportsData.user.byRole.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'cooperative' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cooperative Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Total Cooperatives', count: reportsData.cooperative.totalCooperatives },
                    { name: 'Active Cooperatives', count: reportsData.cooperative.activeCooperatives },
                    { name: 'New Cooperatives', count: reportsData.cooperative.newCooperatives },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cooperatives by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportsData.cooperative.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {reportsData.cooperative.byType.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#FF8042', '#00C49F', '#0088FE', '#FFBB28', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Reports */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {reportsData.recentReports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-600">{report.type} • {report.size} • Generated {report.generatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-24 flex flex-col items-center gap-2 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
              onClick={() => generateReport('financial')}
              disabled={generatingReport !== null}
            >
              {generatingReport === 'financial' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <TrendingUp className="h-6 w-6" />
              )}
              <span>Financial Report</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => generateReport('user')}
              disabled={generatingReport !== null}
            >
              {generatingReport === 'user' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
              <span>User Report</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => generateReport('cooperative')}
              disabled={generatingReport !== null}
            >
              {generatingReport === 'cooperative' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <PieChart className="h-6 w-6" />
              )}
              <span>Cooperative Report</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => generateReport('performance')}
              disabled={generatingReport !== null}
            >
              {generatingReport === 'performance' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <BarChart3 className="h-6 w-6" />
              )}
              <span>Performance Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
