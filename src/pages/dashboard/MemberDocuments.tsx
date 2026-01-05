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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  ExternalLink,
  File,
} from "lucide-react";
import { getReports, getReportById, getProfile } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Report = {
  id: string;
  title: string;
  type: string;
  period: string;
  fileUrl?: string;
  content?: any;
  generatedBy: string;
  createdAt: string;
  cooperative?: {
    id: string;
    name: string;
  };
};

const MemberDocuments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);

  useEffect(() => {
    loadCooperativeId();
  }, []);

  useEffect(() => {
    if (cooperativeId) {
      loadReports();
    }
  }, [cooperativeId, typeFilter]);

  const loadCooperativeId = async () => {
    try {
      const profileRes = await getProfile();
      setCooperativeId(profileRes.data?.cooperativeId || null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    }
  };

  const loadReports = async () => {
    if (!cooperativeId) return;
    
    try {
      setLoading(true);
      const res = await getReports(
        cooperativeId,
        typeFilter !== "ALL" ? typeFilter : undefined
      );
      const reportsList = res.data?.reports ?? [];
      setReports(Array.isArray(reportsList) ? reportsList : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load documents",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredReports(reports);
  }, [reports]);

  const handleViewDetails = async (report: Report) => {
    try {
      setLoadingDetails(true);
      setIsDetailsDialogOpen(true);
      const res = await getReportById(report.id);
      setSelectedReport(res.data ?? report);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load report details",
      });
      setSelectedReport(report);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownload = (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, "_blank");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file available for download",
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      FINANCIAL: "bg-green-100 text-green-700",
      MEMBER: "bg-blue-100 text-blue-700",
      COMPLIANCE: "bg-purple-100 text-purple-700",
      GENERAL: "bg-gray-100 text-gray-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cooperativeId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No Cooperative Found</p>
              <p className="text-sm text-gray-500 mt-2">
                You must be part of a cooperative to view documents
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents & Reports</h1>
          <p className="text-gray-600">
            Access and download cooperative reports and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="FINANCIAL">Financial</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="COMPLIANCE">Compliance</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredReports.length} document(s)
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 px-6">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No documents found</p>
              <p className="text-sm text-gray-500 mt-2">
                {typeFilter !== "ALL"
                  ? "Try adjusting your filter criteria"
                  : "No documents have been generated yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Period</TableHead>
                  <TableHead className="font-semibold">Generated</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <File className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.title}</p>
                          {report.fileUrl && (
                            <p className="text-xs text-gray-500">File available</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {report.period || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {report.fileUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(report)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Complete information about the document
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34]"></div>
            </div>
          ) : selectedReport ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedReport.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(selectedReport.type)}>
                        {selectedReport.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Period</p>
                  <p className="font-semibold text-gray-900">
                    {selectedReport.period || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Generated Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* File Download */}
              {selectedReport.fileUrl && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Download</p>
                  <a
                    href={selectedReport.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">
                      {selectedReport.fileUrl.split("/").pop() || "Download File"}
                    </span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                </div>
              )}

              {/* Content Preview */}
              {selectedReport.content && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Content Preview</p>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedReport.content, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Generated: {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>
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

export default MemberDocuments;
