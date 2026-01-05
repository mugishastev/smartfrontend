import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listCooperatives, approveCooperative, suspendCooperative, getCooperativeDetails } from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  Building2, 
  Search, 
  CheckCircle, 
  Ban, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Users, 
  Package,
  DollarSign,
  FileText,
  Check,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CooperativePage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [cooperatives, setCooperatives] = useState<any[]>([]);
  const [selectedCooperative, setSelectedCooperative] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cooperativeDetails, setCooperativeDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load cooperatives
  useEffect(() => {
    loadCooperatives();
  }, [searchQuery, statusFilter]);

  const loadCooperatives = async () => {
    try {
      setLoading(true);
      const status = statusFilter === "all" ? undefined : statusFilter;
      const res = await listCooperatives(searchQuery, status);
      console.log('Cooperatives API Response:', res); // Debug log
      const cooperativesData = res?.data?.cooperatives ?? [];
      console.log('Parsed Cooperatives:', cooperativesData); // Debug log
      setCooperatives(Array.isArray(cooperativesData) ? cooperativesData : []);
    } catch (error: any) {
      console.error('Error loading cooperatives:', error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load cooperatives",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const res = await getCooperativeDetails(id);
      console.log('Cooperative Details API Response:', res); // Debug log
      // API returns { data: cooperative } directly
      const cooperativeData = res?.data ?? null;
      console.log('Parsed Cooperative Details:', cooperativeData); // Debug log
      setCooperativeDetails(cooperativeData);
      setSelectedCooperative(cooperatives.find(c => c.id === id));
      setViewModalOpen(true);
    } catch (error: any) {
      console.error('Error loading cooperative details:', error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load cooperative details",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApprove = async (cooperative: any) => {
    setSelectedCooperative(cooperative);
    setApprovalModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedCooperative) return;

    try {
      setApproving(true);
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

      toast({
        title: "Success",
        description: "Cooperative approved successfully",
      });

      setApprovalModalOpen(false);
      setSelectedCooperative(null);
      loadCooperatives();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve cooperative",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await suspendCooperative(id);
      toast({
        title: "Success",
        description: "Cooperative suspended successfully",
      });
      loadCooperatives();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to suspend cooperative",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      ACTIVE: { label: "Active", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      SUSPENDED: { label: "Suspended", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    };
    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700" };
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
        <div className="p-6">
      <DashboardHeader
        title="Cooperatives Management"
        subtitle="Manage all cooperatives on the platform - approve, suspend, and monitor"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search cooperatives by name, email, or RCA number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cooperatives</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {cooperatives.length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {cooperatives.filter(c => c.status === 'PENDING').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {cooperatives.filter(c => c.status === 'APPROVED' || c.status === 'ACTIVE').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {cooperatives.filter(c => c.status === 'SUSPENDED').length}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cooperatives Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cooperatives</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading cooperatives...</p>
            </div>
          ) : cooperatives.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium">No cooperatives found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="font-semibold">Cooperative</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">RCA Number</TableHead>
                  <TableHead className="font-semibold">Members</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cooperatives.map((coop) => (
                  <TableRow key={coop.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{coop.name}</p>
                          {coop.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                              {coop.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {coop.type}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{coop.district}, {coop.sector}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {coop.registrationNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coop._count?.users ?? coop.membersCount ?? 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(coop.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(coop.id)}
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4 sm:h-4 sm:w-4" />
                        </Button>
                        {coop.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(coop)}
                            className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                            aria-label="Approve"
                          >
                            <CheckCircle className="h-4 w-4 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {coop.status !== 'SUSPENDED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspend(coop.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Cooperative Details
            </DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading details...</p>
            </div>
          ) : cooperativeDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">{cooperativeDetails.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{cooperativeDetails.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{cooperativeDetails.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {cooperativeDetails.district}, {cooperativeDetails.sector}
                        </span>
                      </div>
                      {cooperativeDetails.foundedDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Founded: {new Date(cooperativeDetails.foundedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Registration Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">RCA Number:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-mono">
                          {cooperativeDetails.registrationNumber}
                    </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{cooperativeDetails.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <span className="ml-2">{getStatusBadge(cooperativeDetails.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {cooperativeDetails.description && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cooperativeDetails.description}</p>
                </div>
              )}

              {/* Statistics */}
              {cooperativeDetails._count && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {cooperativeDetails._count.users || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Members</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {cooperativeDetails._count.products || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Products</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {cooperativeDetails._count.transactions || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Transactions</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {cooperativeDetails._count.announcements || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Announcements</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Cooperative Registration</DialogTitle>
          </DialogHeader>
          {selectedCooperative && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">{selectedCooperative.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedCooperative.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedCooperative.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedCooperative.district}, {selectedCooperative.sector}
                    </span>
                  </div>
                  {selectedCooperative.foundedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Founded: {new Date(selectedCooperative.foundedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    RCA Number: {selectedCooperative.registrationNumber}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type: {selectedCooperative.type}</p>
                </div>
                {selectedCooperative.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCooperative.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Admin Account Details</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                  The following credentials will be created and sent to the cooperative admin:
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-900 dark:text-blue-300">Email:</span>{" "}
                    <span className="text-blue-700 dark:text-blue-400">{selectedCooperative.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900 dark:text-blue-300">Password:</span>{" "}
                    <span className="text-blue-700 dark:text-blue-400 font-mono">
                      Admin@{selectedCooperative.registrationNumber}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900 dark:text-blue-300">Name:</span>{" "}
                    <span className="text-blue-700 dark:text-blue-400">Admin {selectedCooperative.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmApprove}
                  disabled={approving}
                  className="flex-1 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                >
                  {approving ? 'Approving...' : 'Confirm Approval'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setApprovalModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
        </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CooperativePage;

