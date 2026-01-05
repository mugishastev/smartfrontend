import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSuperAdminStats, listCooperatives, approveCooperative, suspendCooperative, getRecentActivities, getSystemHealth, getContacts, respondToContact } from "@/lib/api";
import type { DashboardStats, ContactMessage, ContactPagination } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Clock, Building2, Users, DollarSign, ShoppingCart, CheckCircle, Check, Search, Ban, Mail, Phone, MapPin, Calendar, Activity, TrendingUp, AlertCircle, Server, Database, Shield, ArrowUpRight, ArrowDownRight, Eye, FileText, Zap, HardDrive, Network, CheckCircle2, XCircle, AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";

type ContactStatusFilter = 'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cooperatives, setCooperatives] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCooperative, setSelectedCooperative] = useState<any>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactPagination, setContactPagination] = useState<ContactPagination | null>(null);
  const [contactStatusFilter, setContactStatusFilter] = useState<ContactStatusFilter>('PENDING');
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  // Removed register modal state - SUPER_ADMIN should not create cooperatives directly
  const navigate = useNavigate();
  const contactStatusOptions: { label: string; value: ContactStatusFilter }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Responded', value: 'RESPONDED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'All', value: 'ALL' },
  ];

  const loadContacts = useCallback(async (status?: string) => {
    setContactsLoading(true);
    try {
      const res = await getContacts({
        status,
        limit: 6,
      });
      setContacts(res?.data?.contacts ?? []);
      setContactPagination(res?.data?.pagination ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load contacts');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const handleContactStatusChange = (value: ContactStatusFilter) => {
    setContactStatusFilter(value);
  };

  const handleSendResponse = async () => {
    if (!selectedContact || !responseText.trim()) return;
    setResponding(true);
    try {
      await respondToContact(selectedContact.id, responseText.trim());
      await loadContacts(contactStatusFilter === 'ALL' ? undefined : contactStatusFilter);
      setSelectedContact(null);
      setResponseText('');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, coopsRes, activitiesRes, healthRes] = await Promise.all([
          getSuperAdminStats(),
          listCooperatives(),
          getRecentActivities(),
          getSystemHealth()
        ]);
        setStats(statsRes?.data ?? null);
        setCooperatives((coopsRes?.data?.cooperatives as any[]) ?? []);
        setRecentActivities((activitiesRes?.data as any[]) ?? []);
        setSystemHealth(healthRes?.data ?? null);
        console.log('Fetched cooperatives:', coopsRes?.data?.cooperatives);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Handle cooperative search
  useEffect(() => {
    const searchCoops = async () => {
      if (!searchQuery) {
        const res = await listCooperatives();
        setCooperatives((res?.data?.cooperatives as any[]) ?? []);
        return;
      }
      const res = await listCooperatives(searchQuery);
      setCooperatives((res?.data?.cooperatives as any[]) ?? []);
    };

    const timeout = setTimeout(searchCoops, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const status = contactStatusFilter === 'ALL' ? undefined : contactStatusFilter;
    loadContacts(status);
  }, [contactStatusFilter, loadContacts]);

  const handleAction = async (id: string, action: 'approve' | 'suspend') => {
    try {
      if (action === 'approve') {
        // Open approval modal instead of direct approval
        const cooperative = cooperatives.find(c => c.id === id);
        setSelectedCooperative(cooperative);
        setApprovalModalOpen(true);
        return;
      } else if (action === 'suspend') {
        await suspendCooperative(id);
      }

      // Refresh cooperatives list
      const res = await listCooperatives(searchQuery);
      setCooperatives(res?.data?.cooperatives ?? []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproveCooperative = async () => {
    if (!selectedCooperative) return;

    try {
      setApproving(true);
      // Use the cooperative's email for admin credentials
      const adminEmail = selectedCooperative.email;
      const adminFirstName = 'Admin';
      const adminLastName = selectedCooperative.name;
      const adminPassword = `Admin@${selectedCooperative.registrationNumber}`;

      await approveCooperative(selectedCooperative.id, {
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPassword
      });

      // Refresh data
      const [statsRes, coopsRes] = await Promise.all([
        getSuperAdminStats(),
        listCooperatives(searchQuery)
      ]);
      setStats(statsRes?.data ?? null);
      setCooperatives(coopsRes?.data?.cooperatives ?? []);

      // Close modal
      setApprovalModalOpen(false);
      setSelectedCooperative(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApproving(false);
    }
  };

  // Removed register cooperative functions - SUPER_ADMIN should not create cooperatives directly

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-yellow-600 mb-4">⚠️</div>
        <p className="text-gray-900 font-semibold mb-2">Error loading dashboard</p>
        <p className="text-gray-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    </div>;
  }

  const statCards = stats ? [
    {
      label: "Total Cooperatives",
      value: (stats.totalCooperatives ?? 0).toString(),
      description: `${stats.cooperativesByStatus?.APPROVED ?? 0} active, ${stats.cooperativesByStatus?.PENDING ?? 0} pending`,
      icon: Building2,
      color: "blue" as const
    },
    stats && {
      label: "Total Users",
      value: (stats.totalUsers ?? 0).toString(),
      description: "Across all cooperatives",
      icon: Users,
      color: "green" as const
    },
    stats && {
      label: "Transaction Volume",
      value: `${((stats.totalTransactionVolume ?? 0) / 1_000_000).toFixed(1)}M RWF`,
      description: `${stats.totalTransactions ?? 0} total transactions`,
      icon: DollarSign,
      color: "purple" as const
    },
    stats && {
      label: "Marketplace Orders",
      value: (stats.totalOrders ?? 0).toString(),
      description: "Total orders processed",
      icon: ShoppingCart,
      color: "orange" as const
    }
  ] : [];

  // Filter pending cooperatives for approvals section
  const pendingCooperatives = (cooperatives ?? []).filter((coop: any) => coop.status === 'PENDING');

  return (
    <div className="p-6">
      {/* Header */}
      <DashboardHeader
        title="Welcome Back, Super Admin  "
        subtitle="Monitor and manage the entire Smart Cooperative Hub platform"
        actions={
          <>
            <Button className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50">
              <span className="bg-[#b7eb34] text-white rounded-full px-2 py-0.5 text-xs font-bold mr-2">{pendingCooperatives.length}</span>
              Pending Approvals
            </Button>
          </>
        }
      />

      {/* System & Transactions Overview */}
      <div className="mb-8 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        {systemHealth && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-600" />
                    System Health & Technical Monitoring
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor platform performance and technical status</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  getSystemHealth().then(res => setSystemHealth(res?.data ?? null));
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between mb-2">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {systemHealth.server?.status === 'healthy' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Server Status</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {systemHealth.server?.uptime || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {systemHealth.server?.status === 'healthy' ? 'Operational' : 'Issues detected'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                    {systemHealth.database?.status === 'connected' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {systemHealth.database?.connections || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active connections</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    {systemHealth.security?.failedLogins === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {systemHealth.security?.failedLogins || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Failed logins (24h)</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Sessions</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {systemHealth.security?.activeSessions || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 minutes</p>
                </div>
              </div>
              {systemHealth.alerts && systemHealth.alerts.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300">System Alerts</h4>
                  </div>
                  <div className="space-y-2">
                    {systemHealth.alerts.slice(0, 3).map((alert: any, index: number) => (
                      <div key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">{alert.action || 'System Alert'}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Platform-Level Transactions Overview
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor all transactions across the platform</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Volume</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {((stats.totalTransactionVolume ?? 0) / 1_000_000).toFixed(1)}M RWF
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All-time transactions</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {(stats.totalTransactions ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All transactions processed</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketplace Orders</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {(stats.totalOrders ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total orders processed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pending Approvals Section */}
      {pendingCooperatives.length > 0 && (
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pending Approvals</h2>
            <p className="text-gray-600">Review and approve cooperative registration requests</p>
          </div>

          {/* Summary Cards for Approvals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCooperatives.length}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-green-600 mb-2">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats?.cooperativesByStatus?.APPROVED || 0}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Total Cooperatives</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalCooperatives || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Total Members</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Across all</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals List */}
          <div className="space-y-4 mb-8">
            {pendingCooperatives.map((approval: any) => (
              <Card key={approval.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{approval.name}</h3>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {approval.status?.toLowerCase() || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Type: {approval.type}</p>
                      <p className="text-sm text-gray-600 mb-1">📍 {approval.district}, {approval.sector}</p>
                      {(approval._count?.users || approval.membersCount) && (
                        <p className="text-sm text-gray-600 mb-1">👥 {approval._count?.users ?? approval.membersCount ?? 0} members</p>
                      )}
                      {approval.createdAt && (
                        <p className="text-xs text-gray-500">Submitted: {new Date(approval.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => handleAction(approval.id, 'approve')} className="w-full sm:flex-1 min-h-[44px] bg-[#b7eb34] hover:bg-[#a3d72f] text-white text-sm sm:text-base">
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Approve Cooperative Registration</DialogTitle>
                          <DialogDescription>
                            Confirm approval to create the cooperative admin account and notify the cooperative by email.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedCooperative && (
                          <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-lg mb-4">{selectedCooperative.name}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span>{selectedCooperative.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span>{selectedCooperative.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span>{selectedCooperative.district}, {selectedCooperative.sector}</span>
                                </div>
                                {selectedCooperative.foundedDate && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span>Founded: {new Date(selectedCooperative.foundedDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4">
                                <p className="text-sm text-gray-600">RCA Number: {selectedCooperative.registrationNumber}</p>
                                <p className="text-sm text-gray-600">Type: {selectedCooperative.type}</p>
                              </div>
                              {selectedCooperative.description && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-gray-700">Description:</p>
                                  <p className="text-sm text-gray-600">{selectedCooperative.description}</p>
                                </div>
                              )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-2">Admin Account Details</h4>
                              <p className="text-sm text-blue-700 mb-3">The following credentials will be created and sent to the cooperative admin:</p>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Email:</span> {selectedCooperative.email}
                                </div>
                                <div>
                                  <span className="font-medium">Password:</span> Admin@{selectedCooperative.registrationNumber}
                                </div>
                                <div>
                                  <span className="font-medium">Name:</span> Admin {selectedCooperative.name}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <Button
                                onClick={handleApproveCooperative}
                                disabled={approving}
                                className="w-full sm:flex-1 min-h-[44px] bg-[#b7eb34] hover:bg-[#a3d72f] text-white text-sm sm:text-base"
                              >
                                {approving ? 'Approving...' : 'Confirm Approval'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setApprovalModalOpen(false)}
                                className="w-full sm:flex-1 min-h-[44px] text-sm sm:text-base"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    {/* Removed reject button - SUPER_ADMIN should only approve pending applications */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <DashboardStatGrid loading={loading}>
        {!loading && statCards.map((stat, index) => (
          <DashboardStatCard
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </DashboardStatGrid>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Recent Contacts & Responses
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Respond to buyers or cooperatives reaching out through the contact form.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Total: {contactPagination?.total ?? 0}
              </Badge>
              <Tabs value={contactStatusFilter} onValueChange={(value) => handleContactStatusChange(value as ContactStatusFilter)}>
                <TabsList className="bg-transparent p-0">
                  {contactStatusOptions.map((option) => (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      className="px-3 py-1 text-xs font-semibold rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className="text-center py-10 text-gray-500">Loading contact inquiries...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No inquiries for this filter.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Received</TableHead>
                  <TableHead className="font-semibold">Message</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        <span className="text-xs text-gray-500">{contact.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {contact.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {contact.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <p>
                        {contact.message.length > 90 ? `${contact.message.slice(0, 90)}...` : contact.message}
                      </p>
                      {contact.response && (
                        <p className="text-xs text-green-600 mt-1">Replied: {new Date(contact.respondedAt ?? '').toLocaleString()}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => {
                          setSelectedContact(contact);
                          setResponseText(contact.response ?? '');
                        }}
                      >
                        Respond
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedContact)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContact(null);
            setResponseText("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to {selectedContact?.name ?? 'Contact'}</DialogTitle>
            <DialogDescription>
              Send a direct response to the email address provided and mark the inquiry as resolved.
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-700">Subject</h4>
                <p className="text-sm text-gray-800">{selectedContact.subject}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-gray-700">Message</h4>
                <p className="text-sm text-gray-800">{selectedContact.message}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your Response</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={5}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="text-xs text-gray-500">
                  Response will be emailed to {selectedContact.email}.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSendResponse}
                    disabled={responding || !responseText.trim()}
                  >
                    {responding ? "Sending..." : "Send Response"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedContact(null);
                      setResponseText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Platform Transactions Overview */}
      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Platform-Level Transactions Overview
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor all transactions across the platform</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Volume</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {((stats.totalTransactionVolume ?? 0) / 1_000_000).toFixed(1)}M RWF
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All-time transactions</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {(stats.totalTransactions ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All transactions processed</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketplace Orders</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {(stats.totalOrders ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total orders processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log / Audit Trail */}
      {recentActivities.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Activity Log & Audit Trail
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track all Super Admin actions and system events for accountability</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/security')}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivities.slice(0, 10).map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.action?.includes('APPROVED') ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.action?.includes('SUSPENDED') || activity.action?.includes('FAILED') ? 'bg-red-100 dark:bg-red-900/30' :
                    activity.action?.includes('CREATED') ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {activity.action?.includes('APPROVED') ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : activity.action?.includes('SUSPENDED') || activity.action?.includes('FAILED') ? (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.action?.replace(/_/g, ' ') || 'System Event'}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      {activity.user && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {activity.user.firstName && activity.user.lastName 
                            ? `${activity.user.firstName} ${activity.user.lastName}`
                            : activity.user.email || 'Unknown User'}
                        </span>
                      )}
                      {activity.cooperative && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {activity.cooperative.name}
                        </span>
                      )}
                      {activity.entity && (
                        <Badge variant="outline" className="text-xs">
                          {activity.entity}
                        </Badge>
                      )}
                    </div>
                    {activity.details && typeof activity.details === 'object' && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {JSON.stringify(activity.details).slice(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {recentActivities.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate('/security')}>
                  View All {recentActivities.length} Activities
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

        {/* Cooperative Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cooperative Management</CardTitle>
            <p className="text-sm text-gray-600">View, approve, suspend, or delete cooperatives</p>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search cooperatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Cooperatives Table */}
            {cooperatives.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium">No cooperatives found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Cooperative Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">RCA Number</TableHead>
                    <TableHead className="font-semibold">Members</TableHead>
                    <TableHead className="font-semibold">Founded</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(cooperatives ?? []).map((coop) => (
                    <TableRow key={coop.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{coop.name}</p>
                            {coop.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{coop.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {coop.type}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{coop.district}, {coop.sector}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {coop.registrationNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {coop._count?.users ?? coop.membersCount ?? 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {coop.foundedDate ? new Date(coop.foundedDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          coop.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          coop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                          'bg-orange-100 text-green-700 hover:bg-orange-100'
                        }`}>
                          {coop.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {coop.status === 'PENDING' && (
                            <Dialog open={approvalModalOpen && selectedCooperative?.id === coop.id} onOpenChange={(open) => {
                              if (!open) {
                                setApprovalModalOpen(false);
                                setSelectedCooperative(null);
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  onClick={() => handleAction(coop.id, 'approve')}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Approve Cooperative Registration</DialogTitle>
                                </DialogHeader>
                                {selectedCooperative && (
                                  <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h3 className="font-semibold text-lg mb-4">{selectedCooperative.name}</h3>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-gray-500" />
                                          <span>{selectedCooperative.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-gray-500" />
                                          <span>{selectedCooperative.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-gray-500" />
                                          <span>{selectedCooperative.district}, {selectedCooperative.sector}</span>
                                        </div>
                                        {selectedCooperative.foundedDate && (
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>Founded: {new Date(selectedCooperative.foundedDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="mt-4">
                                        <p className="text-sm text-gray-600">RCA Number: {selectedCooperative.registrationNumber}</p>
                                        <p className="text-sm text-gray-600">Type: {selectedCooperative.type}</p>
                                      </div>
                                      {selectedCooperative.description && (
                                        <div className="mt-4">
                                          <p className="text-sm font-medium text-gray-700">Description:</p>
                                          <p className="text-sm text-gray-600">{selectedCooperative.description}</p>
                                        </div>
                                      )}
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h4 className="font-semibold text-blue-900 mb-2">Admin Account Details</h4>
                                      <p className="text-sm text-blue-700 mb-3">The following credentials will be created and sent to the cooperative admin:</p>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="font-medium">Email:</span> {selectedCooperative.email}
                                        </div>
                                        <div>
                                          <span className="font-medium">Password:</span> Admin@{selectedCooperative.registrationNumber}
                                        </div>
                                        <div>
                                          <span className="font-medium">Name:</span> Admin {selectedCooperative.name}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                      <Button
                                        onClick={handleApproveCooperative}
                                        disabled={approving}
                                        className="w-full sm:flex-1 min-h-[44px] bg-[#b7eb34] hover:bg-[#a3d72f] text-white text-sm sm:text-base"
                                      >
                                        {approving ? 'Approving...' : 'Confirm Approval'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setApprovalModalOpen(false);
                                          setSelectedCooperative(null);
                                        }}
                                        className="w-full sm:flex-1 min-h-[44px] text-sm sm:text-base"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button 
                            onClick={() => handleAction(coop.id, 'suspend')}
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            aria-label="Suspend cooperative"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
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

export default Dashboard;

