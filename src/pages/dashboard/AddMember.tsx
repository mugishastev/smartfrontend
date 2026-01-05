import { useState, useRef } from "react";
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
import { UserPlus, Upload, FileText, X } from "lucide-react";
import { getProfile, addMember, importMembers } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const AddMember = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "MEMBER",
    idNumber: "",
    village: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profile, setProfile] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await addMember({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'MEMBER' | 'SECRETARY' | 'ACCOUNTANT',
        idNumber: formData.idNumber,
        village: formData.village,
      });

      toast({
        title: "Member Added",
        description: response.message || `${formData.firstName} ${formData.lastName} has been added successfully!`,
        className: "bg-green-50 text-green-900 border-green-200"
      });

      // Navigate back to members list
      navigate("/coop-members");
    } catch (error: any) {
      console.error('Add member error:', error);
      const errorMessage = error?.message || 'Failed to add member. Please try again.';
      setErrors({ submit: errorMessage });
      toast({
        variant: "destructive",
        title: "Add Member Failed",
        description: errorMessage
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
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Mode Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <Button
              variant={uploadMode === 'single' ? 'default' : 'outline'}
              onClick={() => setUploadMode('single')}
              className={uploadMode === 'single' ? 'bg-[#b7eb34] hover:bg-[#b7eb34]' : ''}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Single Member
            </Button>
            <Button
              variant={uploadMode === 'bulk' ? 'default' : 'outline'}
              onClick={() => setUploadMode('bulk')}
              className={uploadMode === 'bulk' ? 'bg-[#b7eb34] hover:bg-[#b7eb34]' : ''}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload (Excel)
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {uploadMode === 'single'
              ? 'Add individual members one by one'
              : 'Upload multiple members at once using an Excel file'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              {uploadMode === 'single' ? (
                <UserPlus className="h-6 w-6 text-[#b7eb34]" />
              ) : (
                <Upload className="h-6 w-6 text-[#b7eb34]" />
              )}
            </div>
            <div>
              <CardTitle>
                {uploadMode === 'single' ? 'Add New Member' : 'Bulk Upload Members'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {uploadMode === 'single'
                  ? 'Register a new member to your cooperative'
                  : 'Upload multiple members using an Excel spreadsheet'
                }
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {uploadMode === 'single' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-600" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-600" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={errors.email ? "border-red-600" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+250 7XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-600" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">National ID / Passport</Label>
                  <Input
                    id="idNumber"
                    placeholder="ID number"
                    value={formData.idNumber}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Member Role <span className="text-red-600">*</span>
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Regular Member</SelectItem>
                      <SelectItem value="SECRETARY">Secretary</SelectItem>
                      <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="village">Village / Location</Label>
                <Input
                  id="village"
                  placeholder="Enter village name"
                  value={formData.village}
                  onChange={(e) => handleChange("village", e.target.value)}
                />
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/coop-members")}
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
                    Adding Member...
                  </>
                ) : (
                  <>
                    <UserPlus className="icon-flip-animate h-4 w-4 mr-2" />
                    Add Member
                  </>
                )}
              </Button>
            </div>
          </form>
          ) : (
            <div className="space-y-6">
              {/* Excel Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload Excel File
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#b7eb34] transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">
                        Drop your Excel file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports .xlsx and .xls files up to 10MB
                      </p>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setExcelFile(file);
                          }
                        }}
                        className="hidden"
                        id="excel-upload"
                      />
                      <Label htmlFor="excel-upload" className="cursor-pointer">
                        <Button variant="outline" className="mt-2">
                          Choose File
                        </Button>
                      </Label>
                    </div>
                  </div>

                  {excelFile && (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-[#b7eb34]" />
                        <div>
                          <p className="font-medium text-[#b7eb34]">{excelFile.name}</p>
                          <p className="text-sm text-[#b7eb34]">
                            {(excelFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExcelFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Excel Template Download */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">
                          Download Excel Template
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Use our template to ensure your data is formatted correctly for upload.
                        </p>
                        <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Required Columns Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>• First Name *</div>
                      <div>• Last Name *</div>
                      <div>• Email *</div>
                      <div>• Phone *</div>
                      <div>• ID Number</div>
                      <div>• Village</div>
                      <div>• Role (optional)</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Required fields. Missing members will be skipped during upload.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#b7eb34] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Upload Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/coop-members")}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                  disabled={loading || !excelFile}
                  onClick={async () => {
                    if (!excelFile) {
                      toast({
                        variant: "destructive",
                        title: "No File Selected",
                        description: "Please select a CSV file to upload",
                      });
                      return;
                    }

                    setLoading(true);
                    try {
                      const response = await importMembers(excelFile);
                      
                      toast({
                        title: "Upload Successful",
                        description: response.message || `Successfully imported members. ${response.data?.result?.success || 0} members added, ${response.data?.result?.failed || 0} failed.`,
                      });

                      // Reset form
                      setExcelFile(null);
                      setUploadProgress(0);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }

                      // Navigate back after a short delay
                      setTimeout(() => {
                        navigate(-1);
                      }, 2000);
                    } catch (error: any) {
                      console.error("Bulk upload error:", error);
                      toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: error?.message || "Failed to upload file. Please check the file format and try again.",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Uploading..." : "Upload Members"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMember;