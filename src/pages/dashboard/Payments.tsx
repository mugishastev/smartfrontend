import { Card, CardContent } from "@/components/ui/card";
import { 
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock
} from "lucide-react";

const Payments = () => {
  const transactions = [
    {
      id: 1,
      cooperative: "Terimbere Coffee Cooperative",
      amount: "1,250,000 RWF",
      type: "Subscription Fee",
      status: "Completed",
      date: "2024-11-05"
    },
    {
      id: 2,
      cooperative: "Imena Women Cooperative",
      amount: "850,000 RWF",
      type: "Product Sale",
      status: "Completed",
      date: "2024-11-04"
    },
    {
      id: 3,
      cooperative: "Umoja Dairy Cooperative",
      amount: "2,200,000 RWF",
      type: "Product Sale",
      status: "Pending",
      date: "2024-11-03"
    }
  ];

  const completedCount = transactions.filter(t => t.status === "Completed").length;
  const pendingCount = transactions.filter(t => t.status === "Pending").length;
  const totalAmount = "8.5M";

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-600">View and manage your payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-blue-600">{transactions.length}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-[#b7eb34]" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-[#b7eb34]">{completedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Processing</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-purple-600">{totalAmount}</p>
            <p className="text-xs text-gray-500 mt-1">RWF</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    transaction.status === "Completed" 
                      ? "bg-green-100" 
                      : "bg-yellow-100"
                  }`}>
                    <DollarSign className={`h-6 w-6 ${
                      transaction.status === "Completed" 
                        ? "text-[#b7eb34]" 
                        : "text-yellow-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{transaction.cooperative}</h3>
                    <p className="text-sm text-gray-600">{transaction.type}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{transaction.amount}</p>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                    transaction.status === "Completed" 
                      ? "bg-green-100 text-[#b7eb34]" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Payments;

