import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Upload, X, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { request } from "@/lib/api";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    unit: "KG",
    stock: "",
    location: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Product description is required";
    if (!formData.category.trim())
      newErrors.category = "Category is required";

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a valid number";
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock quantity is required";
    } else if (isNaN(Number(formData.stock))) {
      newErrors.stock = "Stock must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) {
          if (k === "stock") {
            form.append("availableStock", String(v));
          } else {
            form.append(k, String(v));
          }
        }
      });

      selectedImages.forEach((file) => form.append("images", file));

      await request("/products", {
        method: "POST",
        body: form,
      });

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      navigate("/coop-products");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Add New Product</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                List a new product on the cooperative marketplace
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h3>
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Arabica Coffee"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-red-600" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Provide detailed product description..."
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b7eb34] ${
                      errors.description ? "border-red-600" : "border-gray-300"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleChange("category", value)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AGRICULTURAL">Agricultural</SelectItem>
                      <SelectItem value="HANDCRAFT">Handcraft</SelectItem>
                      <SelectItem value="DAIRY">Dairy Products</SelectItem>
                      <SelectItem value="COFFEE">Coffee & Tea</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing & Stock
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (RWF) <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className={errors.price ? "border-red-600" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock">
                    Available Stock <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    className={errors.stock ? "border-red-600" : ""}
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-600">{errors.stock}</p>
                  )}
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleChange("unit", value)}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">Kilogram (KG)</SelectItem>
                      <SelectItem value="LITER">Liter (L)</SelectItem>
                      <SelectItem value="PIECE">Piece</SelectItem>
                      <SelectItem value="BOX">Box</SelectItem>
                      <SelectItem value="BAG">Bag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location & Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Details
              </h3>
              <div className="space-y-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Production Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Huye District"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedImages(files);
                      }}
                      className="hidden"
                      id="image-upload"
                    />

                    <label
                      htmlFor="image-upload"
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#b7eb34] cursor-pointer transition block"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB (max 5 images)
                      </p>
                    </label>

                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedImages((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/coop-products")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="icon-flip-hover bg-[#b7eb34] hover:bg-[#8ccc15] text-white transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Adding Product...
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
