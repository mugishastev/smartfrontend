import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package, Filter, Eye } from "lucide-react";
import { listProducts, getProfile } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MemberProducts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Get user profile to get cooperativeId
      const profileRes = await getProfile();
      const cooperativeId = profileRes.data?.cooperativeId;
      
      if (!cooperativeId) {
        throw new Error('You must be part of a cooperative to view products');
      }
      
      // Members can only view products from their cooperative
      // The backend automatically filters by cooperativeId for members, but we pass it explicitly
      const res = await listProducts(cooperativeId);
      const productsList = res.data?.products ?? res.data ?? [];
      setProducts(Array.isArray(productsList) ? productsList : []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set((Array.isArray(productsList) ? productsList : []).map((p: Product) => p.category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, categoryFilter, searchQuery]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cooperative Products</h1>
        <p className="text-gray-600">
          View all products available from your cooperative
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery || categoryFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "No products have been listed yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(product.price)} / {product.unit}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {product.availableStock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about the product
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Images</p>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product Name</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <Badge variant="secondary">{selectedProduct.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(selectedProduct.price)} / {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available Stock</p>
                  <p className="font-semibold text-gray-900">
                    {selectedProduct.availableStock} {selectedProduct.unit}
                  </p>
                </div>
                {selectedProduct.quality && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Quality</p>
                    <p className="font-semibold text-gray-900">{selectedProduct.quality}</p>
                  </div>
                )}
                {selectedProduct.location && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{selectedProduct.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge
                    className={
                      selectedProduct.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedProduct.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                <p>
                  Created:{" "}
                  {selectedProduct.createdAt
                    ? new Date(selectedProduct.createdAt).toLocaleString()
                    : "N/A"}
                </p>
                {selectedProduct.updatedAt && (
                  <p>
                    Last Updated:{" "}
                    {new Date(selectedProduct.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberProducts;
