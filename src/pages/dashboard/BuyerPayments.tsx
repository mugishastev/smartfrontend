import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, ShoppingCart, Package, CreditCard, Settings, LogOut, Heart, Download, CheckCircle, Clock, X, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { getBuyerPayments } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import type { Payment } from "@/lib/types";

const BuyerPayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await getBuyerPayments();
        setPayments(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load payments');
        toast({
          title: "Error",
          description: "Failed to load your payment history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const handleSignOut = () => {
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/buyer-dashboard" },
    { icon: ShoppingCart, label: "Marketplace", path: "/buyer-marketplace" },
    { icon: Package, label: "My Orders", path: "/buyer-orders", badge: "2" },
    { icon: Heart, label: "Favorites", path: "/buyer-favorites" },
    { icon: CreditCard, label: "Payments", path: "/buyer-payments", active: true },
  ];



  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment History</h1>
        <p className="text-gray-600 dark:text-white">View and manage your payment transactions</p>
      </div>

      <div className="p-0">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-white mb-2">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-600">{payments.length}</p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-6 w-6 text-[#b7eb34]" />
                </div>
                <p className="text-sm text-gray-600 dark:text-white mb-2">Completed</p>
                <p className="text-3xl font-bold text-[#b7eb34]">
                  {payments.filter(payment => payment.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">Successful</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-white mb-2">Processing</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {payments.filter(payment => payment.status === 'PROCESSING').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-white mb-2">Failed</p>
                <p className="text-3xl font-bold text-red-600">
                  {payments.filter(payment => payment.status === 'FAILED').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">Unsuccessful</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-white mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(payments.filter(p => p.status === 'COMPLETED').reduce((total, payment) => total + payment.amount, 0))}
                </p>
                <p className="text-xs text-gray-500 dark:text-white mt-1">Paid (RWF)</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Payment History</h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-white">Loading your payment history...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <X className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-white mb-4">You haven't made any payments yet.</p>
                  <Button
                    onClick={() => navigate('/buyer-marketplace')}
                    className="bg-[#b7eb34] hover:bg-[#a3d72f] text-white"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900 dark:text-white">Transaction ID</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Description</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Amount</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Payment Method</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Reference</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Date</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
                            case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
                            case 'FAILED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
                            case 'PENDING': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
                            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
                          }
                        };

                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'COMPLETED': return <CheckCircle className="h-3 w-3" />;
                            case 'PROCESSING': return <Clock className="h-3 w-3" />;
                            case 'FAILED': return <X className="h-3 w-3" />;
                            case 'PENDING': return <Clock className="h-3 w-3" />;
                            default: return <Clock className="h-3 w-3" />;
                          }
                        };

                        return (
                          <TableRow 
                            key={payment.id} 
                            className={`${
                              payment.status === 'FAILED' 
                                ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <TableCell className="font-mono text-sm text-gray-900 dark:text-white">
                              {payment.id.slice(-8).toUpperCase()}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white max-w-xs">
                              <div className="truncate" title={payment.description}>
                                {payment.description}
                              </div>
                            </TableCell>
                            <TableCell className={`font-semibold ${
                              payment.status === 'FAILED' 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-[#b7eb34]'
                            }`}>
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {payment.paymentMethod?.replace('_', ' ') || 'Mobile Money'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(payment.status)} border flex items-center gap-1 w-fit`}>
                                {getStatusIcon(payment.status)}
                                {payment.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-300">
                              {payment.reference || 'N/A'}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300 text-sm">
                              {new Date(payment.createdAt).toLocaleDateString()}
                              <br />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(payment.createdAt).toLocaleTimeString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {payment.status === 'COMPLETED' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-400"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Receipt
                                  </Button>
                                )}
                                {payment.status === 'FAILED' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-400"
                                    onClick={() => navigate(`/buyer-orders`)}
                                  >
                                    Retry
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/buyer-orders`)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default BuyerPayments;

