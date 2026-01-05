import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Package,
  ArrowLeft,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getReturnRequests,
  createReturnRequest,
  cancelReturnRequest,
  getReturnRequestById,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ReturnRequest, Order } from "@/lib/types";
import { getBuyerOrders } from "@/lib/api";

const ReturnRequestsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReturns();
    loadOrders();
  }, [statusFilter]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const response = await getReturnRequests(1, 50);
      const returnsList = response.data?.returns || response.data || [];
      let filtered = Array.isArray(returnsList) ? returnsList : [];

      if (statusFilter !== "all") {
        filtered = filtered.filter((r: ReturnRequest) => r.status === statusFilter);
      }

      setReturns(filtered);
    } catch (error: any) {
      console.error("Failed to load returns:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load return requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await getBuyerOrders(100);
      const ordersList = response.data || [];
      // Only show delivered orders that can be returned
      const eligibleOrders = (Array.isArray(ordersList) ? ordersList : []).filter(
        (order: Order) => order.status === "DELIVERED"
      );
      setOrders(eligibleOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const handleCreateReturn = async () => {
    if (!selectedOrder || !returnReason) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select an order and provide a reason",
      });
      return;
    }

    // Get first product from order
    const firstItem = selectedOrder.items?.[0] || (selectedOrder as any).product;
    if (!firstItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No products found in this order",
      });
      return;
    }

    const productId = firstItem.productId || firstItem.product?.id || firstItem.id;
    const orderItemId = firstItem.id;

    try {
      setSubmitting(true);
      await createReturnRequest({
        orderId: selectedOrder.id,
        productId,
        orderItemId: orderItemId || undefined,
        reason: returnReason,
        description: returnDescription || undefined,
        images: returnImages.length > 0 ? returnImages : undefined,
      });

      toast({
        title: "Success",
        description: "Return request submitted successfully",
      });

      setShowReturnDialog(false);
      setSelectedOrder(null);
      setReturnReason("");
      setReturnDescription("");
      setReturnImages([]);
      loadReturns();
    } catch (error: any) {
      console.error("Failed to create return:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit return request",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReturn = async (returnId: string) => {
    if (!confirm("Are you sure you want to cancel this return request?")) return;

    try {
      await cancelReturnRequest(returnId);
      toast({
        title: "Success",
        description: "Return request cancelled",
      });
      loadReturns();
    } catch (error: any) {
      console.error("Failed to cancel return:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel return request",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any; icon: any; label: string } } = {
      PENDING: {
        variant: "secondary",
        icon: Clock,
        label: "Pending",
      },
      APPROVED: {
        variant: "default",
        icon: CheckCircle,
        label: "Approved",
      },
      REJECTED: {
        variant: "destructive",
        icon: XCircle,
        label: "Rejected",
      },
      REFUNDED: {
        variant: "default",
        icon: DollarSign,
        label: "Refunded",
      },
      CANCELLED: {
        variant: "outline",
        icon: XCircle,
        label: "Cancelled",
      },
      PROCESSING: {
        variant: "default",
        icon: RefreshCw,
        label: "Processing",
      },
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setReturnImages(files);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Return Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your product returns and refunds</p>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white">
                <Package className="h-4 w-4 mr-2" />
                Request Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request a Return</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Order *</Label>
                  <Select
                    value={selectedOrder?.id || ""}
                    onValueChange={(value) => {
                      const order = orders.find((o) => o.id === value);
                      setSelectedOrder(order || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          Order #{order.orderNumber || order.id.slice(0, 8)} - {formatCurrency(order.totalAmount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reason for Return *</Label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFECTIVE">Defective/Damaged Product</SelectItem>
                      <SelectItem value="WRONG_ITEM">Wrong Item Received</SelectItem>
                      <SelectItem value="NOT_AS_DESCRIBED">Not as Described</SelectItem>
                      <SelectItem value="CHANGED_MIND">Changed Mind</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="return-description">Additional Details</Label>
                  <Textarea
                    id="return-description"
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    placeholder="Provide more details about your return..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="return-images">Photos (optional, up to 5)</Label>
                  <input
                    id="return-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="mt-2"
                  />
                  {returnImages.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {returnImages.length} image(s) selected
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateReturn}
                    disabled={submitting || !selectedOrder || !returnReason}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Return Request"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#b7eb34]" />
        </div>
      ) : returns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No return requests yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((returnRequest) => (
            <Card key={returnRequest.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(returnRequest.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Request #{returnRequest.id.slice(0, 8)}
                      </span>
                      {returnRequest.order?.orderNumber && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Order: {returnRequest.order.orderNumber}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {returnRequest.product?.name || "Product"}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Reason:</span> {returnRequest.reason}
                    </p>

                    {returnRequest.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {returnRequest.description}
                      </p>
                    )}

                    {returnRequest.refundAmount && (
                      <p className="text-sm font-semibold text-green-600 mb-2">
                        Refund Amount: {formatCurrency(returnRequest.refundAmount)}
                      </p>
                    )}

                    {returnRequest.rejectionReason && (
                      <p className="text-sm text-red-600 mb-2">
                        <span className="font-medium">Rejection Reason:</span> {returnRequest.rejectionReason}
                      </p>
                    )}

                    {returnRequest.images && returnRequest.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {returnRequest.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Return ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Requested on {new Date(returnRequest.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {returnRequest.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelReturn(returnRequest.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnRequestsPage;

