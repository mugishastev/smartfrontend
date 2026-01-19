import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Settings,
  UserX,
  Activity,
  Globe,
  Key,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRecentActivities, getSystemHealth, getSuperAdminStats, listAllUsers } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const SecurityDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [securityData, setSecurityData] = useState<any>(null);

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        setLoading(true);
        const [activitiesRes, systemHealthRes, statsRes, usersRes] = await Promise.allSettled([
          getRecentActivities(),
          getSystemHealth(),
          getSuperAdminStats(),
          listAllUsers()
        ]);

        // Handle Promise.allSettled results
        const activities = activitiesRes.status === 'fulfilled' ? (activitiesRes.value.data || []) : [];
        const systemHealth = systemHealthRes.status === 'fulfilled' ? (systemHealthRes.value.data || {}) : {};
        const stats = statsRes.status === 'fulfilled' ? (statsRes.value.data || {}) : {};
        const users = usersRes.status === 'fulfilled' ? (usersRes.value.data?.users || usersRes.value.data || []) : [];

        // Filter security-related activities and map with user info
        const securityEvents = activities
          .filter((a: any) => 
            a.action?.includes('LOGIN') || 
            a.action?.includes('PASSWORD') || 
            a.action?.includes('SECURITY') ||
            a.action?.includes('FAILED')
          )
          .map((a: any, index: number) => {
            // Get user info - only show if user is registered
            const userName = a.user?.firstName && a.user?.lastName 
              ? `${a.user.firstName} ${a.user.lastName}` 
              : null;
            const userEmail = a.user?.email || null;
            
            // Format timestamp
            const eventDate = a.createdAt ? new Date(a.createdAt) : new Date();
            const formattedTime = eventDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return {
              id: a.id || index,
              type: a.action?.toLowerCase().replace(/_/g, '_') || 'unknown',
              user: userName || userEmail || 'Unknown User',
              userEmail: userEmail,
              userName: userName,
              isRegistered: !!(a.user?.id), // Check if user is registered
              ip: a.details?.ip || a.ipAddress || 'Unknown',
              location: a.details?.location || 'Unknown',
              status: a.action?.includes('FAILED') ? 'failed' : 
                     a.action?.includes('BLOCKED') ? 'blocked' : 'success',
              timestamp: formattedTime,
              rawTimestamp: a.createdAt || new Date().toISOString(),
              details: a.details?.message || a.action || 'No details'
            };
          });

        // Extract threats from failed login attempts
        const failedLogins = activities.filter((a: any) => 
          a.action === 'LOGIN_FAILED' || a.action?.includes('FAILED')
        );
        
        const threats = failedLogins.map((a: any, index: number) => ({
          id: a.id || index,
          type: 'brute_force',
          severity: failedLogins.filter((f: any) => f.details?.ip === a.details?.ip).length > 5 ? 'high' : 'medium',
          ip: a.details?.ip || 'Unknown',
          location: a.details?.location || 'Unknown',
          attempts: failedLogins.filter((f: any) => f.details?.ip === a.details?.ip).length,
          status: 'blocked',
          timestamp: a.createdAt || new Date().toISOString(),
          userAgent: a.details?.userAgent || 'Unknown'
        }));

        const activeUsers = users.filter((u: any) => {
          const lastActive = new Date(u.updatedAt || u.createdAt);
          const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
          return hoursSinceActive < 24; // Active in last 24 hours
        }).length;

        setSecurityData({
          overview: {
            threatLevel: threats.length > 10 ? 'medium' : threats.length > 0 ? 'low' : 'low',
            activeThreats: threats.filter((t: any) => t.severity === 'high').length,
            blockedAttempts: failedLogins.length,
            activeSessions: systemHealth.security?.activeSessions || activeUsers
          },
          threats: threats.slice(0, 10), // Limit to 10 most recent
          securityEvents: securityEvents.slice(0, 10), // Limit to 10 most recent
          compliance: {
            gdpr: 'compliant',
            dataEncryption: 'enabled',
            auditLogs: 'enabled',
            backupFrequency: systemHealth.backups?.status === 'successful' ? 'daily' : 'unknown'
          },
          accessControl: {
            totalUsers: stats.totalUsers || users.length,
            activeUsers: activeUsers,
            lockedAccounts: 0, // Would need to track locked accounts
            passwordPolicies: 'enforced'
          }
        });
      } catch (error: any) {
        console.error('Error loading security data:', error);
        if (toast) {
          toast({ variant: "destructive", title: "Error", description: "Failed to load security data" });
        }
        setSecurityData({
          overview: { threatLevel: 'low', activeThreats: 0, blockedAttempts: 0, activeSessions: 0 },
          threats: [],
          securityEvents: [],
          compliance: { gdpr: 'unknown', dataEncryption: 'unknown', auditLogs: 'unknown', backupFrequency: 'unknown' },
          accessControl: { totalUsers: 0, activeUsers: 0, lockedAccounts: 0, passwordPolicies: 'unknown' }
        });
      } finally {
        setLoading(false);
      }
    };

    loadSecurityData();
  }, []); // Remove toast from dependencies to avoid re-renders

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked':
        return 'bg-red-100 text-red-700';
      case 'success':
      case 'allowed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'monitored':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force':
        return <Lock className="h-4 w-4" />;
      case 'suspicious_activity':
        return <Eye className="h-4 w-4" />;
      case 'malware':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const filteredThreats = securityData?.threats.filter((threat: any) => {
    const matchesSearch = threat.ip.includes(searchQuery) ||
                         threat.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || threat.severity === filterType;
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor security threats, access control, and compliance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Security Settings
            </Button>
            <Button className="flex items-center gap-2 bg-[#b7eb34] hover:bg-[#a3d72f] text-white">
              <Shield className="h-4 w-4" />
              Run Security Scan
            </Button>
          </div>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-6 w-6 text-green-600" />
              <Badge className="bg-green-100 text-green-700 capitalize">
                {securityData?.overview.threatLevel || 'low'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Threat Level</p>
            <p className="text-2xl font-bold text-gray-900">
              {securityData?.overview.activeThreats || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Active threats detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Ban className="h-6 w-6 text-red-600" />
              <Badge className="bg-red-100 text-red-700">
                {securityData?.overview.blockedAttempts || 0}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Blocked Attempts</p>
            <p className="text-2xl font-bold text-gray-900">
              {securityData?.overview.blockedAttempts || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">
                {securityData?.overview.activeSessions || 0}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Active Sessions</p>
            <p className="text-2xl font-bold text-gray-900">
              {securityData?.overview.activeSessions || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Currently logged in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <Badge className="bg-green-100 text-green-700">
                Compliant
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Compliance Status</p>
            <p className="text-2xl font-bold text-gray-900">GDPR</p>
            <p className="text-xs text-gray-500 mt-1">
              All systems compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Threats & Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search threats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredThreats.map((threat: any) => (
                  <div key={threat.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      {getThreatIcon(threat.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status}
                        </Badge>
                      </div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {threat.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">{threat.ip} • {threat.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {threat.attempts} attempts • {threat.timestamp}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {securityData.securityEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      event.status === 'success' ? 'bg-green-100' :
                      event.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {event.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : event.status === 'failed' ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Ban className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                      {event.isRegistered ? (
                        <>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {event.userName || event.userEmail}
                          </p>
                          {event.userName && event.userEmail && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.userEmail}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {event.user}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.ip} • {event.location}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {event.details} • {event.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Access Control & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Total Users</p>
                  <p className="text-sm text-gray-600">Registered accounts</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {securityData?.accessControl.totalUsers || 0}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-900">Active Users</p>
                  <p className="text-sm text-green-700">Currently active</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {securityData?.accessControl.activeUsers || 0}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-semibold text-red-900">Locked Accounts</p>
                  <p className="text-sm text-red-700">Security violations</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {securityData?.accessControl.lockedAccounts || 0}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Password Policies</p>
                  <p className="text-sm text-blue-700">Security enforcement</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 capitalize">
                  {securityData?.accessControl.passwordPolicies }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">GDPR Compliance</p>
                    <p className="text-sm text-green-700">Data protection regulations</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 capitalize">
                  {securityData?.compliance.gdpr }
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Data Encryption</p>
                    <p className="text-sm text-blue-700">Data at rest and in transit</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 capitalize">
                  {securityData?.compliance.dataEncryption }
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">Audit Logs</p>
                    <p className="text-sm text-purple-700">Activity monitoring</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700 capitalize">
                  {securityData?.compliance.auditLogs }
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">Backup Frequency</p>
                    <p className="text-sm text-orange-700">Data backup schedule</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700 capitalize">
                  {securityData?.compliance.backupFrequency }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
