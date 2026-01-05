import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Package,
  Plus,
  Minus,
  X,
  Eye,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(false);

  // Check wishlist status when product changes
  useEffect(() => {
    if (product && isOpen) {
      checkWishlist();
      setQuantity(1);
    }
  }, [product, isOpen]);

  const checkWishlist = async () => {
    if (!product) return;
    try {
      setCheckingWishlist(true);
      const response = await checkWishlistStatus(product.id);
      setIsInWishlist(response.data?.isInWishlist || false);
    } catch (error) {
      console.error("Failed to check wishlist:", error);
    } finally {
      setCheckingWishlist(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} removed from wishlist`,
        });
      } else {
        await addToWishlist(product.id);
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
    onClose();
  };

  const handleViewFullDetails = () => {
    if (product) {
      navigate(`/product/${product.id}`);
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Quick view of {product.name}. For more details, please visit the product page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-2">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={product.images?.[0] || "/placeholder-product.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {product.cooperative?.name || "Unknown Cooperative"}
              </p>

              {/* Rating */}
              {product.averageRating && product.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(product.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {product.averageRating.toFixed(1)}
                  </span>
                  {product.reviewCount && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-3">
                <p className="text-3xl font-bold text-[#b7eb34]">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  per {product.unit}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-3">
                {product.availableStock > 0 ? (
                  <Badge className="bg-green-100 text-green-700">
                    In Stock ({product.availableStock} {product.unit})
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
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
              <Button
                variant="outline"
                onClick={handleViewFullDetails}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;

