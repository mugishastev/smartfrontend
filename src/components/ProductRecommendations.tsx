import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  getProductRecommendations,
  getTrendingProducts,
  getYouMightLike,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductRecommendationsProps {
  productId?: string;
  title?: string;
  type?: 'similar' | 'trending' | 'you-might-like';
  limit?: number;
}

const ProductRecommendations = ({
  productId,
  title,
  type = 'similar',
  limit = 8,
}: ProductRecommendationsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadRecommendations();
  }, [productId, type, limit]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let response;

      switch (type) {
        case 'trending':
          response = await getTrendingProducts(limit);
          break;
        case 'you-might-like':
          response = await getYouMightLike(limit);
          break;
        case 'similar':
        default:
          response = await getProductRecommendations(productId, limit);
          break;
      }

      const productsList = response.data || [];
      setProducts(Array.isArray(productsList) ? productsList : []);

      // Check wishlist status for all products
      if (productsList.length > 0) {
        const statuses: { [key: string]: boolean } = {};
        await Promise.all(
          productsList.map(async (p: Product) => {
            try {
              const checkResponse = await checkWishlistStatus(p.id);
              statuses[p.id] = checkResponse.data?.isInWishlist || false;
            } catch (error) {
              statuses[p.id] = false;
            }
          })
        );
        setWishlistStatus(statuses);
      }
    } catch (error: any) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.availableStock || product.availableStock < 1) {
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
      quantity: 1,
      unit: product.unit,
      image: product.images?.[0],
      cooperative: product.cooperative?.name || "Unknown",
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    });
  };

  const handleToggleWishlist = async (product: Product) => {
    const isInWishlist = wishlistStatus[product.id];

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        setWishlistStatus(prev => ({ ...prev, [product.id]: false }));
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} removed from wishlist`,
        });
      } else {
        await addToWishlist(product.id);
        setWishlistStatus(prev => ({ ...prev, [product.id]: true }));
        toast({
          title: "Added to Wishlist",
          description: `${product.name} added to wishlist`,
        });
      }
    } catch (error: any) {
      console.error('Failed to update wishlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update wishlist",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#b7eb34]" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const displayTitle = title || 
    (type === 'trending' ? 'Trending Products' :
     type === 'you-might-like' ? 'You Might Like' :
     'Similar Products');

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {displayTitle}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.images?.[0] || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {product.availableStock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      wishlistStatus[product.id]
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </Button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {product.cooperative?.name}
                </p>

                {/* Rating */}
                {product.averageRating && product.averageRating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {product.averageRating.toFixed(1)}
                    </span>
                    {product.reviewCount && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#b7eb34]">
                    {formatCurrency(product.price)}/{product.unit}
                  </span>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={!product.availableStock || product.availableStock === 0}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;

