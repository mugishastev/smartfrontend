import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/contexts/CompareContext";
import { formatCurrency } from "@/lib/utils";
import { Star, X, ShoppingCart, Trash2, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";

const CompareProductsPage = () => {
  const navigate = useNavigate();
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
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

  if (compareProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 pt-24">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Products to Compare
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add products from the marketplace to compare them side by side.
              </p>
              <Button
                onClick={() => navigate("/buyer-marketplace")}
                className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
              >
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Get all unique attributes across products
  const allAttributes = new Set<string>();
  compareProducts.forEach((product) => {
    if (product.category) allAttributes.add("Category");
    if (product.quality) allAttributes.add("Quality");
    if (product.location) allAttributes.add("Location");
    if (product.description) allAttributes.add("Description");
    if (product.availableStock !== undefined) allAttributes.add("Stock");
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 pt-24">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Compare Products
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Compare {compareProducts.length} product{compareProducts.length > 1 ? "s" : ""} side by side
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearCompare}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full inline-block">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-700 p-4 text-left bg-gray-50 dark:bg-gray-800">
                      Features
                    </th>
                    {compareProducts.map((product) => (
                      <th
                        key={product.id}
                        className="border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 relative min-w-[250px]"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeFromCompare(product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="space-y-2">
                          <div className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.cooperative?.name || "Unknown Cooperative"}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                      Price
                    </td>
                    {compareProducts.map((product) => (
                      <td
                        key={product.id}
                        className="border border-gray-300 dark:border-gray-700 p-4"
                      >
                        <p className="text-xl font-bold text-[#b7eb34]">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          per {product.unit}
                        </p>
                      </td>
                    ))}
                  </tr>
                  {compareProducts.some((p) => p.averageRating && p.averageRating > 0) && (
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                        Rating
                      </td>
                      {compareProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border border-gray-300 dark:border-gray-700 p-4"
                        >
                          {product.averageRating && product.averageRating > 0 ? (
                            <div className="flex items-center gap-2">
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
                                  ({product.reviewCount})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No ratings</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                  {compareProducts.some((p) => p.category) && (
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                        Category
                      </td>
                      {compareProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border border-gray-300 dark:border-gray-700 p-4"
                        >
                          {product.category || "N/A"}
                        </td>
                      ))}
                    </tr>
                  )}
                  {compareProducts.some((p) => p.quality) && (
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                        Quality
                      </td>
                      {compareProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border border-gray-300 dark:border-gray-700 p-4"
                        >
                          {product.quality ? (
                            <Badge>{product.quality}</Badge>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                  {compareProducts.some((p) => p.location) && (
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                        Location
                      </td>
                      {compareProducts.map((product) => (
                        <td
                          key={product.id}
                          className="border border-gray-300 dark:border-gray-700 p-4"
                        >
                          {product.location || product.cooperative?.district || "N/A"}
                        </td>
                      ))}
                    </tr>
                  )}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                      Stock
                    </td>
                    {compareProducts.map((product) => (
                      <td
                        key={product.id}
                        className="border border-gray-300 dark:border-gray-700 p-4"
                      >
                        {product.availableStock > 0 ? (
                          <Badge className="bg-green-100 text-green-700">
                            In Stock ({product.availableStock} {product.unit})
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-4 font-medium bg-gray-50 dark:bg-gray-800">
                      Actions
                    </td>
                    {compareProducts.map((product) => (
                      <td
                        key={product.id}
                        className="border border-gray-300 dark:border-gray-700 p-4"
                      >
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="w-full bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.availableStock || product.availableStock === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompareProductsPage;

