import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Eye, XCircle, MapPin, Users, Clock, Building2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const RegulatorApprovals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const pendingApprovals = [
    {
      id: 1,
      name: "Dukundane Farmers Cooperative",
      type: "New Registration",
      category: "Agriculture - Mixed Farming",
      location: "Musanze District, Northern Province",
      members: 203,
      submittedDate: "2024-11-05",
      priority: "High",
      priorityColor: "bg-red-100 text-red-700",
      description: "A cooperative of farmers specializing in mixed farming including vegetables, beans, and potatoes."
    },
    {
      id: 2,
      name: "Imena Women Cooperative",
      type: "Expansion Approval",
      category: "Crafts & Handicrafts",
      location: "Kigali City",
      members: 45,
      submittedDate: "2024-11-04",
      priority: "Medium",
      priorityColor: "bg-yellow-100 text-yellow-700",
      description: "Requesting approval to expand operations into Northern Province."
    },
    {
      id: 3,
      name: "Twubakane Tea Cooperative",
      type: "New Registration",
      category: "Agriculture - Tea",
      location: "Rubavu District, Western Province",
      members: 178,
      submittedDate: "2024-11-02",
      priority: "Medium",
      priorityColor: "bg-yellow-100 text-yellow-700",
      description: "Tea farmers cooperative focused on organic tea production for export."
    }
  ];

  const dashboardStats = [
    {
      label: "Pending Approvals",
      value: "5",
      color: "orange" as const,
      description: "Awaiting review",
      icon: Clock
    },
    {
      label: "Approved",
      value: "23",
      color: "green" as const,
      description: "This month",
      icon: CheckCircle
    },
    {
      label: "Rejected",
      value: "3",
      color: "red" as const,
      description: "This month",
      icon: XCircle
    },
    {
      label: "Avg Review Time",
      value: "7",
      color: "blue" as const,
      description: "Days",
      icon: Building2
    }
  ];

  return (
    <div className="p-6">
      <DashboardHeader
        title="Approvals Management"
        subtitle="Review and approve cooperative registrations"
        loading={loading}
        actions={
          <>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bulk Actions
            </Button>
            <Button className="flex items-center gap-2 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
              <Building2 className="h-4 w-4" />
              Quick Approve
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

      {/* Pending Approvals List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{approval.name}</h4>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${approval.priorityColor}`}>
                        {approval.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Type:</span> {approval.type} | <span className="font-medium">Category:</span> {approval.category}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {approval.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {approval.members} members
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{approval.description}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Submitted:</span> {approval.submittedDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Review Application
                  </Button>
                  <Button className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
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

export default RegulatorApprovals;

