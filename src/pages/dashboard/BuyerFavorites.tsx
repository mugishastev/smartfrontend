import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, X, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFavorites, getProductById, getAllProducts } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";

const BuyerFavorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        
        // Try to get favorites from API first
        try {
          const response = await getFavorites();
          const apiFavorites = response.data ?? [];
          
          if (Array.isArray(apiFavorites) && apiFavorites.length > 0) {
            // If API returns product objects, use them
            if (apiFavorites[0]?.id && apiFavorites[0]?.name) {
              setFavorites(apiFavorites);
              return;
            }
            // If API returns product IDs, fetch products
            const productPromises = apiFavorites.map((id: string) => 
              getProductById(id).catch(() => null)
            );
            const products = await Promise.all(productPromises);
            setFavorites(products.filter(Boolean).map((p: any) => p.data ?? p));
            return;
          }
        } catch (apiError) {
          console.log('API favorites not available, using localStorage');
        }

        // Fallback to localStorage (used by marketplace)
        const savedFavorites = localStorage.getItem('buyer_favorites');
        if (savedFavorites) {
          try {
            const favoriteIds = JSON.parse(savedFavorites);
            if (Array.isArray(favoriteIds) && favoriteIds.length > 0) {
              // Fetch products by IDs
              const productPromises = favoriteIds.map((id: string) => 
                getProductById(id).catch(() => null)
              );
              const products = await Promise.all(productPromises);
              const validProducts = products
                .filter(Boolean)
                .map((p: any) => p?.data ?? p)
                .filter((p: any) => p?.id);
              setFavorites(validProducts);
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse favorites from localStorage:', parseError);
          }
        }

        // If no favorites found, set empty array
        setFavorites([]);
      } catch (err: any) {
        setError(err.message || "Failed to load favorites");
        console.error('Load favorites error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      // Remove from state
      setFavorites(prev => prev.filter(p => p.id !== productId));

      // Remove from localStorage
      const savedFavorites = localStorage.getItem('buyer_favorites');
      if (savedFavorites) {
        try {
          const favoriteIds = JSON.parse(savedFavorites);
          const updated = favoriteIds.filter((id: string) => id !== productId);
          localStorage.setItem('buyer_favorites', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }

      toast({
        title: "Removed from favorites",
        description: "Product removed from your favorites",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from favorites",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.availableStock || product.availableStock === 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock",
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name ?? "Unknown Product",
      price: product.price ?? 0,
      quantity: 1,
      unit: product.unit ?? "unit",
      image: product.images?.[0],
      cooperative: product.cooperative?.name ?? "Unknown",
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    });
  };

  const inStockCount = favorites.filter(p => p.availableStock && p.availableStock > 0).length;
  const outOfStockCount = favorites.filter(p => !p.availableStock || p.availableStock === 0).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Favorites</h1>
        <p className="text-gray-600 dark:text-white">Manage your saved products and cooperatives</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-white mb-2">Total Favorites</p>
            <p className="text-3xl font-bold text-red-500">{favorites.length}</p>
            <p className="text-xs text-gray-500 dark:text-white mt-1">Saved items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-white mb-2">In Stock</p>
            <p className="text-3xl font-bold text-[#b7eb34]">{inStockCount}</p>
            <p className="text-xs text-gray-500 dark:text-white mt-1">Available now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-white mb-2">Out of Stock</p>
            <p className="text-3xl font-bold text-gray-600 dark:text-white">{outOfStockCount}</p>
            <p className="text-xs text-gray-500 dark:text-white mt-1">Not available</p>
          </CardContent>
        </Card>
      </div>

      {/* Favorites Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : favorites.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400 dark:text-white" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-red-500 border-red-500 hover:bg-red-50 flex-shrink-0"
                        onClick={() => handleRemoveFavorite(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-white mb-1">
                      <span className="font-medium">From:</span> {product.cooperative?.name || 'Unknown Cooperative'}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white mb-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {product.cooperative?.district || product.location || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {product.rating && (
                        <>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                          </div>
                          {product.reviews && (
                            <span className="text-xs text-gray-500 dark:text-white">({product.reviews} reviews)</span>
                          )}
                        </>
                      )}
                      {product.availableStock && product.availableStock > 0 ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300 ml-auto">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 ml-auto">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-[#b7eb34]">
                          {formatCurrency(product.price ?? 0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white">per {product.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() => navigate('/buyer-marketplace')}
                  >
                    View Details
                  </Button>
                  <Button
                    className="flex-1 bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.availableStock || product.availableStock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerFavorites;
