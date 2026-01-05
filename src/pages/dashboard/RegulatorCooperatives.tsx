import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Search, Eye, MapPin, Users, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const RegulatorCooperatives = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const cooperatives = [
    {
      id: 1,
      name: "Terimbere Coffee Cooperative",
      type: "Agriculture - Coffee",
      location: "Huye District, Southern Province",
      members: 156,
      rcaNumber: "RCA/2020/0145",
      status: "Active",
      statusColor: "bg-green-100 text-green-700",
      registrationDate: "2020-03-15"
    },
    {
      id: 2,
      name: "Umoja Dairy Cooperative",
      type: "Agriculture - Dairy",
      location: "Nyagatare District, Eastern Province",
      members: 89,
      rcaNumber: "RCA/2019/0098",
      status: "Active",
      statusColor: "bg-green-100 text-green-700",
      registrationDate: "2019-08-22"
    },
    {
      id: 3,
      name: "Dukundane Farmers Cooperative",
      type: "Agriculture - Mixed Farming",
      location: "Musanze District, Northern Province",
      members: 203,
      rcaNumber: "RCA/2021/0187",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-700",
      registrationDate: "2024-11-05"
    },
    {
      id: 4,
      name: "Imena Women Cooperative",
      type: "Crafts & Handicrafts",
      location: "Kigali City",
      members: 45,
      rcaNumber: "RCA/2018/0067",
      status: "Active",
      statusColor: "bg-green-100 text-green-700",
      registrationDate: "2018-05-10"
    }
  ];

  const dashboardStats = [
    {
      label: "Total Registered",
      value: "8",
      color: "blue" as const,
      description: "Cooperatives",
      icon: Building2
    },
    {
      label: "Active",
      value: "5",
      color: "green" as const,
      description: "Operating normally",
      icon: CheckCircle
    },
    {
      label: "Pending",
      value: "3",
      color: "orange" as const,
      description: "Under review",
      icon: AlertTriangle
    },
    {
      label: "Total Members",
      value: "493",
      color: "purple" as const,
      description: "Across all coops",
      icon: Users
    }
  ];

  return (
    <div className="p-6">
      <DashboardHeader
        title="Cooperatives Management"
        subtitle="Monitor and manage all registered cooperatives"
        loading={loading}
        actions={
          <>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export List
            </Button>
            <Button className="icon-flip-hover flex items-center gap-2 bg-[#b7eb34] hover:bg-[#8ccc15] text-white transition-all duration-200">
              <Building2 className="icon-flip-animate h-4 w-4" />
              Add Cooperative
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

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search cooperatives by name, location, or RCA number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cooperatives List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Cooperatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cooperatives.map((coop) => (
              <div key={coop.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{coop.name}</h4>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${coop.statusColor}`}>
                        {coop.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Type:</span> {coop.type}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {coop.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {coop.members} members
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">RCA Number:</span> {coop.rcaNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Registered:</span> {coop.registrationDate}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    View Reports
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

export default RegulatorCooperatives;

