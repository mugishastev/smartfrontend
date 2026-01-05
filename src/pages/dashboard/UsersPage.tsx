import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Search,
  Eye,
  Ban,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  Users as UsersIcon,
  Mail,
  Phone,
  Building2,
  Shield,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { listAllUsers, updateUserStatus } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await listAllUsers(searchQuery, roleFilter, currentPage, ITEMS_PER_PAGE);
        const usersList = (response as any)?.data?.users || (response as any)?.users || (response as any)?.data || [];
        const total = (response as any)?.data?.pagination?.total || (response as any)?.data?.total || (response as any)?.pagination?.total || (response as any)?.total || usersList.length;
        
        setUsers(usersList);
        setTotalUsers(total);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users: " + error.message
        });
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [currentPage, searchQuery, roleFilter, toast]);

  // Pagination
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const paginatedUsers = users;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + paginatedUsers.length;

  const handleAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      setIsProcessing(true);
      await updateUserStatus(userId, action);
      
      toast({
        title: "Success",
        description: `User ${action === 'activate' ? 'activated' : action === 'deactivate' ? 'deactivated' : 'deleted'} successfully`,
        className: "bg-green-50 text-green-900 border-green-200"
      });

      // Refresh users list
      const response = await listAllUsers(searchQuery, roleFilter, currentPage, ITEMS_PER_PAGE);
      const usersList = (response as any)?.data?.users || (response as any)?.users || (response as any)?.data || [];
      const total = (response as any)?.data?.pagination?.total || (response as any)?.data?.total || (response as any)?.pagination?.total || (response as any)?.total || usersList.length;
      setUsers(usersList);
      setTotalUsers(total);
      setIsDetailsDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} user: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  const getRoleCount = (role: string) => {
    return users.filter((user) => user.role === role).length;
  };

  const getStatusCount = (status: boolean) => {
    return users.filter((user) => user.isActive === status).length;
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">View, manage, and control all platform users and customers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">All roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-6 w-6 text-[#b7eb34]" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Active Users</p>
            <p className="text-3xl font-bold text-[#b7eb34]">{getStatusCount(true)}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Inactive Users</p>
            <p className="text-3xl font-bold text-red-600">{getStatusCount(false)}</p>
            <p className="text-xs text-gray-500 mt-1">Deactivated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Buyers</p>
            <p className="text-3xl font-bold text-purple-600">{getRoleCount('BUYER')}</p>
            <p className="text-xs text-gray-500 mt-1">Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="BUYER">Buyers</SelectItem>
              <SelectItem value="MEMBER">Members</SelectItem>
              <SelectItem value="COOP_ADMIN">Coop Admins</SelectItem>
              <SelectItem value="RCA_REGULATOR">Regulators</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedUsers.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalUsers)} of {totalUsers} users
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-12 px-6">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No users found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery || roleFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "No users have been registered yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Cooperative</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          user.role === 'BUYER' ? 'bg-purple-500' :
                          user.role === 'MEMBER' ? 'bg-blue-500' :
                          user.role === 'COOP_ADMIN' ? 'bg-green-500' :
                          'bg-orange-500'
                        }`}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        user.role === 'BUYER' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                        user.role === 'MEMBER' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                        user.role === 'COOP_ADMIN' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                        'bg-orange-100 text-orange-700 hover:bg-orange-100'
                      }`}>
                        {user.role?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.cooperative ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900">{user.cooperative.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        user.isActive 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleViewDetails(user)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.isActive ? (
                          <Button
                            onClick={() => handleAction(user.id, 'deactivate')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            disabled={isProcessing}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleAction(user.id, 'activate')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleAction(user.id, 'delete')}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedUser.role === 'BUYER' ? 'bg-purple-100 text-purple-700' :
                      selectedUser.role === 'MEMBER' ? 'bg-blue-100 text-blue-700' :
                      selectedUser.role === 'COOP_ADMIN' ? 'bg-green-100 text-[#b7eb34]' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedUser.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedUser.isActive ? 'bg-green-100 text-[#b7eb34]' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Verified</p>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedUser.isVerified ? 'bg-green-100 text-[#b7eb34]' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cooperative Information */}
              {selectedUser.cooperative && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cooperative</h3>
                  <div className="text-sm">
                    <p className="text-gray-500">Cooperative Name</p>
                    <p className="font-semibold text-gray-900">{selectedUser.cooperative.name}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedUser.createdAt && (
                    <div>
                      <p className="text-gray-500">Registration Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedUser.updatedAt && (
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedUser.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailsDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Close
            </Button>
            {selectedUser && (
              <>
                {selectedUser.isActive ? (
                  <Button
                    onClick={() => handleAction(selectedUser.id, 'deactivate')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Deactivate User
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAction(selectedUser.id, 'activate')}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate User
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;

