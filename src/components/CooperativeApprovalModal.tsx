import { FileText, Mail, Phone, MapPin, Calendar, Eye, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ApprovalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cooperative: any;
    onApprove: () => void;
    approving: boolean;
}

export function CooperativeApprovalModal({
    open,
    onOpenChange,
    cooperative,
    onApprove,
    approving,
}: ApprovalModalProps) {
    if (!cooperative) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review & Approve Cooperative Registration</DialogTitle>
                    <DialogDescription>
                        Review all documents and details before approving. The cooperative admin account will be created automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* RCA CERTIFICATE - MOST PROMINENT */}
                    {cooperative.certificate && (
                        <div className="border-2 border-[#b7eb34] bg-[#b7eb34]/5 p-6 rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-6 w-6 text-[#b7eb34]" />
                                <h3 className="font-bold text-lg text-gray-900">RCA Registration Certificate</h3>
                                <span className="ml-auto bg-[#b7eb34] text-white px-3 py-1 rounded-full text-xs font-semibold">REQUIRED DOCUMENT</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {cooperative.certificate.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                        src={cooperative.certificate}
                                        alt="RCA Certificate"
                                        className="w-full h-auto max-h-96 object-contain rounded border"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={cooperative.certificate.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'hidden' : ''}>
                                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded">
                                        <FileText className="h-16 w-16 text-gray-400" />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <a
                                        href={cooperative.certificate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#b7eb34] hover:bg-[#a3d72f] text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Full Certificate
                                    </a>
                                    <a
                                        href={cooperative.certificate}
                                        download
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COOPERATIVE BASIC DETAILS */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-4 mb-4">
                            {cooperative.logo && (
                                <img
                                    src={cooperative.logo}
                                    alt={cooperative.name}
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-xl text-gray-900 mb-1">{cooperative.name}</h3>
                                <p className="text-sm text-gray-600">{cooperative.type}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium text-gray-700">RCA Number:</span>
                                    <p className="text-gray-900 font-mono">{cooperative.registrationNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <p className="text-gray-900">{cooperative.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium text-gray-700">Phone:</span>
                                    <p className="text-gray-900">{cooperative.phone}</p>
                                </div>
                            </div>
                            {cooperative.foundedDate && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                        <span className="font-medium text-gray-700">Founded:</span>
                                        <p className="text-gray-900">{new Date(cooperative.foundedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                                <div>
                                    <span className="font-medium text-gray-700">Location:</span>
                                    <p className="text-gray-900">
                                        {cooperative.village}, {cooperative.cell}, {cooperative.sector}, {cooperative.district}
                                    </p>
                                    {cooperative.address && (
                                        <p className="text-gray-600 text-xs mt-1">{cooperative.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {cooperative.description && (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{cooperative.description}</p>
                            </div>
                        )}
                    </div>

                    {/* ADDITIONAL DOCUMENTS */}
                    {cooperative.constitution && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Constitution Document</h4>
                                        <p className="text-xs text-gray-600">Cooperative constitution and bylaws</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={cooperative.constitution}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-sm font-medium transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </a>
                                    <a
                                        href={cooperative.constitution}
                                        download
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADMIN ACCOUNT INFO */}
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Admin Account Creation
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                            Upon approval, the following admin account will be created and credentials sent via email:
                        </p>
                        <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Email:</span>
                                <span className="text-gray-900 font-mono">{cooperative.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Password:</span>
                                <span className="text-gray-900 font-mono">Admin@{cooperative.registrationNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Name:</span>
                                <span className="text-gray-900">Admin {cooperative.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Role:</span>
                                <span className="text-gray-900">Cooperative Admin</span>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <Button
                            onClick={onApprove}
                            disabled={approving}
                            className="w-full sm:flex-1 min-h-[44px] bg-[#b7eb34] hover:bg-[#a3d72f] text-white text-sm sm:text-base font-semibold"
                        >
                            {approving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 mr-2 inline-block" />
                                    Approve & Create Admin Account
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={approving}
                            className="w-full sm:flex-1 min-h-[44px] text-sm sm:text-base"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
