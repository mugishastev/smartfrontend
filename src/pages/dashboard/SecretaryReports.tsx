import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { generateFinancialReport, getProfile, getFinancialSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SecretaryReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFinancialSummary();
  }, []);

  const loadFinancialSummary = async () => {
    try {
      const profileRes = await getProfile();
      const cooperativeId = profileRes.data.cooperativeId;

      if (!cooperativeId) {
        return;
      }

      const summaryRes = await getFinancialSummary(cooperativeId);
      setFinancialSummary(summaryRes.data);
    } catch (error: any) {
      console.error('Error loading financial summary:', error);
    }
  };

  const handleGenerateReport = async () => {
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

      const blob = await generateFinancialReport(cooperativeId, reportType);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Report generated and downloaded successfully`,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financial Reports</h1>
        <p className="text-gray-600 dark:text-white">Generate and download financial reports for your cooperative</p>
      </div>

      {/* Financial Summary */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalIncome || 0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.totalExpenses || 0)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white mb-1">Net Balance</p>
                  <p className={`text-2xl font-bold ${(financialSummary.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialSummary.netBalance || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{financialSummary.totalTransactions || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Financial Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-900 dark:text-white mb-2 block">Report Period</Label>
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Report includes:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                <li>Income and expense summary</li>
                <li>Transaction details</li>
                <li>Financial trends</li>
                <li>Compliance metrics</li>
              </ul>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate & Download Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Monthly Report</p>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Generated
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>No previous reports available</p>
                <p className="text-xs mt-1">Generate your first report to get started</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <FileText className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Monthly Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive monthly financial overview
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Quarterly Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed quarterly performance analysis
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Annual Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete annual financial statement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretaryReports;

