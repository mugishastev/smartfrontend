import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, MapPin } from "lucide-react";
import { createOrder, getAllProducts, getProfile, processPayment } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type { Product, User } from "@/lib/types";

const AddBuyerOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    paymentMethod: "MTN_MOBILE_MONEY",
    fullName: "",
    phone: "",
    address: "",
    district: "",
    sector: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products
        const productsRes = await getAllProducts({ limit: 100 });
        setProducts(productsRes.data?.products || []);

        // Load user profile
        const profileRes = await getProfile();
        if (profileRes.data) {
          const userData = profileRes.data;
          setUser(userData);
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            phone: userData.phone || '',
          }));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.productId.trim()) {
      newErrors.productId = "Please select a product";
    }
    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be a valid positive number";
    } else if (selectedProduct && Number(formData.quantity) > (selectedProduct.availableStock || 0)) {
      newErrors.quantity = `Only ${selectedProduct.availableStock} units available`;
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }
    if (!formData.sector.trim()) {
      newErrors.sector = "Sector is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedProduct) return;

    setLoading(true);
    try {
      const quantity = Number(formData.quantity);
      const unitPrice = selectedProduct.price;
      const subtotal = unitPrice * quantity;
      const deliveryFee = 5000; // Fixed delivery fee
      const totalAmount = subtotal + deliveryFee;

      const orderData = {
        items: [{
          productId: formData.productId,
          quantity: quantity,
          unitPrice: unitPrice,
        }],
        shippingInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          district: formData.district,
          sector: formData.sector,
          deliveryNotes: formData.notes || undefined,
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: totalAmount,
      };

      const response = await createOrder(orderData);
      // Backend returns: { message, order: { id, ... } }
      // Normalized to: { message, data: { order: { id, ... } } } or { message, data: { id, ... } }
      const orderId = (response.data as any)?.order?.id || (response.data as any)?.id || response.order?.id;
      console.log('Order created, ID:', orderId, 'Full response:', response);

      // For mobile money payments, automatically initiate payment processing
      if ((formData.paymentMethod === 'MTN_MOBILE_MONEY' || formData.paymentMethod === 'AIRTEL_MOBILE_MONEY') && orderId) {
        try {
          // Automatically process payment using the phone number from form
          const paymentResponse = await processPayment(orderId, formData.phone);
          
          if (paymentResponse.message || paymentResponse.data) {
            toast({
              title: "Payment Initiated!",
              description: `Please check your phone (${formData.phone}) for the USSD prompt to approve the payment. The transaction reference is: ${paymentResponse.data?.transactionRef || 'N/A'}`,
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
          title: "Order Placed",
          description: response.message || "Your order has been placed successfully!",
        });
      }

      // Navigate to orders page
      setTimeout(() => {
        navigate("/buyer-orders");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create order:", error);
      const errorMessage = error?.message || error?.details?.message || "Failed to create order. Please try again.";
      setErrors({ submit: errorMessage });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Place New Order</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Order products from cooperative marketplace
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">
                    Select Product <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => handleChange("productId", value)}
                  >
                    <SelectTrigger id="productId">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-products" disabled>Loading products...</SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.unit} ({product.price.toLocaleString()} RWF)
                            {product.availableStock !== undefined && ` - Stock: ${product.availableStock}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {selectedProduct.availableStock || 0} {selectedProduct.unit}
                    </p>
                  )}
                  {errors.productId && (
                    <p className="text-sm text-red-600">{errors.productId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className={errors.quantity ? "border-red-600" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={errors.fullName ? "border-red-600" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+250 7XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-600" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Street Address <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter street address..."
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={errors.address ? "border-red-600" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">
                      District <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="district"
                      placeholder="e.g., Kigali"
                      value={formData.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      className={errors.district ? "border-red-600" : ""}
                    />
                    {errors.district && (
                      <p className="text-sm text-red-600">{errors.district}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">
                      Sector <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="sector"
                      placeholder="e.g., Nyarugenge"
                      value={formData.sector}
                      onChange={(e) => handleChange("sector", e.target.value)}
                      className={errors.sector ? "border-red-600" : ""}
                    />
                    {errors.sector && (
                      <p className="text-sm text-red-600">{errors.sector}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    placeholder="Any special instructions for delivery..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b7eb34]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN_MOBILE_MONEY">MTN Mobile Money</SelectItem>
                    <SelectItem value="AIRTEL_MOBILE_MONEY">AIRTEL Mobile Money</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CASH_ON_DELIVERY">
                      Cash on Delivery
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  Choose your preferred payment method
                </p>
              </div>
            </div>

            {/* Order Summary */}
            {selectedProduct && formData.quantity && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">
                      {formData.quantity} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium text-gray-900">
                      {selectedProduct.price.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      {(selectedProduct.price * Number(formData.quantity)).toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium text-gray-900">5,000 RWF</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-[#b7eb34] text-lg">
                      {(
                        selectedProduct.price * Number(formData.quantity) +
                        5000
                      ).toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/buyer-orders")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBuyerOrder;