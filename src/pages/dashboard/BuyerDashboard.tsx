import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  DollarSign,
  Clock,
  CheckCircle,
  Search,
  Package,
  MapPin,
  Star,
  TrendingUp,
  Heart,
  CreditCard,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBuyerStats, getBuyerOrders, getAllProducts, getFavorites, getBuyerPayments } from "@/lib/api";
import { useEffect, useState } from "react";
import type { BuyerDashboardStats, Order, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BuyerDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          getBuyerStats(),
          getBuyerOrders(5) // Get 5 most recent orders
        ]);

        setStats(statsRes.data);
        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);

        // Load recommended products (products from categories user has purchased from)
        // For now, just get some products - can be enhanced with purchase history
        try {
          const productsRes = await getAllProducts({ limit: 4 });
          const products = productsRes.data?.products ?? [];
          setRecommendedProducts(Array.isArray(products) ? products : []);
        } catch (err) {
          console.error('Failed to load recommended products:', err);
        }

        // Load favorites
        try {
          const favoritesRes = await getFavorites();
          const favorites = favoritesRes.data ?? [];
          // If favorites are product IDs, fetch the products
          if (Array.isArray(favorites) && favorites.length > 0) {
            // For now, if favorites returns product objects, use them directly
            // Otherwise, we'd need to fetch products by ID
            setFavoriteProducts(Array.isArray(favorites) ? favorites : []);
          }
        } catch (err) {
          console.error('Failed to load favorites:', err);
        }

        // Load recent payments
        try {
          const paymentsRes = await getBuyerPayments();
          const payments = paymentsRes.data ?? [];
          setRecentPayments(Array.isArray(payments) ? payments.slice(0, 5) : []);
        } catch (err) {
          console.error('Failed to load payments:', err);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
        console.error('Dashboard loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const statCards = stats ? [
    { 
      label: "Total Orders", 
      value: stats.totalOrders?.toString() ?? "0", 
      color: "blue" as const, 
      icon: ShoppingCart,
      description: "All orders you've placed"
    },
    { 
      label: "Total Spent", 
      value: formatCurrency(stats.totalSpent ?? 0), 
      color: "green" as const, 
      icon: DollarSign,
      description: "Your lifetime spending"
    },
    { 
      label: "Pending Orders", 
      value: stats.pendingOrders?.toString() ?? "0", 
      color: "orange" as const, 
      icon: Clock,
      description: "Orders being processed"
    },
    { 
      label: "Completed Orders", 
      value: stats.completedOrders?.toString() ?? "0", 
      color: "purple" as const, 
      icon: CheckCircle,
      description: "Successfully delivered"
    }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              statCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-4 rounded-xl shadow-sm ${
                        stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <stat.icon className={`h-7 w-7 ${
                          stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-white mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/buyer-marketplace')}
              className="h-20 bg-[#b7eb34] hover:bg-[#a3d72f] text-white text-lg font-semibold"
            >
              <Search className="h-6 w-6 mr-3" />
              Browse the Marketplace
            </Button>
            <Button
              onClick={() => navigate('/buyer-orders')}
              variant="outline"
              className="h-20 border-2 border-gray-300 hover:border-[#b7eb34] hover:bg-[#b7eb34]/10 text-lg font-semibold"
            >
              <Package className="h-6 w-6 mr-3" />
              View All My Orders
            </Button>
          </div>

          {/* Recent Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 dark:text-white mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-white font-medium mb-2">No orders yet</p>
                  <p className="text-sm text-gray-500 dark:text-white mb-4">
                    Start shopping to see your orders here
                  </p>
                  <Button
                    onClick={() => navigate('/buyer-marketplace')}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => {
                  const orderNumber = order.orderNumber || `#ORD-${order.id.slice(-6).toUpperCase()}`;
                  const cooperativeName = (order as any).items?.[0]?.product?.cooperative?.name || 
                                         (order as any).cooperative?.name || 
                                         'Unknown Cooperative';
                  
                  return (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {orderNumber}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-white">
                                {formatOrderDate(order.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white mb-2">
                              <MapPin className="h-4 w-4" />
                              <span>{cooperativeName}</span>
                            </div>
                            <p className="text-xl font-bold text-[#b7eb34]">
                              {formatCurrency(order.totalAmount ?? 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        {(order as any).items && Array.isArray((order as any).items) && (order as any).items.length > 0 && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 dark:text-white mb-2">Items:</p>
                            <div className="space-y-2">
                              {(order as any).items.slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  {item.product?.images?.[0] ? (
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                      <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {item.product?.name || 'Product'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Qty: {item.quantity} × {formatCurrency(item.price ?? 0)}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-gray-900">
                                    {formatCurrency(item.subtotal ?? item.quantity * item.price ?? 0)}
                                  </p>
                                </div>
                              ))}
                              {(order as any).items.length > 3 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{(order as any).items.length - 3} more item(s)
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate(`/buyer-orders?order=${order.id}`)}
                            >
                              Track Order
                            </Button>
                          )}
                          {order.status === 'DELIVERED' && (
                            <Button
                              className="flex-1 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                              onClick={() => {
                                toast({
                                  title: "Review",
                                  description: "Review functionality coming soon!",
                                });
                              }}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Leave a Review
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/buyer-orders?order=${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h2>
                <Badge variant="outline" className="ml-2">
                  {favoriteProducts.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/buyer-favorites')}
                className="text-[#b7eb34] hover:text-[#a3d72f]"
              >
                View All
              </Button>
            </div>
            {favoriteProducts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 dark:text-white mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-white font-medium mb-2">No favorites yet</p>
                  <p className="text-sm text-gray-500 dark:text-white mb-4">
                    Start adding products to your favorites to see them here
                  </p>
                  <Button
                    onClick={() => navigate('/buyer-marketplace')}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {favoriteProducts.slice(0, 4).map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="relative w-full h-40 bg-gray-50 rounded-lg mb-3 overflow-hidden border border-gray-200">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Removed from favorites",
                              description: "Product removed from your favorites",
                            });
                          }}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {product.cooperative?.name || 'Cooperative'}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-[#b7eb34]">
                          {formatCurrency(product.price ?? 0)}
                        </p>
                        <Button
                          size="sm"
                          className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                          onClick={() => navigate('/buyer-marketplace')}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Payments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Payments</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/buyer-payments')}
                className="text-[#b7eb34] hover:text-[#a3d72f]"
              >
                View All
              </Button>
            </div>
            {recentPayments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-300 dark:text-white mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-white font-medium mb-2">No payments yet</p>
                  <p className="text-sm text-gray-500 dark:text-white mb-4">
                    Your payment history will appear here
                  </p>
                  <Button
                    onClick={() => navigate('/buyer-orders')}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'COMPLETED':
                      case 'PAID':
                        return 'bg-green-100 text-green-700 border-green-300';
                      case 'PROCESSING':
                        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
                      case 'FAILED':
                        return 'bg-red-100 text-red-700 border-red-300';
                      case 'PENDING':
                        return 'bg-gray-100 text-gray-700 border-gray-300';
                      default:
                        return 'bg-gray-100 text-gray-700 border-gray-300';
                    }
                  };

                  return (
                    <Card key={payment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-base font-bold text-gray-900">
                                {payment.description || `Payment for Order ${payment.orderNumber || payment.id?.slice(-8)?.toUpperCase() || 'N/A'}`}
                              </h4>
                              <Badge className={getStatusColor(payment.status || payment.paymentStatus || 'PENDING')}>
                                {(payment.status || payment.paymentStatus || 'PENDING').replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                <span className="font-medium">Date:</span> {new Date(payment.createdAt || payment.date || Date.now()).toLocaleDateString()}
                              </span>
                              <span>
                                <span className="font-medium">Method:</span> {payment.paymentMethod || 'Mobile Money'}
                              </span>
                              {payment.reference && (
                                <span>
                                  <span className="font-medium">Ref:</span> {payment.reference}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#b7eb34]">
                              {formatCurrency(payment.amount || 0)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Receipt",
                                  description: "Receipt download coming soon!",
                                });
                              }}
                              className="mt-2"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/buyer-marketplace')}
                  className="text-[#b7eb34] hover:text-[#a3d72f]"
                >
                  See All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate('/buyer-marketplace')}
                  >
                    <CardContent className="pt-6">
                      <div className="relative w-full h-40 bg-gray-50 rounded-lg mb-3 overflow-hidden border border-gray-200">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {product.cooperative?.name || 'Cooperative'}
                      </p>
                      <p className="text-lg font-bold text-[#b7eb34]">
                        {formatCurrency(product.price ?? 0)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BuyerDashboard;
