import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Eye, Calendar, AlertTriangle, CheckCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const RegulatorReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: 1,
      title: "Terimbere Coffee Cooperative - Q4 2024",
      type: "Quarterly Financial Report",
      cooperative: "Terimbere Coffee Cooperative",
      submittedDate: "2024-11-01",
      status: "Reviewed",
      statusColor: "bg-green-100 text-green-700"
    },
    {
      id: 2,
      title: "Umoja Dairy Cooperative - Annual Report 2024",
      type: "Annual Performance Report",
      cooperative: "Umoja Dairy Cooperative",
      submittedDate: "2024-10-28",
      status: "Pending Review",
      statusColor: "bg-yellow-100 text-yellow-700"
    },
    {
      id: 3,
      title: "Dukundane Farmers - Compliance Report",
      type: "Compliance Report",
      cooperative: "Dukundane Farmers Cooperative",
      submittedDate: "2024-10-25",
      status: "Under Review",
      statusColor: "bg-blue-100 text-blue-700"
    },
    {
      id: 4,
      title: "Imena Women Cooperative - Monthly Report",
      type: "Monthly Activity Report",
      cooperative: "Imena Women Cooperative",
      submittedDate: "2024-10-20",
      status: "Reviewed",
      statusColor: "bg-green-100 text-green-700"
    }
  ];

  const dashboardStats = [
    {
      label: "Total Reports",
      value: "23",
      color: "blue" as const,
      description: "This month",
      icon: FileText
    },
    {
      label: "Pending Review",
      value: "4",
      color: "orange" as const,
      description: "Awaiting action",
      icon: AlertTriangle
    },
    {
      label: "Reviewed",
      value: "17",
      color: "green" as const,
      description: "Completed",
      icon: CheckCircle
    },
    {
      label: "Issues Found",
      value: "2",
      color: "red" as const,
      description: "Need attention",
      icon: AlertTriangle
    }
  ];

  return (
    <div className="p-6">
      <DashboardHeader
        title="Reports Management"
        subtitle="Review and analyze cooperative reports"
        loading={loading}
        actions={
          <>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filter by Date
            </Button>
            <Button className="flex items-center gap-2 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </>
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

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-bold text-gray-900">{report.title}</h4>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${report.statusColor}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Type:</span> {report.type}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Cooperative:</span> {report.cooperative}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Submitted:</span> {report.submittedDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatorReports;

