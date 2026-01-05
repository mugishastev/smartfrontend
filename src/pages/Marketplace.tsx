import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Heart,
  Star,
  Filter,
  Search,
  Minus,
  Plus,
  X,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { searchProducts } from "@/lib/api";

// Get API base URL (same logic as api.ts)
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
  }
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  return isProduction 
    ? 'https://smartcoophub.andasy.dev/api'
    : 'http://localhost:5001/api';
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

interface Product {
  id: string;
  name: string;
  cooperative: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  location: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

const Marketplace = () => {
  const navigate = useNavigate();

  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "MTN_MOBILE_MONEY",
  });

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch Products Data from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetchWithAuth(`${getApiBase()}/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const productsData = data.products || [];
        const formattedProducts: Product[] = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          cooperative: product.cooperative?.name || 'Unknown Cooperative',
          price: product.price,
          image: product.images?.[0] || '📦',
          category: product.category,
          stock: product.availableStock,
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          location: product.cooperative?.district || product.location || 'N/A',
          description: product.description,
        }));
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Show error message instead of fallback
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and Search Logic
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cooperative.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // Cart Functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(
      favorites.includes(productId)
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId]
    );
  };

  // Calculations
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 10000 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckoutChange = (field: string, value: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlaceOrder = () => {
    // Validate form
    if (
      !checkoutData.fullName ||
      !checkoutData.email ||
      !checkoutData.phone ||
      !checkoutData.address
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Simulate payment processing
    setCheckoutStep(3);
    setTimeout(() => {
      setOrderPlaced(true);
    }, 2000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const categories = [
    { value: "all", label: "All Products" },
    { value: "COFFEE", label: "Coffee & Tea" },
    { value: "DAIRY", label: "Dairy Products" },
    { value: "AGRICULTURAL", label: "Agricultural" },
    { value: "HANDCRAFT", label: "Handcrafts" },
  ];

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto text-center border-2 border-green-200 bg-green-50">
            <CardContent className="pt-12 pb-12">
              <CheckCircle className="h-16 w-16 text-[#b7eb34] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your order. A confirmation email has been sent to {checkoutData.email}
              </p>
              <div className="bg-white p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Order ID:</span> #ORD-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Total Amount:</span> {(total / 1000000).toFixed(1)}M RWF
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Delivery Address:</span> {checkoutData.address}
                </p>
              </div>
              <Button
                onClick={() => {
                  setOrderPlaced(false);
                  setCart([]);
                  setShowCheckout(false);
                  setCheckoutStep(1);
                }}
                className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-3xl">
                            {item.image.startsWith('http') ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <span>{item.image}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.cooperative}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, Math.min(item.quantity + 1, item.stock))
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {((item.price * item.quantity) / 1000000).toFixed(1)}M RWF
                            </p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>{(subtotal / 1000000).toFixed(1)}M RWF</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee:</span>
                      <span>{(deliveryFee / 1000).toFixed(0)}K RWF</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total:</span>
                      <span>{(total / 1000000).toFixed(1)}M RWF</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCart(false)}
                      className="flex-1"
                    >
                      Continue Shopping
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                    >
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-6xl text-center">
                  {selectedProduct.image.startsWith('http') ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>{selectedProduct.image}</span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{selectedProduct.cooperative}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-900">{selectedProduct.rating}</span>
                      <span className="text-gray-600">({selectedProduct.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-[#b7eb34]">
                    {(selectedProduct.price / 1000000).toFixed(1)}M RWF
                  </div>

                  <p className="text-gray-600">{selectedProduct.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedProduct.location}</span>
                    </div>
                    <div className="text-gray-600">
                      Stock: <span className="font-semibold text-[#b7eb34]">{selectedProduct.stock} available</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        toggleFavorite(selectedProduct.id)
                      }
                      className="flex-1"
                    >
                      <Heart
                        className={`h-5 w-5 mr-2 ${
                          favorites.includes(selectedProduct.id)
                            ? "fill-red-600 text-red-600"
                            : ""
                        }`}
                      />
                      {favorites.includes(selectedProduct.id) ? "Saved" : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {checkoutStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={checkoutData.fullName}
                        onChange={(e) => handleCheckoutChange("fullName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={checkoutData.email}
                        onChange={(e) => handleCheckoutChange("email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+250 7XX XXX XXX"
                        value={checkoutData.phone}
                        onChange={(e) => handleCheckoutChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Kigali"
                        value={checkoutData.city}
                        onChange={(e) => handleCheckoutChange("city", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Input
                      id="address"
                      placeholder="Street address, apartment, etc."
                      value={checkoutData.address}
                      onChange={(e) => handleCheckoutChange("address", e.target.value)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-lg font-bold text-gray-900 mb-4">
                      Total: {(total / 1000000).toFixed(1)}M RWF
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowCheckout(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setCheckoutStep(2)}
                        className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={checkoutData.paymentMethod}
                      onValueChange={(value) => handleCheckoutChange("paymentMethod", value)}
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
                        {checkoutData.paymentMethod === "MTN_MOBILE_MONEY"
                          ? "MTN Mobile Money"
                          : checkoutData.paymentMethod === "AIRTEL_MOBILE_MONEY"
                          ? "AIRTEL Mobile Money"
                          : checkoutData.paymentMethod === "BANK_TRANSFER"
                          ? "Bank Transfer"
                          : checkoutData.paymentMethod === "CASH_ON_DELIVERY"
                          ? "Cash on Delivery"
                          : checkoutData.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-gray-900">Order Summary</h4>
                    <div className="text-sm space-y-1">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-gray-600"
                        >
                          <span>{item.name} x{item.quantity}</span>
                          <span>{((item.price * item.quantity) / 1000000).toFixed(1)}M</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total:</span>
                        <span>{(total / 1000000).toFixed(1)}M RWF</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Place Order
                    </Button>
                  </div>
                </div>
              )}

              {checkoutStep === 3 && (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing your payment...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Marketplace Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Cooperative Marketplace</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse and buy premium products directly from Rwandan cooperatives. Support local
            farmers and artisans while enjoying authentic, high-quality goods.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search products or cooperatives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowCart(true)}
              className="relative bg-[#b7eb34] hover:bg-[#b7eb34] text-white md:w-auto w-full"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 text-lg font-semibold">Failed to fetch products</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
                >
                  <CardContent className="p-0">
                    <div
                      onClick={() => setSelectedProduct(product)}
                      className="relative h-32 bg-gray-100 flex items-center justify-center text-5xl overflow-hidden group-hover:scale-110 transition-transform"
                    >
                      {product.image.startsWith('http') ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span>{product.image}</span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 z-10"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.includes(product.id)
                              ? "fill-red-600 text-red-600"
                              : "text-gray-400"
                          }`}
                        />
                      </button>

                      <div>
                        <h3
                          className="font-bold text-gray-900 line-clamp-2"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">{product.cooperative}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {product.rating}
                        </span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>

                      <div className="text-2xl font-bold text-[#b7eb34]">
                        {(product.price / 1000000).toFixed(1)}M RWF
                      </div>

                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.location}
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white disabled:bg-gray-300"
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
