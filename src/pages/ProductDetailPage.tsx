import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Package,
  Loader2,
  ArrowLeft,
  Plus,
  Minus,
  Home,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import ImageLightbox from "@/components/ImageLightbox";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import {
  getProductById,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductReviews from "@/components/ProductReviews";
import ProductRecommendations from "@/components/ProductRecommendations";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { addViewedProduct } = useRecentlyViewed();
  const [product, setProduct] = useState<Product | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ images: string[]; index: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
      checkWishlist();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      addViewedProduct(product);
    }
  }, [product, addViewedProduct]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getProductById(id);
      const productData = response.data || (response as any).product;
      setProduct(productData);
    } catch (error: any) {
      console.error("Failed to load product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product details",
      });
      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!id) return;

    try {
      setCheckingWishlist(true);
      const response = await checkWishlistStatus(id);
      setIsInWishlist(response.data?.isInWishlist || false);
    } catch (error) {
      console.error("Failed to check wishlist:", error);
    } finally {
      setCheckingWishlist(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!id || !product) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} removed from wishlist`,
        });
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
        toast({
          title: "Added to Wishlist",
          description: `${product.name} added to wishlist`,
        });
      }
    } catch (error: any) {
      console.error("Failed to update wishlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update wishlist",
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!product.availableStock || product.availableStock < quantity) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock",
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit,
      image: product.images?.[0],
      cooperative: product.cooperative?.name || "Unknown",
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#b7eb34]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Product not found</p>
              <Button
                onClick={() => navigate("/marketplace")}
                className="mt-4 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
              >
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
                <BreadcrumbLink asChild>
                  <Link to="/marketplace">Marketplace</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/marketplace?category=${product.category}`}>
                        {product.category}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{product.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images - Carousel */}
            <ProductImageCarousel
              images={product.images || []}
              productName={product.name}
              onImageClick={(index) => setLightboxImage({ images: product.images || [], index })}
            />

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {product.cooperative?.name || "Unknown Cooperative"}
                </p>

                {/* Rating */}
                {product.averageRating && product.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(product.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                    {product.reviewCount && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ({product.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <p className="text-4xl font-bold text-[#b7eb34]">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">per {product.unit}</p>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  {product.availableStock > 0 ? (
                    <Badge className="bg-green-100 text-green-700">
                      In Stock ({product.availableStock} {product.unit})
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  {product.quality && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quality</p>
                      <p className="font-medium">{product.quality}</p>
                    </div>
                  )}
                  {product.location && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {product.location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <Label>Quantity:</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(
                          Math.min(product.availableStock || 1, quantity + 1)
                        )
                      }
                      disabled={quantity >= (product.availableStock || 0)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.availableStock || product.availableStock === 0}
                    className="flex-1 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleWishlist}
                    disabled={checkingWishlist}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isInWishlist ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-12">
            <ProductReviews
              productId={product.id}
              product={product}
              onReviewAdded={loadProduct}
            />
          </div>

          {/* Recommendations */}
          <ProductRecommendations
            productId={product.id}
            type="similar"
            title="Similar Products"
            limit={8}
          />
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

      <Footer />
    </div>
  );
};

export default ProductDetailPage;

