import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  MapPin,
  CreditCard,
  Calendar,
  Eye,
  Filter,
  Download,
  Star,
  MessageSquare,
  XCircle,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBuyerOrders, cancelOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import type { Order } from "@/lib/types";

const BuyerOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getBuyerOrders();
        const ordersList = response.data || [];
        setOrders(Array.isArray(ordersList) ? ordersList : []);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "PROCESSING":
        return <Package className="h-4 w-4" />;
      case "SHIPPED":
      case "IN_TRANSIT":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: "PENDING", label: "Order Placed", completed: true },
      { key: "PROCESSING", label: "Processing", completed: false },
      { key: "SHIPPED", label: "Shipped", completed: false },
      { key: "DELIVERED", label: "Delivered", completed: false },
    ];

    const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
    // Scroll to timeline section in dialog
    setTimeout(() => {
      const timelineElement = document.querySelector('[data-timeline]');
      if (timelineElement) {
        timelineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelDialog(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrderId(orderToCancel.id);
      await cancelOrder(orderToCancel.id);
      
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully. Stock has been restored.",
      });

      // Refresh orders list
      const response = await getBuyerOrders();
      const ordersList = response.data || [];
      setOrders(Array.isArray(ordersList) ? ordersList : []);
      
      setShowCancelDialog(false);
      setOrderToCancel(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel order. Please try again.",
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) =>
      ["PROCESSING", "SHIPPED", "IN_TRANSIT"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
        <p className="text-gray-600 dark:text-white">
          Track and manage all your orders from cooperatives
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.processing}
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.delivered}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-white mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400 dark:text-white" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 dark:text-white ml-auto">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-white">Loading your orders...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <X className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
              <p className="text-gray-600 dark:text-white font-medium mb-2">
                {statusFilter !== "all"
                  ? "No orders found with this status"
                  : "You haven't placed any orders yet"}
              </p>
              <p className="text-sm text-gray-500 dark:text-white mb-4">
                {statusFilter !== "all"
                  ? "Try selecting a different status filter"
                  : "Start shopping to see your orders here"}
              </p>
              {statusFilter === "all" && (
                <Button
                  onClick={() => navigate("/buyer-marketplace")}
                  className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                >
                  Browse Products
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusSteps = getStatusSteps(order.status);
            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} border flex items-center gap-1`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          <span className="capitalize">
                            {order.paymentStatus.toLowerCase()}
                          </span>
                        </div>
                        {order.cooperative && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{order.cooperative.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#b7eb34] mb-1">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white">
                        {(order as any).items && Array.isArray((order as any).items)
                          ? `${(order as any).items.length} item${(order as any).items.length > 1 ? 's' : ''}`
                          : `${order.quantity} ${order.product?.unit || "items"}`}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    {(order as any).items && Array.isArray((order as any).items) && (order as any).items.length > 0 ? (
                      <div className="space-y-3">
                        {(order as any).items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            {item.product?.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400 dark:text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {item.product?.name || "Product"}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-white">
                                Quantity: {item.quantity} × {formatCurrency(item.price || 0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.subtotal || item.quantity * item.price || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {order.product?.images && order.product.images.length > 0 ? (
                          <img
                            src={order.product.images[0]}
                            alt={order.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400 dark:text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {order.product?.name || "Product"}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-white">
                            Quantity: {order.quantity} ×{" "}
                            {formatCurrency(order.product?.price || 0)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {statusSteps.map((step, index) => (
                        <div
                          key={step.key}
                          className="flex items-center flex-1"
                        >
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                step.completed
                                  ? "bg-[#b7eb34] border-[#b7eb34] text-white"
                                  : step.current
                                  ? "bg-blue-100 border-blue-500 text-blue-700"
                                  : "bg-gray-100 border-gray-300 text-gray-400 dark:text-white"
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : step.current ? (
                                <Clock className="h-5 w-5" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-current" />
                              )}
                            </div>
                            <p
                              className={`text-xs mt-2 text-center ${
                                step.completed || step.current
                                  ? "text-gray-900 dark:text-white font-medium"
                                  : "text-gray-500 dark:text-white"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 mx-2 ${
                                step.completed
                                  ? "bg-[#b7eb34]"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="w-full sm:flex-1 min-h-[44px] text-sm sm:text-base"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {order.status === "DELIVERED" && (
                      <Button className="w-full sm:flex-1 min-h-[44px] bg-[#b7eb34] hover:bg-[#a3d72f] text-white text-sm sm:text-base">
                        <Star className="h-4 w-4 mr-2" />
                        Rate & Review
                      </Button>
                    )}
                    {order.status !== "CANCELLED" &&
                      order.status !== "DELIVERED" && (
                        <Button 
                          variant="outline" 
                          className="w-full sm:flex-1 min-h-[44px] text-sm sm:text-base"
                          onClick={() => handleTrackOrder(order)}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                    {order.status !== "CANCELLED" &&
                      order.status !== "DELIVERED" && (
                        <Button 
                          variant="outline" 
                          className="w-full sm:flex-1 min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm sm:text-base"
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingOrderId === order.id}
                        >
                          {cancellingOrderId === order.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </>
                          )}
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  Complete order information and tracking
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={`${getStatusColor(
                      selectedOrder.status
                    )} border flex items-center gap-2 px-4 py-2`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.replace("_", " ")}
                  </Badge>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#b7eb34]">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white">Total Amount</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  {(selectedOrder as any).items && Array.isArray((selectedOrder as any).items) && (selectedOrder as any).items.length > 0 ? (
                    <div className="space-y-3">
                      {(selectedOrder as any).items.map((item: any, idx: number) => (
                        <Card key={idx}>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              {item.product?.images && item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package className="h-10 w-10 text-gray-400 dark:text-white" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {item.product?.name || "Product"}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-white">
                                  {item.product?.description || "No description"}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-sm">
                                  <span>
                                    Quantity: <strong>{item.quantity}</strong>
                                  </span>
                                  <span>
                                    Unit Price:{" "}
                                    <strong>{formatCurrency(item.price || 0)}</strong>
                                  </span>
                                  <span>
                                    Subtotal:{" "}
                                    <strong>{formatCurrency(item.subtotal || item.quantity * item.price || 0)}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          {selectedOrder.product?.images &&
                            selectedOrder.product.images.length > 0 && (
                              <img
                                src={selectedOrder.product.images[0]}
                                alt={selectedOrder.product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {selectedOrder.product?.name || "Product"}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-white">
                              {selectedOrder.product?.description || "No description"}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span>
                                Quantity: <strong>{selectedOrder.quantity}</strong>
                              </span>
                              <span>
                                Unit Price:{" "}
                                <strong>
                                  {formatCurrency(selectedOrder.product?.price || 0)}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Order Date
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-white">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Status
                      </h4>
                      <Badge
                        className={
                          selectedOrder.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Cooperative Info */}
                {selectedOrder.cooperative && (
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Cooperative
                      </h4>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedOrder.cooperative.name}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <div data-timeline>
                  <h4 className="font-semibold mb-3">Order Timeline</h4>
                  <div className="space-y-4">
                    {getStatusSteps(selectedOrder.status).map((step, index) => (
                      <div
                        key={step.key}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed
                              ? "bg-[#b7eb34] text-white"
                              : step.current
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-400 dark:text-white"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              step.completed || step.current
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-white"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.current && (
                            <p className="text-xs text-gray-500 dark:text-white mt-1">
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {orderToCancel && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  Order #{orderToCancel.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {formatCurrency(orderToCancel.totalAmount)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: {orderToCancel.status}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Cancelling this order will restore the product stock. 
                  If payment was already processed, a refund may be required.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false);
                    setOrderToCancel(null);
                  }}
                  disabled={cancellingOrderId === orderToCancel.id}
                >
                  Keep Order
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmCancelOrder}
                  disabled={cancellingOrderId === orderToCancel.id}
                >
                  {cancellingOrderId === orderToCancel.id ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Yes, Cancel Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerOrders;
