 import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  User,
  Package,
  AlertCircle,
  Truck,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { createOrder, processPayment, calculateShipping, getShippingMethods, getProductById } from "@/lib/api";
import type { ShippingOption } from "@/lib/types";

const CartPage = () => {
  const navigate = useNavigate();
  const { state: cartState, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get cooperative ID from first cart item
  useEffect(() => {
    if (cartState.items.length > 0) {
      // Extract cooperative ID from product - we'll need to fetch product details
      // For now, we'll calculate shipping when district is entered
    }
  }, [cartState.items]);

  // Checkout form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    district: "",
    sector: "",
    deliveryNotes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("MTN_MOBILE_MONEY");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("");
  const [shippingCost, setShippingCost] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [cooperativeId, setCooperativeId] = useState<string>("");

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  // Calculate shipping when district is entered
  const handleCalculateShipping = async () => {
    if (!shippingInfo.district || cartState.items.length === 0) {
      setShippingOptions([]);
      setShippingCost(0);
      return;
    }

    const firstItem = cartState.items[0];
    if (!firstItem) return;

    try {
      setCalculatingShipping(true);
      
      // Fetch product to get cooperative ID
      const productResponse = await getProductById(firstItem.productId);
      const product = productResponse.data || (productResponse as any).product;
      const coopId = product?.cooperativeId || product?.cooperative?.id;

      if (!coopId) {
        throw new Error('Could not determine cooperative');
      }

      const response = await calculateShipping({
        cooperativeId: coopId,
        buyerDistrict: shippingInfo.district,
        items: cartState.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        totalAmount: cartState.totalAmount
      });

      const options = response.data || [];
      setShippingOptions(options);
      
      // Auto-select first option if none selected
      if (options.length > 0 && !selectedShippingMethod) {
        setSelectedShippingMethod(options[0].method);
        setShippingCost(options[0].cost);
      } else if (selectedShippingMethod) {
        // Update cost for selected method
        const option = options.find(opt => opt.method === selectedShippingMethod);
        if (option) {
          setShippingCost(option.cost);
        }
      }
    } catch (error: any) {
      console.error('Failed to calculate shipping:', error);
      // Don't show error toast, just allow proceeding without shipping
      setShippingOptions([]);
      setShippingCost(0);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Recalculate shipping when district changes
  useEffect(() => {
    if (shippingInfo.district && cartState.items.length > 0) {
      const timeoutId = setTimeout(() => {
        handleCalculateShipping();
      }, 800); // Wait for user to finish typing
      return () => clearTimeout(timeoutId);
    } else {
      setShippingOptions([]);
      setShippingCost(0);
    }
  }, [shippingInfo.district, cartState.items]);

  // Update shipping cost when method changes
  useEffect(() => {
    const option = shippingOptions.find(opt => opt.method === selectedShippingMethod);
    if (option) {
      setShippingCost(option.cost);
    }
  }, [selectedShippingMethod, shippingOptions]);

  const handleCheckout = async () => {
    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address ||
        !shippingInfo.district || !shippingInfo.sector) {
      toast({
        title: "Missing information",
        description: "Please fill in all required shipping information.",
        variant: "destructive",
      });
      return;
    }

    if (cartState.items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const finalTotal = cartState.totalAmount + shippingCost;

      // Prepare order data
      const orderData = {
        items: cartState.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        })),
        shippingInfo,
        paymentMethod,
        totalAmount: finalTotal,
        shippingMethod: selectedShippingMethod || 'STANDARD',
        shippingCost: shippingCost
      };

      // Create order via API
      const response = await createOrder(orderData);
      // API returns: { message, data: Order }
      const orderId = response.data?.id;
      console.log('Order created, ID:', orderId, 'Full response:', response);

      // For mobile money payments, automatically initiate payment processing
      if ((paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MOBILE_MONEY') && orderId) {
        try {
          // Automatically process payment using the phone number from shipping info
          const paymentResponse = await processPayment(orderId, shippingInfo.phone);

          if (paymentResponse.message || paymentResponse.data) {
            const transactionRef = (paymentResponse.data as any)?.transactionRef || (paymentResponse as any).transactionRef || 'N/A';
            toast({
              title: "Payment Initiated!",
              description: `Please check your phone (${shippingInfo.phone}) for the USSD prompt to approve the payment. Transaction reference: ${transactionRef}`,
            });
          } else {
            toast({
              title: "Order created, payment pending",
              description: "Order was created successfully. Payment can be processed from your orders page.",
              variant: "destructive",
            });
          }
        } catch (paymentError: any) {
          console.error('Payment initiation failed:', paymentError);
          toast({
            title: "Order created successfully!",
            description: paymentError.message || "Order was created. You can initiate payment from your orders page.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Order placed successfully!",
          description: "Your order has been created and is being processed.",
        });
      }

      // Clear cart and redirect to orders page
      clearCart();
      navigate('/buyer-orders');

    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products from the marketplace to get started.</p>
            <Button
              onClick={() => navigate('/buyer-marketplace')}
              className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/buyer-marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items ({cartState.totalItems})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">From: {item.cooperative}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)} per {item.unit}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-0">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartState.totalItems} items)</span>
                  <span>{formatCurrency(cartState.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cartState.totalAmount + shippingCost)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={shippingInfo.district}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector *</Label>
                    <Input
                      id="sector"
                      value={shippingInfo.sector}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, sector: e.target.value }))}
                      placeholder="Sector"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="deliveryNotes"
                      value={shippingInfo.deliveryNotes}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            {shippingOptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {shippingOptions.map((option) => (
                    <div
                      key={option.method}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedShippingMethod === option.method
                          ? "border-[#b7eb34] bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedShippingMethod(option.method)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {option.description}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Estimated {option.estimatedDays} day(s)
                          </p>
                        </div>
                        <p className="font-bold text-[#b7eb34]">
                          {option.cost === 0 ? "Free" : formatCurrency(option.cost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Select Payment Method *</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN_MOBILE_MONEY">MTN Mobile Money</SelectItem>
                      <SelectItem value="AIRTEL_MOBILE_MONEY">AIRTEL Mobile Money</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">Payment Processing</p>
                    <p>
                      You will be redirected to the payment gateway for{" "}
                      {paymentMethod === "MTN_MOBILE_MONEY"
                        ? "MTN Mobile Money"
                        : paymentMethod === "AIRTEL_MOBILE_MONEY"
                        ? "AIRTEL Mobile Money"
                        : paymentMethod === "BANK_TRANSFER"
                        ? "Bank Transfer"
                        : paymentMethod === "CASH_ON_DELIVERY"
                        ? "Cash on Delivery"
                        : paymentMethod}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#b7eb34] hover:bg-[#a3d72f] text-white py-6 text-lg font-semibold"
            >
              {loading ? (
                "Processing Order..."
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Place Order - {formatCurrency(cartState.totalAmount + shippingCost)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
