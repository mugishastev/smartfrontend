import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  ShoppingCart,
  Heart,
  Search,
  MapPin,
  Star,
  Package,
  Filter,
  X,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Shield,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Building,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Eye,
  Info,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAllProducts,
  getProductById,
  getProductCategories,
  checkWishlistStatus,
  addToWishlist,
  removeFromWishlist,
  getTrendingProducts,
} from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductReviews from "@/components/ProductReviews";
import ProductRecommendations from "@/components/ProductRecommendations";
import ImageLightbox from "@/components/ImageLightbox";
import ProductQuickView from "@/components/ProductQuickView";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useCompare } from "@/contexts/CompareContext";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Home } from "lucide-react";

const BuyerMarketplace = () => {
  const navigate = useNavigate();
  const { state: cartState, addItem } = useCart();
  const { toast } = useToast();
  const { viewedProducts } = useRecentlyViewed();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ images: string[]; index: number } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [spotlightProducts, setSpotlightProducts] = useState<Product[] | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("buyer_favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("buyer_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Get categories
        const categoriesResponse = await getProductCategories();
        const categoriesList = categoriesResponse.data?.categories || [];
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
        
        // Get all products with advanced filters
        const filters: any = {
          page: 1,
          limit: 100,
        };
        
        if (selectedCategory !== "all") filters.category = selectedCategory;
        if (selectedLocation !== "all") filters.location = selectedLocation;
        if (selectedQuality !== "all") filters.quality = selectedQuality;
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);
        if (inStockOnly) filters.inStock = true;
        if (searchQuery) filters.search = searchQuery;
        if (sortBy) filters.sortBy = sortBy;
        
        const response = await getAllProducts(filters);
        const productsList = response.data?.products ?? [];
        setProducts(Array.isArray(productsList) ? productsList : []);
        
        // Extract unique locations
        const uniqueLocations = Array.from(
          new Set(
            productsList
              .map((p: Product) => p.cooperative?.district || p.location)
              .filter(Boolean)
          )
        ) as string[];
        
        setLocations(uniqueLocations);
      } catch (error: any) {
        console.error("Failed to fetch products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast, selectedCategory, selectedLocation, selectedQuality, minPrice, maxPrice, inStockOnly, searchQuery, sortBy]);

  useEffect(() => {
    let active = true;
    const loadSpotlight = async () => {
      try {
        const response = await getTrendingProducts(4);
        if (active) {
          setSpotlightProducts((response.data as Product[]) ?? []);
        }
      } catch (error: any) {
        console.error("Failed to load spotlight products:", error);
      }
    };
    loadSpotlight();
    return () => {
      active = false;
    };
  }, []);

  // Filter and sort products (client-side filtering as fallback)
  useEffect(() => {
    let filtered = [...products];

    // Additional client-side filtering if needed
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.availableStock > 0);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, minPrice, maxPrice, inStockOnly]);

  // Calculate paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleViewProduct = async (product: Product) => {
    try {
      setLoadingDetails(true);
      // Fetch full product details
      const response = await getProductById(product.id);
      // Backend returns { product: {...} } or API normalizes to { data: {...} }
      const responseAny = response as any;
      const productData = response.data ?? responseAny.product ?? product;
      setSelectedProduct(productData);
      setShowProductDialog(true);
      setQuantity(1);
    } catch (error: any) {
      console.error("Error loading product details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load product details",
      });
      // Fallback to the product from the list
      setSelectedProduct(product);
      setShowProductDialog(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
    if (!product.availableStock || product.availableStock < qty) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "Not enough stock available",
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name ?? "Unknown Product",
      price: product.price ?? 0,
      quantity: qty,
      unit: product.unit ?? "unit",
      image: product.images?.[0],
      cooperative: product.cooperative?.name ?? "Unknown",
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} (${qty} ${product.unit}) added to cart`,
    });

    setShowProductDialog(false);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const getQualityBadge = (quality?: string) => {
    if (!quality) return null;
    const colors: { [key: string]: string } = {
      Premium: "bg-purple-100 text-purple-700",
      "Grade A": "bg-green-100 text-green-700",
      "Grade B": "bg-blue-100 text-blue-700",
      Standard: "bg-gray-100 text-gray-700",
    };
    return (
      <Badge className={colors[quality] || "bg-gray-100 text-gray-700"}>
        {quality}
      </Badge>
    );
  };

  const MarketplaceProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col w-full">
      <CardContent className="p-3 flex flex-col h-full w-full">
        {/* Product Image */}
        <div className="relative w-full h-56 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden border border-gray-200 dark:border-gray-700">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={`${product.name} - ${product.cooperative?.name || "Product"}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage({ images: product.images || [], index: 0 });
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Favorite and Compare Buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              aria-label={
                isFavorite(product.id)
                  ? `Remove ${product.name} from favorites`
                  : `Add ${product.name} to favorites`
              }
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite(product.id)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 dark:text-white"
                }`}
              />
            </Button>
            {canAddMore && (
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInCompare(product.id)) {
                    removeFromCompare(product.id);
                    toast({
                      title: "Removed from Compare",
                      description: `${product.name} removed from comparison`,
                    });
                  } else {
                    addToCompare(product);
                    toast({
                      title: "Added to Compare",
                      description: `${product.name} added to comparison`,
                    });
                  }
                }}
                aria-label={
                  isInCompare(product.id)
                    ? `Remove ${product.name} from compare`
                    : `Add ${product.name} to compare`
                }
              >
                <svg
                  className={`h-4 w-4 ${
                    isInCompare(product.id) ? "fill-blue-500 text-blue-500" : "text-gray-400 dark:text-white"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </Button>
            )}
          </div>

          {/* Stock Badge */}
          {product.availableStock && product.availableStock > 0 ? (
            <Badge className="absolute bottom-2 left-2 bg-green-500">In Stock</Badge>
          ) : (
            <Badge variant="destructive" className="absolute bottom-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-xs leading-tight mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.averageRating.toFixed(1)}</span>
              {product.reviewCount && product.reviewCount > 0 && (
                <span className="text-xs text-gray-600 dark:text-gray-400">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Price - Prominent */}
          <div className="mb-1">
            <p className="text-lg font-bold text-[#b7eb34]">{formatCurrency(product.price ?? 0)}</p>
            <p className="text-[10px] text-gray-500 dark:text-white">per {product.unit}</p>
          </div>

          {/* Location - Minimal */}
          <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-white opacity-75">
            <MapPin className="h-2.5 w-2.5" />
            <span className="line-clamp-1">
              {product.cooperative?.district || product.location || "N/A"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="bg-[#f3f6f0] dark:bg-gray-900/70 border border-border"
              aria-label={`Quick view ${product.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
                setShowQuickView(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-[#f3f6f0] dark:bg-gray-900/70 border border-border"
              aria-label={`Product details for ${product.name}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="border border-[#b7eb34] bg-[#e7f5d0] text-[#0f4c14]"
            onClick={() => handleAddToCart(product, 1)}
            disabled={!product.availableStock || product.availableStock === 0}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 pt-24">
      <div className="container mx-auto max-w-7xl">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Marketplace</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Marketplace</h1>
          <p className="text-gray-600 dark:text-white">
            Browse and order quality products from trusted cooperatives
          </p>
        </div>
        {cartState.totalItems > 0 && (
          <Button
            onClick={() => navigate("/buyer-cart")}
            className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart ({cartState.totalItems})
          </Button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white" />
                <Input
                  placeholder="Search products, cooperatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm"
            >
              {showAdvancedFilters ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Advanced Filters
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Advanced Filters
                </>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Price Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range (RWF)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Quality Filter */}
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* In Stock Only */}
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked === true)}
                />
                <Label
                  htmlFor="in-stock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  In Stock Only
                </Label>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(selectedCategory !== "all" ||
            selectedLocation !== "all" ||
            selectedQuality !== "all" ||
            searchQuery ||
            minPrice ||
            maxPrice ||
            inStockOnly) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedCategory("all")}
                  />
                </Badge>
              )}
              {selectedLocation !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Location: {selectedLocation}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedLocation("all")}
                  />
                </Badge>
              )}
              {selectedQuality !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Quality: {selectedQuality}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedQuality("all")}
                  />
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="gap-1">
                  Price: {minPrice || '0'} - {maxPrice || '∞'} RWF
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                  />
                </Badge>
              )}
              {inStockOnly && (
                <Badge variant="secondary" className="gap-1">
                  In Stock Only
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setInStockOnly(false)}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                  setSelectedQuality("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setInStockOnly(false);
                }}
                className="text-sm"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-white">
        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
      </div>

      {/* Main layout with sidebars and first row of products */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)] gap-6">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div>
                <Label className="mb-2">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <Label className="mb-2">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Filter */}
              <div>
                <Label className="mb-2">Quality</Label>
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="mb-2">Price Range (RWF)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* In Stock Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sidebar-in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked === true)}
                />
                <Label htmlFor="sidebar-in-stock" className="cursor-pointer">
                  In Stock Only
                </Label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                  setSelectedQuality("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setInStockOnly(false);
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid (FIRST ROW) */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-white">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-white font-medium">No products found</p>
                  <p className="text-sm text-gray-500 dark:text-white mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">List All Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Browse every marketplace item. Filters remain available on the left.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                {paginatedProducts.slice(0, 3).map((product) => (
                  <MarketplaceProductCard product={product} key={product.id} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Spotlight & Recently Viewed Column */}
        <div className="hidden lg:flex lg:flex-col gap-4">
          <Card className="sticky top-24 space-y-2">
            <CardHeader>
              <CardTitle className="text-base">Marketplace Spotlight</CardTitle>
              <CardDescription>Trending cooperative picks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {spotlightProducts === null ? (
                <p className="text-sm text-muted-foreground">Loading trending items...</p>
              ) : spotlightProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trending items found</p>
              ) : (
                spotlightProducts.map((product) => (
                  <div key={product.id} className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        per {product.unit}
                      </p>
                      <p className="text-sm font-bold text-[#b7eb34]">
                        {formatCurrency(product.price ?? 0)}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => handleViewProduct(product)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="space-y-2">
            <CardHeader>
              <CardTitle className="text-base">Recently Viewed</CardTitle>
              <CardDescription>Products you looked at recently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {viewedProducts && viewedProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {viewedProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="border border-border/60 rounded-lg p-2 flex flex-col gap-2 bg-white/70 dark:bg-gray-900"
                    >
                      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs font-medium line-clamp-2 text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-[#a3cf2d] font-semibold">
                        {formatCurrency(product.price ?? 0)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-[#0f4c14] border border-[#8ccc15]/60"
                        onClick={() => handleViewProduct(product)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You have not viewed any products yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Subsequent products in a 5-column layout */}
      {paginatedProducts.length > 3 && (
        <div className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {paginatedProducts.slice(3).map((product) => (
                    <MarketplaceProductCard product={product} key={product.id} />
                ))}
            </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 3 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Product Details Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
            </div>
          ) : selectedProduct ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name || "Product"}</DialogTitle>
                <DialogDescription>
                  {selectedProduct.cooperative?.name || "Unknown Cooperative"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-2">
                  <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <svg class="h-16 w-16 text-gray-400 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400 dark:text-white" />
                      </div>
                    )}
                  </div>
                  {selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.slice(1, 3).map((img, idx) => (
                        <div key={idx} className="w-full h-20 bg-gray-50 rounded border border-gray-200 overflow-hidden">
                          <img
                            src={img}
                            alt={`${selectedProduct.name} ${idx + 2}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {/* Product ID & Category */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white">
                    <span>ID: {selectedProduct.id ? selectedProduct.id.slice(-8).toUpperCase() : "N/A"}</span>
                    {selectedProduct.category && (
                      <>
                        <span>•</span>
                        <Badge variant="outline">{selectedProduct.category}</Badge>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-3xl font-bold text-[#b7eb34] mb-2">
                      {formatCurrency(selectedProduct.price ?? 0)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white mb-2">
                      per {selectedProduct.unit}
                    </p>
                    {(() => {
                      const productAny = selectedProduct as any;
                      const rating = productAny.rating;
                      const reviews = productAny.reviews;
                      return rating ? (
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {Number(rating).toFixed(1)}
                          </span>
                          {reviews && (
                            <span className="text-sm text-gray-500 dark:text-white">
                              ({reviews} reviews)
                            </span>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Quality & Location */}
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.quality && getQualityBadge(selectedProduct.quality)}
                    {selectedProduct.location && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedProduct.location}
                      </Badge>
                    )}
                    {selectedProduct.cooperative?.district && !selectedProduct.location && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedProduct.cooperative.district}
                      </Badge>
                    )}
                  </div>

                  {/* Stock Status */}
                  {selectedProduct.availableStock !== undefined && selectedProduct.availableStock > 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        {selectedProduct.availableStock} {selectedProduct.unit} available in stock
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="h-5 w-5" />
                      <span>Out of stock</span>
                    </div>
                  )}

                  {/* Product Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-white">Status:</span>
                    <Badge className={selectedProduct.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white"}>
                      {selectedProduct.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Product Description</h4>
                      <p className="text-sm text-gray-600 dark:text-white whitespace-pre-wrap">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Product Details Grid */}
                  <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-white mb-1">Category</p>
                      <p className="font-medium">{selectedProduct.category || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-white mb-1">Unit</p>
                      <p className="font-medium">{selectedProduct.unit || "N/A"}</p>
                    </div>
                    {selectedProduct.quality && (
                      <div>
                        <p className="text-gray-500 dark:text-white mb-1">Quality</p>
                        <p className="font-medium">{selectedProduct.quality}</p>
                      </div>
                    )}
                    {selectedProduct.location && (
                      <div>
                        <p className="text-gray-500 dark:text-white mb-1">Location</p>
                        <p className="font-medium">{selectedProduct.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Cooperative Info */}
                  {selectedProduct.cooperative && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Cooperative Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedProduct.cooperative.name}
                          </p>
                        </div>
                        {selectedProduct.cooperative.district && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-white">
                            <MapPin className="h-3 w-3" />
                            <span>{selectedProduct.cooperative.district}</span>
                          </div>
                        )}
                        {selectedProduct.cooperative.email && (
                          <div className="text-gray-600 dark:text-white">
                            <span className="font-medium">Email:</span> {selectedProduct.cooperative.email}
                          </div>
                        )}
                        {selectedProduct.cooperative.phone && (
                          <div className="text-gray-600 dark:text-white">
                            <span className="font-medium">Phone:</span> {selectedProduct.cooperative.phone}
                          </div>
                        )}
                        {selectedProduct.cooperative.address && (
                          <div className="text-gray-600 dark:text-white">
                            <span className="font-medium">Address:</span> {selectedProduct.cooperative.address}
                          </div>
                        )}
                        {selectedProduct.cooperative.logo && (
                          <div className="mt-2">
                            <img
                              src={selectedProduct.cooperative.logo}
                              alt={selectedProduct.cooperative.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Product Dates */}
                  <div className="border-t pt-4 text-xs text-gray-500 dark:text-white">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Listed: {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {selectedProduct.updatedAt && selectedProduct.updatedAt !== selectedProduct.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Updated: {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity & Add to Cart */}
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuantity(
                              Math.min(
                                quantity + 1,
                                selectedProduct.availableStock ?? 1
                              )
                            )
                          }
                          disabled={
                            !selectedProduct.availableStock ||
                            quantity >= selectedProduct.availableStock
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                      onClick={() => handleAddToCart(selectedProduct, quantity)}
                      disabled={
                        !selectedProduct.availableStock ||
                        selectedProduct.availableStock === 0
                      }
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart ({formatCurrency((selectedProduct.price ?? 0) * quantity)})
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              {selectedProduct && (
                <div className="mt-6 border-t pt-6">
                  <ProductReviews
                    productId={selectedProduct.id}
                    product={selectedProduct}
                    onReviewAdded={() => {
                      // Reload product details to get updated rating
                      if (selectedProduct) {
                        handleViewProduct(selectedProduct);
                      }
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-white">
              <p>No product details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recently Viewed */}
      {viewedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {viewedProducts.slice(0, 4).map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300 flex flex-col w-full cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <CardContent className="p-3 flex flex-col h-full w-full">
                  <div className="relative w-full h-56 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden border border-gray-200 dark:border-gray-700">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm mb-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-[#b7eb34] mb-2">
                    {formatCurrency(product.price ?? 0)}
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}
                  >
                    View Product
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Product Recommendations */}
      {filteredProducts.length > 0 && (
        <div className="mt-12">
          <ProductRecommendations
            type="trending"
            title="Trending Products"
            limit={8}
          />
        </div>
      )}
    </div>
  </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          images={lightboxImage.images}
          currentIndex={lightboxImage.index}
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          onNext={() => setLightboxImage(prev => prev ? {
            ...prev,
            index: (prev.index + 1) % prev.images.length
          } : null)}
          onPrevious={() => setLightboxImage(prev => prev ? {
            ...prev,
            index: (prev.index - 1 + prev.images.length) % prev.images.length
          } : null)}
        />
      )}

      {/* Quick View */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false);
          setQuickViewProduct(null);
        }}
      />

      <Footer />
    </div>
  );
};

export default BuyerMarketplace;