import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Landmark, ArrowDownCircle, History, Plus, Eye, X } from "lucide-react";
import { createRequest, getMyRequests, getMemberProfile } from "@/lib/api";
import type { MemberRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const MemberRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [requestType, setRequestType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    // Check if we should open create dialog based on navigation state
    if (location.state?.action) {
      setIsCreateDialogOpen(true);
      setRequestType(location.state.action === 'loan' ? 'Loan' : 'Withdrawal');
    }
    loadRequests();
  }, [location.state]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getMyRequests();
      setRequests(res.data.requests || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!requestType || !description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (requestType === 'Loan' && !amount) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Amount is required for loan requests",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createRequest({
        type: requestType,
        amount: requestType === 'Loan' ? parseFloat(amount) : undefined,
        description,
      });
      
      toast({
        title: "Success",
        description: "Request submitted successfully",
        className: "bg-green-50 text-green-900 border-green-200",
      });
      
      setIsCreateDialogOpen(false);
      setRequestType("");
      setAmount("");
      setDescription("");
      loadRequests();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to create request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (request: MemberRequest) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    return type === 'Loan' ? Landmark : ArrowDownCircle;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">View and manage your loan and withdrawal requests</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Request
        </Button>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-12 px-6">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No requests found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first request to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Request ID</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Date Submitted</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const Icon = getTypeIcon(request.type);
                  return (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {request.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{request.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {request.amount ? formatCurrency(request.amount) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Submit a new loan or withdrawal request to your cooperative
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Request Type <span className="text-red-500">*</span>
              </label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Loan">Loan</SelectItem>
                  <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {requestType === 'Loan' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Amount (RWF) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter loan amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe your request..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setRequestType("");
                setAmount("");
                setDescription("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={isSubmitting}
              className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about your request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Request ID</p>
                  <p className="font-semibold text-gray-900 font-mono text-sm">
                    {selectedRequest.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getTypeIcon(selectedRequest.type);
                      return <Icon className="h-4 w-4 text-gray-500" />;
                    })()}
                    <p className="font-semibold text-gray-900">{selectedRequest.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRequest.amount ? formatCurrency(selectedRequest.amount) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusBadge(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedRequest.processedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Date Processed</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.processedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.description}
                </p>
              </div>
              {selectedRequest.rejectionReason && (
                <div>
                  <p className="text-sm text-red-500 mb-2">Rejection Reason</p>
                  <p className="text-red-900 bg-red-50 p-3 rounded-lg">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberRequests;

