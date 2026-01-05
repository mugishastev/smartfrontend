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
import { Bell, Upload, FileText, X } from "lucide-react";
import { createAnnouncement } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const AddAnnouncement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    isPublic: false,
    expiresAt: "",
  });
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await createAnnouncement({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        isPublic: formData.isPublic,
        expiresAt: formData.expiresAt || undefined,
        attachments: attachments || undefined,
      });

      toast({
        title: "Success",
        description: response.message || "Announcement created successfully",
      });

      // Navigate back after success
      navigate(-1);
    } catch (error: any) {
      console.error("Failed to create announcement:", error);
      const errorMessage = error?.message || error?.details?.message || "Failed to create announcement. Please try again.";
      setErrors({ submit: errorMessage });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
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
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Create New Announcement</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Share important updates with your cooperative members
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Announcement Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Announcement Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Monthly General Meeting"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={errors.title ? "border-red-600" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Content <span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="content"
                    placeholder="Write your announcement content here..."
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b7eb34] ${
                      errors.content ? "border-red-600" : "border-gray-300"
                    }`}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.content.length} / 5000 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Category & Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category & Settings
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Announcement Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="TRAINING">Training</SelectItem>
                      <SelectItem value="JOB">Job Opportunity</SelectItem>
                      <SelectItem value="TENDER">Tender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => handleChange("expiresAt", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => handleChange("isPublic", e.target.checked)}
                    className="w-4 h-4 text-[#b7eb34] rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Make this announcement public
                  </span>
                </label>
                <p className="text-sm text-gray-600 ml-7">
                  If checked, this will be visible to all buyers and non-members
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Attachments (Optional)
              </h3>
              <div className="space-y-2">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setAttachments(e.target.files)}
                  className="hidden"
                />
                <label
                  htmlFor="attachments"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#b7eb34] cursor-pointer transition block"
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, XLS up to 10MB (optional)
                  </p>
                </label>
                {attachments && attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(attachments).map((file, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const dt = new DataTransfer();
                            Array.from(attachments).forEach((f, i) => {
                              if (i !== index) dt.items.add(f);
                            });
                            setAttachments(dt.files.length > 0 ? dt.files : null);
                          }}
                          className="ml-2 text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Announcement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAnnouncement;