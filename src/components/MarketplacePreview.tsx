import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, MapPin, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { listProducts } from "@/lib/api";

const MarketplacePreview = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch all products without cooperative filter for marketplace preview
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        // Only add auth header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Get API base URL
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
        const response = await fetch(`${getApiBase()}/products`, {
          headers,
        });

        if (!response.ok) {
          // If 401, try without auth (for public preview)
          if (response.status === 401 && !token) {
            console.warn('Products endpoint requires authentication');
            setFeaturedProducts([]);
            return;
          }
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();
        const products = data?.products || data?.data?.products || data?.data || [];

        // Take first 5 products as featured and format them properly
        const featured = products.slice(0, 5).map((product: any) => ({
          id: product.id,
          name: product.name,
          price: `RWF ${product.price?.toLocaleString() || 'N/A'}`,
          unit: product.unit,
          location: product.location || 'Rwanda',
          cooperative: product.cooperative?.name || 'Cooperative',
          image: product.images?.[0] || null, // Use real image URL
        }));

        setFeaturedProducts(featured);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section id="marketplace" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900 dark:text-white">
            Digital Marketplace
          </h2>
          <p className="text-lg text-gray-600 dark:text-white max-w-2xl mx-auto">
            Discover and purchase high-quality products directly from Rwandan cooperatives.
          </p>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-white text-sm">Loading featured products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-white text-sm">No data in database or server is not working</p>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <Card key={product.id} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  {/* Product Image - Professional Size */}
                  <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={`${product.name} from ${product.cooperative}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        📦
                      </div>
                    )}
                    {/* Stock Badge Overlay */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-500 text-white rounded-full shadow-md">
                        In Stock
                      </span>
                    </div>
                  </div>

                  {/* Product Details - Professional and Compact */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    
                    {/* Cooperative Name - Subtle */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                      {product.cooperative}
                    </p>
                    
                    {/* Price - Clear but Not Dominant */}
                    <div className="mb-2">
                      <p className="text-lg font-bold text-[#8ccc15]">{product.price}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">per {product.unit}</p>
                    </div>

                    {/* Location - Minimal */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mb-2.5">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="line-clamp-1">{product.location}</span>
                    </div>

                    {/* View Button - Compact */}
                    <Button
                    onClick={() => navigate('/marketplace')}
                      size="sm"
                      className="w-full bg-[#8ccc15] hover:bg-[#a3d72f] text-white text-xs h-8"
                      aria-label={`View ${product.name} in marketplace`}
                    >
                      View Product
                      <ArrowRight className="h-3 w-3 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/buyer-marketplace')}
            className="bg-[#8ccc15] hover:bg-[#8ccc15] text-white px-8 py-3 text-lg"
          >
            Explore Full Marketplace
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-600 dark:text-white mt-4">
            Browse verified cooperative products in one place.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;
