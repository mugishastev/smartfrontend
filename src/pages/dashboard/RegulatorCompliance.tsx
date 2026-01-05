import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Eye, AlertCircle, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const RegulatorCompliance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const complianceIssues = [
    {
      id: 1,
      cooperative: "Imena Women Cooperative",
      issue: "Late Financial Report Submission",
      severity: "Medium",
      severityColor: "bg-yellow-100 text-yellow-700",
      description: "Q3 2024 financial report was submitted 15 days past the deadline.",
      reportedDate: "2024-10-30",
      status: "Under Review"
    },
    {
      id: 2,
      cooperative: "Dukundane Farmers Cooperative",
      issue: "Incomplete Member Records",
      severity: "High",
      severityColor: "bg-red-100 text-red-700",
      description: "Member registration documents are incomplete for 23 members.",
      reportedDate: "2024-10-25",
      status: "Action Required"
    },
    {
      id: 3,
      cooperative: "Terimbere Coffee Cooperative",
      issue: "Governance Meeting Minutes Missing",
      severity: "Low",
      severityColor: "bg-blue-100 text-blue-700",
      description: "General assembly meeting minutes for August 2024 not submitted.",
      reportedDate: "2024-10-18",
      status: "Resolved"
    }
  ];

  const dashboardStats = [
    {
      label: "Critical Issues",
      value: "2",
      color: "red" as const,
      description: "Require immediate action",
      icon: AlertCircle
    },
    {
      label: "Medium Priority",
      value: "5",
      color: "orange" as const,
      description: "Under review",
      icon: AlertTriangle
    },
    {
      label: "Resolved",
      value: "18",
      color: "green" as const,
      description: "This quarter",
      icon: CheckCircle
    },
    {
      label: "Pending",
      value: "7",
      color: "blue" as const,
      description: "Awaiting response",
      icon: Clock
    }
  ];

  return (
    <div className="p-6">
      <DashboardHeader
        title="Compliance Management"
        subtitle="Monitor compliance issues and violations"
        loading={loading}
        actions={
          <>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="icon-flip-hover flex items-center gap-2 bg-[#b7eb34] hover:bg-[#8ccc15] text-white transition-all duration-200">
              <AlertTriangle className="icon-flip-animate h-4 w-4" />
              Add Issue
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

      {/* Compliance Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceIssues.map((issue) => (
              <div key={issue.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h4 className="text-base font-bold text-gray-900">{issue.issue}</h4>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${issue.severityColor}`}>
                        {issue.severity} Severity
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Cooperative: {issue.cooperative}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        <span className="font-medium">Reported:</span> {issue.reportedDate}
                      </span>
                      <span>
                        <span className="font-medium">Status:</span> {issue.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
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

export default RegulatorCompliance;

