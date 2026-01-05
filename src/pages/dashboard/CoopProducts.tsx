// src/pages/CoopProducts.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Package, Edit, Trash2, Plus, Search, TrendingUp, Star, AlertTriangle } from "lucide-react";
import { User, Product } from "@/lib/types";
import { ProductTable } from "@/components/dashboard/ProductTable";
import { listProducts, getProductCategories, createProduct, updateProduct, deleteProduct, getProfile, getProductById } from "@/lib/api";

type ProductStats = {
  total: number;
  totalSold: number;
  revenue: number;
  avgRating: number;
  totalReviews: number;
};

type ProductFormData = {
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  availableStock: number;
  quality?: string;
  location?: string;
  images?: FileList;
};

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Unexpected error occurred";

export default function CoopProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    totalSold: 0,
    revenue: 0,
    avgRating: 0,
    totalReviews: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);

  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    unit: "KG",
    availableStock: 0,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profileRes = await getProfile();
        setUser(profileRes.data);
        setCooperativeId(profileRes.data.cooperativeId || null);
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Fallback to localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setCooperativeId(parsedUser.cooperativeId || null);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (cooperativeId) {
      loadProducts();
      loadCategories();
    }
  }, [cooperativeId, selectedCategory, searchQuery, page]);

  const loadProducts = async () => {
    if (!cooperativeId) return;

    try {
      setLoading(true);
      const response = await listProducts(cooperativeId, {
        page,
        limit: 10,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });

      setProducts(response.data?.products || []);
      setTotalPages(response.data?.pagination?.pages || 1);
      setStats({
        total: response.data?.pagination?.total || 0,
        totalSold: 0,
        revenue: 0,
        avgRating: 4.8,
        totalReviews: 24,
      });
    } catch (err) {
      console.error("Load products error:", err);
      toast({
        variant: "destructive",
        title: "Error loading products",
        description: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getProductCategories();
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error("Category load error:", err);
      setCategories([]); // Set empty array on error
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "images" && v !== undefined && v !== null) {
          form.append(k, String(v));
        }
      });
      if (formData.images)
        Array.from(formData.images).forEach((file) => form.append("images", file));

      if (dialogMode === "edit" && selectedProduct) {
        await updateProduct(selectedProduct.id, form);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct(form);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setShowDialog(false);
      setFormData({
        name: "",
        description: "",
        category: "",
        price: 0,
        unit: "KG",
        availableStock: 0,
      });
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(err),
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast({ 
        title: "Deleted", 
        description: "Product deleted successfully",
        className: "bg-green-50 text-green-900 border-green-200"
      });
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error deleting",
        description: getErrorMessage(err),
      });
    }
  };

  const handleViewProduct = async (product: Product) => {
    try {
      setLoadingDetails(true);
      setShowDetailsDialog(true);
      
      // Clear previous product details first
      setProductDetails(null);
      
      // Use the product data we already have first (the specific product clicked)
      const selectedProductData = { ...product };
      setProductDetails(selectedProductData);
      
      // Try to fetch full product details from API to get any additional info
      try {
        const res = await getProductById(product.id);
        console.log('Product API response:', res);
        
        // Backend returns { product }, API wraps it in { message, data: { product } }
        let apiProduct = (res.data as any)?.product || res.data;
        
        // Ensure we have a single product object, not an array
        if (Array.isArray(apiProduct)) {
          console.warn('API returned array, using first item');
          apiProduct = apiProduct[0];
        }
        
        // Only update if we got valid product data
        if (apiProduct && typeof apiProduct === 'object' && apiProduct.id) {
          setProductDetails(apiProduct);
        } else {
          console.warn('Invalid product data from API, using table data');
        }
      } catch (apiError) {
        // If API call fails, we already set the product from the table, so just log the error
        console.warn('Could not fetch additional product details from API:', apiError);
      }
    } catch (error: any) {
      console.error('Error loading product details:', error);
      // Fallback to the product data we already have
      setProductDetails(product);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load product details. Showing available information."
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <p className="text-gray-600">Manage your cooperative products</p>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => navigate('/coop-products/add')}
          className="icon-flip-hover bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
        >
          <Plus className="icon-flip-animate mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

        {/* Search + Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-3 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

      {/* Products */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Products Catalog ({products.length} {products.length === 1 ? 'product' : 'products'})
          </h3>
          
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <ProductTable
              products={products}
              onView={handleViewProduct}
              onEdit={(product) => {
                setDialogMode("edit");
                setFormData({
                  name: product.name,
                  description: product.description,
                  category: product.category,
                  price: product.price,
                  unit: product.unit,
                  availableStock: product.availableStock,
                  quality: product.quality,
                  location: product.location,
                });
                setSelectedProduct(product);
                setShowDialog(true);
              }}
              onDelete={(product) => {
                setSelectedProduct(product);
                setShowDeleteDialog(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (RWF)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                >
                  <option value="KG">KG</option>
                  <option value="LITRE">LITRE</option>
                  <option value="PIECE">PIECE</option>
                  <option value="BAG">BAG</option>
                </select>
              </div>
              <div>
                <Label htmlFor="availableStock">Available Stock</Label>
                <Input
                  id="availableStock"
                  type="number"
                  value={formData.availableStock}
                  onChange={(e) => setFormData({ ...formData, availableStock: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quality">Quality (Optional)</Label>
                <Input
                  id="quality"
                  value={formData.quality || ""}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="images">Images (Optional)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, images: e.target.files || undefined })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="icon-flip-hover bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
                {dialogMode === "edit" ? (
                  <>
                    <Edit className="icon-flip-animate h-4 w-4 mr-2" />
                    Update Product
                  </>
                ) : (
                  <>
                    <Plus className="icon-flip-animate h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about the product
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : productDetails ? (
            <div className="space-y-6">
              {/* Product Images */}
              {productDetails.images && productDetails.images.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productDetails.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${productDetails.name} - Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Product Name</p>
                    <p className="font-semibold text-gray-900">{productDetails.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Category</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {productDetails.category || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-semibold text-gray-900">
                      {productDetails.price ? `${productDetails.price.toLocaleString()} RWF` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Unit</p>
                    <p className="font-semibold text-gray-900">{productDetails.unit || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Available Stock</p>
                    <p className={`font-semibold ${productDetails.availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {productDetails.availableStock ?? 'N/A'} {productDetails.unit || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    {productDetails.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  {productDetails.quality && (
                    <div>
                      <p className="text-gray-500">Quality</p>
                      <p className="font-semibold text-gray-900">{productDetails.quality}</p>
                    </div>
                  )}
                  {productDetails.location && (
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{productDetails.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {productDetails.description && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{productDetails.description}</p>
                </div>
              )}

              {/* Additional Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {productDetails.cooperative && (
                  <div>
                    <p className="text-gray-500">Cooperative</p>
                    <p className="font-semibold text-gray-900">
                      {typeof productDetails.cooperative === 'object' 
                        ? productDetails.cooperative.name 
                        : productDetails.cooperative}
                    </p>
                  </div>
                )}
                {productDetails.createdAt && (
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(productDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {productDetails.updatedAt && (
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(productDetails.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No product details available</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDetailsDialog(false);
              setProductDetails(null);
              setLoadingDetails(false);
            }}>
              Close
            </Button>
            {productDetails && (
              <Button
                onClick={() => {
                  setShowDetailsDialog(false);
                  setDialogMode("edit");
                  setFormData({
                    name: productDetails.name || "",
                    description: productDetails.description || "",
                    category: productDetails.category || "",
                    price: productDetails.price || 0,
                    unit: productDetails.unit || "KG",
                    availableStock: productDetails.availableStock || 0,
                    quality: productDetails.quality,
                    location: productDetails.location,
                  });
                  setSelectedProduct(productDetails);
                  setShowDialog(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
