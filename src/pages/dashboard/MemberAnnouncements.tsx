import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Calendar, FileText, Search, Filter, Eye, ExternalLink } from "lucide-react";
import { getAnnouncements, getAnnouncementById, getProfile } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  isPublic: boolean;
  attachments: string[];
  createdAt: string;
  expiresAt?: string;
  cooperative?: {
    id: string;
    name: string;
    logo?: string;
  };
  _count?: {
    applications: number;
  };
};

const MemberAnnouncements = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    loadAnnouncements();
  }, [currentPage, typeFilter]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements({
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        page: currentPage,
        limit: 20,
      });
      const announcementsList = res.data?.announcements ?? [];
      setAnnouncements(Array.isArray(announcementsList) ? announcementsList : []);
      setPagination(res.data?.pagination ?? pagination);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load announcements",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredAnnouncements(announcements);
  }, [announcements]);

  const handleViewDetails = async (announcement: Announcement) => {
    try {
      setLoadingDetails(true);
      setIsDetailsDialogOpen(true);
      const res = await getAnnouncementById(announcement.id);
      setSelectedAnnouncement(res.data ?? announcement);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load announcement details",
      });
      setSelectedAnnouncement(announcement);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Meeting: "bg-blue-100 text-blue-700",
      Job: "bg-green-100 text-green-700",
      Event: "bg-purple-100 text-purple-700",
      Notice: "bg-yellow-100 text-yellow-700",
      General: "bg-gray-100 text-gray-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">
            View important announcements from your cooperative and public notices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <Select value={typeFilter} onValueChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Job">Job</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Notice">Notice</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {announcements.length} of {pagination.total} announcements
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No announcements found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {typeFilter !== "ALL"
                      ? "Try adjusting your filter criteria"
                      : "No announcements have been posted yet"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(announcement)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-purple-600" />
                    </div>
                    <Badge className={getTypeColor(announcement.type)}>
                      {announcement.type}
                    </Badge>
                  </div>
                  {isExpired(announcement.expiresAt) && (
                    <Badge variant="outline" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {announcement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {announcement.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{announcement.attachments.length} file(s)</span>
                    </div>
                  )}
                </div>
                {announcement.cooperative && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    {announcement.cooperative.logo && (
                      <img
                        src={announcement.cooperative.logo}
                        alt={announcement.cooperative.name}
                        className="h-6 w-6 rounded object-cover"
                      />
                    )}
                    <span className="text-xs text-gray-600">
                      {announcement.cooperative.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Announcement Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>
              Complete information about the announcement
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
            </div>
          ) : selectedAnnouncement ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAnnouncement.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(selectedAnnouncement.type)}>
                        {selectedAnnouncement.type}
                      </Badge>
                      {selectedAnnouncement.isPublic && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                      {isExpired(selectedAnnouncement.expiresAt) && (
                        <Badge variant="outline">Expired</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Content</p>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedAnnouncement.content}
                </div>
              </div>

              {/* Attachments */}
              {selectedAnnouncement.attachments &&
                selectedAnnouncement.attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Attachments</p>
                    <div className="space-y-2">
                      {selectedAnnouncement.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700 flex-1 truncate">
                            {attachment.split("/").pop() || `Attachment ${index + 1}`}
                          </span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Cooperative Info */}
              {selectedAnnouncement.cooperative && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedAnnouncement.cooperative.logo && (
                    <img
                      src={selectedAnnouncement.cooperative.logo}
                      alt={selectedAnnouncement.cooperative.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedAnnouncement.cooperative.name}
                    </p>
                    <p className="text-xs text-gray-500">Cooperative</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 pt-4 border-t space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Posted: {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedAnnouncement.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expires: {new Date(selectedAnnouncement.expiresAt).toLocaleString()}
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
    </div>
  );
};

export default MemberAnnouncements;
