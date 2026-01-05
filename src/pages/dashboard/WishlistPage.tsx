import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  MapPin,
  Package,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import {
  getWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Product, WishlistItem } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist(1, 100);
      const items = response.data?.items || [];
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch (error: any) {
      console.error("Failed to load wishlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wishlist",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
      toast({
        title: "Removed",
        description: "Product removed from wishlist",
      });
      loadWishlist();
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
      });
    } finally {
      setRemovingId(null);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 pt-24">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/buyer-marketplace")}
            >
              Continue Shopping
            </Button>
          </div>

          {/* Wishlist Items */}
          {wishlistItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start adding products you love to your wishlist
                </p>
                <Button
                  onClick={() => navigate("/buyer-marketplace")}
                  className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                >
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item: any) => {
                const product = item.product || item;
                return (
                  <Card
                    key={item.id || product.id}
                    className="hover:shadow-lg transition-shadow group"
                  >
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div
                        className="relative aspect-square overflow-hidden rounded-t-lg cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <img
                          src={product.images?.[0] || "/placeholder-product.png"}
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
                            handleRemoveFromWishlist(product.id);
                          }}
                          disabled={removingId === product.id}
                        >
                          {removingId === product.id ? (
                            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                          ) : (
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          )}
                        </Button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3
                          className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 cursor-pointer hover:text-[#b7eb34]"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {product.cooperative?.name || product.cooperative || "Unknown"}
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

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-[#b7eb34]">
                            {formatCurrency(product.price)}/{product.unit}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.availableStock || product.availableStock === 0}
                            className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                          >
                            <ShoppingCart className="h-4 w-4" />
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
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;

