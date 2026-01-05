import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { getAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement } from "@/lib/api";
import { Bell, Eye, Edit, Trash2, FileText, Calendar, ExternalLink, Plus } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  isPublic: boolean;
  attachments: string[];
  postedBy: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementFormData = {
  title: string;
  content: string;
  type: string;
  isPublic: boolean;
  expiresAt?: string;
  attachments?: FileList;
};

const ANNOUNCEMENT_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "MEETING", label: "Meeting" },
  { value: "TRAINING", label: "Training" },
  { value: "JOB", label: "Job Opening" },
  { value: "TENDER", label: "Tender" },
];

const CoopAnnouncements = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    type: "GENERAL",
    isPublic: false,
  });

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          setUser(null);
        }
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAnnouncements();
    }
  }, [selectedType, user]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      // Only pass type filter if it's not "all"
      const response = await getAnnouncements({
        type: selectedType !== "all" ? selectedType : undefined,
        page: 1, // Always load first page after creation
        limit: 50, // Load more items to ensure new announcement is visible
      });

      // The API function normalizes to { message, data: { announcements, pagination } }
      const announcementsData = (response as any).data?.announcements || [];
      setAnnouncements(announcementsData);
    } catch (error: any) {
      console.error('Error loading announcements:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load announcements",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        isPublic: formData.isPublic,
        expiresAt: formData.expiresAt,
        attachments: formData.attachments,
      });

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setShowNewDialog(false);
      setFormData({
        title: "",
        content: "",
        type: "GENERAL",
        isPublic: false,
      });
      
      // Reset to "all" filter to show the new announcement
      // This will trigger useEffect which will reload announcements
      setSelectedType("all");
      
      // Also manually reload after a short delay to ensure backend has processed
      setTimeout(() => {
        loadAnnouncements();
      }, 300);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create announcement",
      });
    }
  };

  const handleViewAnnouncement = async (announcement: Announcement) => {
    try {
      setLoadingDetails(true);
      setShowViewDialog(true);
      const res = await getAnnouncementById(announcement.id);
      setViewingAnnouncement(res.data ?? announcement);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load announcement details",
      });
      setViewingAnnouncement(announcement);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isPublic: announcement.isPublic,
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : undefined,
    });
    setShowEditDialog(true);
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;

    try {
      await updateAnnouncement(selectedAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        isPublic: formData.isPublic,
        expiresAt: formData.expiresAt,
        attachments: formData.attachments,
      });

      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });

      setShowEditDialog(false);
      setSelectedAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        type: "GENERAL",
        isPublic: false,
      });
      
      loadAnnouncements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update announcement",
      });
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      setDeleting(true);
      await deleteAnnouncement(selectedAnnouncement.id);

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });

      setShowDeleteDialog(false);
      setSelectedAnnouncement(null);
      loadAnnouncements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete announcement",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteDialog(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
            <p className="text-gray-600">Send and manage announcements to members</p>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="icon-flip-hover bg-[#b7eb34] hover:bg-[#8ccc15] text-white transition-all duration-200">
                <Plus className="icon-flip-animate h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    {ANNOUNCEMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    rows={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attachments</label>
                  <Input
                    type="file"
                    multiple
                    onChange={e => setFormData(prev => ({ ...prev, attachments: e.target.files || undefined }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={e => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={checked => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <label className="text-sm font-medium">Make Public</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white">
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {ANNOUNCEMENT_TYPES.map(type => (
                    <TabsTrigger key={type.value} value={type.value}>
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No announcements found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedType !== "all"
                    ? "Try adjusting your filter criteria"
                    : "Create your first announcement to get started"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Attachments</TableHead>
                    <TableHead className="font-semibold">Posted Date</TableHead>
                    <TableHead className="font-semibold">Expires</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map(announcement => {
                    const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();
                    return (
                      <TableRow key={announcement.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-50 p-2 rounded-lg">
                              <Bell className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{announcement.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                {announcement.content}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            announcement.type === "MEETING" ? "bg-blue-100 text-blue-700" :
                            announcement.type === "TRAINING" ? "bg-green-100 text-green-700" :
                            announcement.type === "JOB" ? "bg-purple-100 text-purple-700" :
                            announcement.type === "TENDER" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {announcement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {announcement.isPublic && (
                              <Badge variant="secondary" className="text-xs">Public</Badge>
                            )}
                            {isExpired && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                                Expired
                              </Badge>
                            )}
                            {!isExpired && !announcement.expiresAt && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {announcement.attachments && announcement.attachments.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {announcement.attachments.length} file(s)
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No attachments</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {(() => {
                                try {
                                  if (!announcement.createdAt) return "N/A";
                                  const date = new Date(announcement.createdAt);
                                  if (isNaN(date.getTime())) return "Invalid date";
                                  return format(date, "MMM dd, yyyy");
                                } catch {
                                  return "Invalid date";
                                }
                              })()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {announcement.expiresAt ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className={isExpired ? "text-red-600" : ""}>
                                {(() => {
                                  try {
                                    const date = new Date(announcement.expiresAt);
                                    if (isNaN(date.getTime())) return "Invalid date";
                                    return format(date, "MMM dd, yyyy");
                                  } catch {
                                    return "Invalid date";
                                  }
                                })()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No expiration</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleViewAnnouncement(announcement)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleEditAnnouncement(announcement)}
                              title="Edit announcement"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(announcement)}
                              title="Delete announcement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Announcement Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                {ANNOUNCEMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Attachments</label>
              <Input
                type="file"
                multiple
                onChange={e => setFormData(prev => ({ ...prev, attachments: e.target.files || undefined }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={e => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isPublic}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <label className="text-sm font-medium">Make Public</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditDialog(false);
                setSelectedAnnouncement(null);
                setFormData({
                  title: "",
                  content: "",
                  type: "GENERAL",
                  isPublic: false,
                });
              }}>
                Cancel
              </Button>
              <Button type="submit" className="icon-flip-hover bg-[#b7eb34] hover:bg-[#8ccc15] text-white transition-all duration-200">
                <Edit className="icon-flip-animate h-4 w-4 mr-2" />
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Announcement Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
            </div>
          ) : viewingAnnouncement ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewingAnnouncement.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={
                        viewingAnnouncement.type === "MEETING" ? "bg-blue-100 text-blue-700" :
                        viewingAnnouncement.type === "TRAINING" ? "bg-green-100 text-green-700" :
                        viewingAnnouncement.type === "JOB" ? "bg-purple-100 text-purple-700" :
                        viewingAnnouncement.type === "TENDER" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {viewingAnnouncement.type}
                      </Badge>
                      {viewingAnnouncement.isPublic && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Content</p>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {viewingAnnouncement.content}
                </div>
              </div>

              {viewingAnnouncement.attachments && viewingAnnouncement.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Attachments</p>
                  <div className="space-y-2">
                    {viewingAnnouncement.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-700 flex-1 truncate">
                          {url.split("/").pop() || `Attachment ${index + 1}`}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 pt-4 border-t space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Posted: {(() => {
                      try {
                        if (!viewingAnnouncement.createdAt) return "N/A";
                        const date = new Date(viewingAnnouncement.createdAt);
                        if (isNaN(date.getTime())) return "Invalid date";
                        return format(date, "PPP 'at' p");
                      } catch {
                        return "Invalid date";
                      }
                    })()}
                  </span>
                </div>
                {viewingAnnouncement.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expires: {(() => {
                        try {
                          const date = new Date(viewingAnnouncement.expiresAt);
                          if (isNaN(date.getTime())) return "Invalid date";
                          return format(date, "PPP 'at' p");
                        } catch {
                          return "Invalid date";
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{selectedAnnouncement?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedAnnouncement(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAnnouncement}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoopAnnouncements;

