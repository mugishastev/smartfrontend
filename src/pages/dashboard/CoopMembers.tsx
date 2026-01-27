import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Phone, MapPin, Calendar, UserPlus, Eye, Edit, Mail as MailIcon, X, CheckCircle, Clock, Upload, Download, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { listMembers, getProfile, inviteMember, getPendingInvitations, cancelInvitation, deleteMember, importMembers, getMemberById } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { MemberTable } from "@/components/dashboard/MemberTable";

const CoopMembers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberDetails, setMemberDetails] = useState<User | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        // Load user profile first to get cooperativeId
        const profileRes = await getProfile();
        setProfile(profileRes.data);

        if (!profileRes.data.cooperativeId) {
          setMembers([]);
          return;
        }

        // Load members for this cooperative
        const membersRes = await listMembers(profileRes.data.cooperativeId);
        setMembers(membersRes.data?.members || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load members');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);



  const handleViewMember = async (member: User) => {
    try {
      setLoadingDetails(true);
      setShowDetailsDialog(true);
      setSelectedMember(member);
      // Use the member data we already have first
      setMemberDetails(member);

      // Try to fetch full member details from API
      try {
        const res = await getMemberById(member.id);
        // Backend returns the member object directly, API wraps it in { message, data: User }
        const apiMember = (res.data as any)?.member || res.data || member;
        setMemberDetails(apiMember as User);
      } catch (apiError) {
        // If API call fails, we already set the member from the table
        console.warn('Could not fetch additional member details from API:', apiError);
      }
    } catch (error: any) {
      console.error('Error loading member details:', error);
      setMemberDetails(member);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load member details. Showing available information."
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditMember = (member: User) => {
    navigate(`/member/${member.id}/edit`);
  };

  const handleDeleteMember = async (member: User) => {
    if (!window.confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName} from the cooperative?`)) {
      return;
    }

    try {
      await deleteMember(member.id);
      toast({
        title: "Member Removed",
        description: `${member.firstName} ${member.lastName} has been removed from the cooperative.`,
        className: "bg-green-50 text-green-900 border-green-200"
      });

      // Refresh members list
      if (profile?.cooperativeId) {
        const membersRes = await listMembers(profile.cooperativeId);
        setMembers(membersRes.data?.members || []);
      }
    } catch (error: any) {
      console.error('Failed to delete member:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to remove member. Please try again."
      });
    }
  };

  const handleResendInvite = async (member: User) => {
    if (!window.confirm(`Are you sure you want to resend an invitation to ${member.firstName} ${member.lastName}?`)) {
      return;
    }

    try {
      // Assuming inviteMember can be used to resend invitations
      await inviteMember(member.email, member.role);
      toast({
        title: "Invitation Sent",
        description: `Invitation resent to ${member.email}.`,
        className: "bg-green-50 text-green-900 border-green-200"
      });
    } catch (error: any) {
      console.error('Failed to resend invitation:', error);
      const errorMessage = error?.details?.error || error?.message || "Failed to resend invitation. Please try again.";
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: errorMessage
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx, .xls) or CSV file (.csv)"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file to upload"
      });
      return;
    }

    setUploadingFile(true);
    try {
      // Use the importMembers API function
      const response = await importMembers(selectedFile);

      toast({
        title: "Upload Successful",
        description: response.message || `Successfully uploaded ${selectedFile.name}. Members will be added shortly.`,
        className: "bg-green-50 text-green-900 border-green-200"
      });

      setBulkUploadDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh members list
      if (profile?.cooperativeId) {
        const membersRes = await listMembers(profile.cooperativeId);
        setMembers(membersRes.data?.members || []);
      }

    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error?.message || "Failed to upload file. Please check the file format and try again."
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const downloadTemplate = () => {
    // Create a CSV template (headers only, no sample data)
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'ID Number', 'Village', 'Role'];

    const csvContent = headers.join(',');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Use this template to prepare your member data",
      className: "bg-blue-50 text-blue-900 border-blue-200"
    });
  };

  const filteredMembers = members.filter(member =>
    member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone?.includes(searchQuery)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Members Management</h1>
        <p className="text-gray-600">Manage your cooperative members</p>
      </div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Total Members</p>
              <p className="text-3xl font-bold text-blue-600">{loading ? '...' : members.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">New This Month</p>
              <p className="text-3xl font-bold text-green-600">{loading ? '...' : members.filter(m => {
                const joinedDate = new Date(m.createdAt);
                const now = new Date();
                const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return joinedDate >= oneMonthAgo;
              }).length}</p>
              <p className="text-xs text-gray-500 mt-1">Recent additions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Total Contributions</p>
              <p className="text-3xl font-bold text-[#b7eb34]">--</p>
              <p className="text-xs text-gray-500 mt-1">RWF</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Active Producers</p>
              <p className="text-3xl font-bold text-orange-600">--</p>
              <p className="text-xs text-gray-500 mt-1">Currently producing</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add Member */}
        <div className="flex gap-4 mb-6">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search members by name, ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 h-12"
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">

            <Dialog open={bulkUploadDialogOpen} onOpenChange={setBulkUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-16 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Members</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 mb-2">
                      Upload multiple members using an Excel spreadsheet or CSV file
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Excel (.xlsx, .xls) or CSV (.csv) files only
                      </p>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-900">{selectedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleBulkUpload}
                      disabled={!selectedFile || uploadingFile}
                      className="flex-1 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                    >
                      {uploadingFile ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Members
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBulkUploadDialogOpen(false);
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => navigate('/coop-members/add')}
              className="icon-flip-hover h-16 bg-[#b7eb34] hover:bg-[#8ccc15] text-white px-8 transition-all duration-200"
            >
              <UserPlus className="icon-flip-animate h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>


        {/* Members List */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Members Directory ({filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'})
            </h3>

            {loading ? (
              <div className="text-center py-8">Loading members...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>Error loading members: {error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <MemberTable
                members={filteredMembers}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                onInvite={handleResendInvite}
              />
            )}

            {/* Keep the old card view as fallback - hidden by default */}
            <div className="hidden">
              <div className="space-y-4">
                {filteredMembers.map((member: any) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-4 flex-1">
                        <div className="h-16 w-16 rounded-full bg-[#b7eb34] flex items-center justify-center text-white font-bold text-xl">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {member.firstName} {member.lastName}
                            </h4>
                            <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-[#b7eb34] rounded-full">
                              Active
                            </span>
                            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {member.role || 'Member'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="font-medium">ID:</span> {member.idNumber || member.id}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {member.phone || 'Not provided'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {member.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {member.village || 'Not specified'}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Joined:</span> {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                            <p className="text-[#b7eb34] font-bold">
                              <span className="text-gray-600 font-medium">Contributions:</span> -- RWF
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={() => navigate(`/member/${member.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/member/${member.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
                        View Contributions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              Complete information about the member
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : memberDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {memberDetails.firstName} {memberDetails.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{memberDetails.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{memberDetails.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${memberDetails.role === 'COOP_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      memberDetails.role === 'SECRETARY' ? 'bg-blue-100 text-blue-800' :
                        memberDetails.role === 'ACCOUNTANT' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {memberDetails.role?.replace('_', ' ') || 'MEMBER'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    {memberDetails.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  {(memberDetails as any).idNumber && (
                    <div>
                      <p className="text-gray-500">ID Number</p>
                      <p className="font-semibold text-gray-900">{(memberDetails as any).idNumber}</p>
                    </div>
                  )}
                  {(memberDetails as any).village && (
                    <div>
                      <p className="text-gray-500">Village / Location</p>
                      <p className="font-semibold text-gray-900">{(memberDetails as any).village}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cooperative Information */}
              {memberDetails.cooperative && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cooperative</h3>
                  <div className="text-sm">
                    <p className="text-gray-500">Cooperative Name</p>
                    <p className="font-semibold text-gray-900">
                      {typeof memberDetails.cooperative === 'object'
                        ? memberDetails.cooperative.name
                        : memberDetails.cooperative}
                    </p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {memberDetails.createdAt && (
                  <div>
                    <p className="text-gray-500">Joined Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(memberDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {memberDetails.updatedAt && (
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(memberDetails.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No member details available</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDetailsDialog(false);
              setMemberDetails(null);
              setSelectedMember(null);
            }}>
              Close
            </Button>
            {memberDetails && (
              <Button
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleEditMember(memberDetails);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Member
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoopMembers;
