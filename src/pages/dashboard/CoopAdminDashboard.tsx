import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  DollarSign,
  Bell,
  Eye,
  Edit,
  Megaphone,
  BarChart3,
} from "lucide-react";
import { getCoopDashboard, getProfile, listMembers, listProducts } from "@/lib/api";
import type { User, CoopDashboardStats } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { useToast } from "@/components/ui/use-toast";

const CoopAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CoopDashboardStats | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileRes = await getProfile();
        const userData = profileRes.data;
        setProfile(userData);

        if (!userData?.cooperativeId) {
          setStats(null);
          toast({
            variant: "destructive",
            title: "No Cooperative",
            description: "You are not associated with a cooperative yet.",
          });
          return;
        }

        const cooperativeId = userData.cooperativeId;

        const statsRes = await getCoopDashboard(cooperativeId);
        const dashboardData = statsRes.data;
        setStats(dashboardData?.stats ?? (dashboardData as any));

        const [membersRes, productsRes] = await Promise.allSettled([
          listMembers(cooperativeId),
          listProducts(cooperativeId, { limit: 5 }),
        ]);

        if (membersRes.status === "fulfilled") {
          const membersData = membersRes.value.data?.members || membersRes.value.data || [];
          setRecentMembers(Array.isArray(membersData) ? membersData.slice(0, 5) : []);
        }

        if (productsRes.status === "fulfilled") {
          const productsData = productsRes.value.data?.products || productsRes.value.data || [];
          setRecentProducts(Array.isArray(productsData) ? productsData.slice(0, 5) : []);
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to load dashboard data";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [toast]);

  const dashboardStats = [
    { label: "Total Members", value: stats?.totalMembers ?? '-', icon: Users, color: "blue" as const, description: "Members" },
    { label: "Active Products", value: stats?.totalProducts ?? '-', icon: Package, color: "green" as const, description: "Products" },
    { label: "Total Income", value: stats ? formatCurrency(stats.totalIncome) : '-', icon: DollarSign, color: "purple" as const, description: stats ? `Net: ${formatCurrency(stats.netBalance)}` : "No data" },
    { label: "Pending Requests", value: stats?.pendingRequests ?? '-', icon: Bell, color: "orange" as const, description: "Awaiting action" },
  ];

  return (
    <div className="p-6">
      {/* Header (no top quick-action buttons — sidebar handles navigation) */}
      <DashboardHeader
        title={loading ? undefined : (profile?.cooperative?.name ?? 'Cooperative Admin Dashboard')}
        subtitle={loading ? undefined : `Welcome back, ${profile?.firstName}! Manage your cooperative operations and members`}
        loading={loading}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Member Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your cooperative members</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/coop-members')} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentMembers.length > 0 ? (
                <div className="space-y-3">
                  {recentMembers.map((member: any) => (
                    <div key={member.id} className="group relative flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200 hover:shadow-sm hover:border-l-2 hover:border-l-[#b7eb34] cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center transition-colors duration-200">
                          <Users className="h-5 w-5 text-violet-600 dark:text-violet-400 transition-colors duration-200 group-hover:text-[#b7eb34]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground transition-colors duration-200 group-hover:text-[#b7eb34]">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/member/${member.id}`)} className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#b7eb34]/10 hover:text-[#b7eb34]">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No members yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Product Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your cooperative products</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/coop-products')} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((product: any) => (
                    <div key={product.id} className="group relative flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200 hover:shadow-sm hover:border-l-2 hover:border-l-[#b7eb34] cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center transition-colors duration-200">
                          <Package className="h-5 w-5 text-amber-600 dark:text-amber-400 transition-colors duration-200 group-hover:text-[#b7eb34]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground transition-colors duration-200 group-hover:text-[#b7eb34]">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(product.price)} • {product.availableStock} {product.unit}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/product/${product.id}`)} className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#b7eb34]/10 hover:text-[#b7eb34]">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => navigate('/coop-announcements')} variant="outline" className="group w-full justify-start h-auto py-3 transition-all duration-200 hover:border-[#b7eb34] hover:text-[#b7eb34] hover:bg-[#b7eb34]/5">
                <Megaphone className="h-4 w-4 mr-2" />
                <span>Announcements</span>
              </Button>
              <Button onClick={() => navigate('/coop-finances')} variant="outline" className="group w-full justify-start h-auto py-3 transition-all duration-200 hover:border-[#b7eb34] hover:text-[#b7eb34] hover:bg-[#b7eb34]/5">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>Finances</span>
              </Button>
              <Button onClick={() => navigate('/coop-members')} variant="outline" className="group w-full justify-start h-auto py-3 transition-all duration-200 hover:border-[#b7eb34] hover:text-[#b7eb34] hover:bg-[#b7eb34]/5">
                <Users className="h-4 w-4 mr-2" />
                <span>All Members</span>
              </Button>
              <Button onClick={() => navigate('/coop-products')} variant="outline" className="group w-full justify-start h-auto py-3 transition-all duration-200 hover:border-[#b7eb34] hover:text-[#b7eb34] hover:bg-[#b7eb34]/5">
                <Package className="h-4 w-4 mr-2" />
                <span>All Products</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoopAdminDashboard;
