export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'RCA_REGULATOR' | 'COOP_ADMIN' | 'SECRETARY' | 'ACCOUNTANT' | 'MEMBER' | 'BUYER';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  cooperativeId?: string;
  cooperative?: {
    id: string;
    name: string;
    type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    logo?: string;
    description?: string;
    location?: string;
    website?: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    sector: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  // User Settings
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  language?: string;
  theme?: string;
  timeZone?: string;
  dateFormat?: string;
  currency?: string;
  notificationSettings?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
    types?: {
      systemAlerts?: boolean;
      newRegistrations?: boolean;
      cooperativeRequests?: boolean;
      financialEvents?: boolean;
      securityAlerts?: boolean;
    };
  };
};

export type Cooperative = {
  id: string;
  name: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  logo?: string;
  certificateUrl?: string;
  constitutionUrl?: string;
  description?: string;
  location?: string;
  website?: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  sector: string;
  membersCount: number;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
};

// Authentication Types
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterUserRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'BUYER' | 'COOP_ADMIN' | 'RCA_REGULATOR';
};

export type UpdateProfileData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  // User Preferences
  language?: string;
  theme?: string;
  timeZone?: string;
  dateFormat?: string;
  currency?: string;
  notificationSettings?: any;
};

// Cooperative Types
export type CooperativeRequest = {
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  type: string;
  description: string;
  logo?: File;
  certificate?: File;
  constitution?: File;
  foundedDate?: string;
};

export type UpdateCooperativeData = {
  name?: string;
  registrationNumber?: string;
  logo?: File;
  description?: string;
  type?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
};

// Dashboard Stats Types
export type DashboardStats = {
  totalCooperatives: number;
  cooperativesByStatus: { [key: string]: number };
  totalUsers: number;
  totalMembers: number;
  usersByRole: { [key: string]: number };
  totalProducts: number;
  totalOrders: number;
  totalTransactions: number;
  totalTransactionVolume: number;
  transactionVolume?: number;
  newUsers?: number;
  activeUsers?: number;
  userGrowth?: number;
  newCooperatives?: number;
  cooperativesByRegion: Array<{ region: string; count: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
};

export type CoopDashboardStats = {
  totalMembers: number;
  totalProducts: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingRequests: number;
};

export type MemberDashboardStats = {
  totalProducts: number;
  totalEarnings: number;
  activeListings: number;
  pendingPayments: number;
};

export type MemberFinancialSummary = {
  shares: number;
  savings: number;
  contributions: number;
  loans: number;
  dividends: number;
};

export type MemberDashboardData = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    joinedAt: string;
  };
  financialSummary: MemberFinancialSummary | null;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    createdAt: string;
    cooperative?: {
      name: string;
    };
  }>;
  pendingRequests: number;
  activeLoans: number;
  contributionHistory: Array<{
    amount: number;
    createdAt: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string;
  }>;
};

export type MemberRequest = {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
};

export type RegulatorDashboardStats = {
  totalCooperatives: number;
  pendingApprovals: number;
  activeCompliance: number;
  totalReports: number;
};

export type BuyerDashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  favorites: number;
  totalSpent: number;
  recentOrders: Order[];
};

export type AccountantDashboardStats = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  activeMembers: number;
  averageSavings: number;
  pendingDividends: number;
};

export type FinancialSummary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
};

export type SecretaryDashboardStats = {
  totalMembers: number;
  pendingApprovals: number;
  monthlyTransactions: number;
  complianceRate: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PendingApproval = {
  id: string;
  type: string;
  amount: number;
  requestedBy: string;
  createdAt: string;
  category: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export type Payment = {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  paymentMethod?: 'MTN_MOBILE_MONEY' | 'AIRTEL_MOBILE_MONEY' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
  reference?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

// Product & Order Types
export type Product = {
  id: string;
  cooperativeId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  availableStock: number;
  images: string[];
  quality?: string;
  location?: string;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  cooperative?: {
    id: string;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
    address?: string;
    district: string;
  };
  _count?: {
    reviews?: number;
  };
};

export type Order = {
  id: string;
  orderNumber: string;
  product?: Product;
  items?: Array<{
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  cooperative?: {
    id: string;
    name: string;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  buyerId: string;
  quantity?: number;
  totalAmount: number;
  deliveryAddress: string;
  shippingMethod?: string;
  shippingCost?: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDING';
  notes?: string;
  transactionRef?: string;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  buyerId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  verified: boolean;
  helpfulCount: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    images: string[];
  };
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  buyerId: string;
  productId: string;
  orderItemId?: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' | 'PROCESSING';
  refundAmount?: number;
  refundMethod?: string;
  refundRef?: string;
  images: string[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  product?: {
    id: string;
    name: string;
    images: string[];
    cooperative?: {
      id: string;
      name: string;
      district: string;
    };
  };
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    items?: Array<{
      id: string;
      product: Product;
      quantity: number;
    }>;
  };
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
};

export type ShippingOption = {
  method: string;
  cost: number;
  estimatedDays: number;
  description: string;
};

// Activity Types
export type RecentActivity = {
  id: string;
  type: 'MEMBER_JOINED' | 'ORDER_RECEIVED' | 'PAYMENT_RECEIVED';
  title: string;
  description: string;
  timestamp: string;
};

export type PendingReview = {
  id: string;
  cooperativeName: string;
  type: 'REGISTRATION' | 'COMPLIANCE' | 'REPORT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  submittedAt: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export type MemberContribution = {
  id: string;
  amount: number;
  type: 'MONTHLY' | 'SPECIAL' | 'PRODUCT_SALE';
  status: 'PAID' | 'PENDING' | 'FAILED';
  date: string;
  description: string;
};

// Activity Log Types
export type ActivityLog = {
  id: string;
  userId: string;
  cooperativeId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

// Transaction Types
export type Transaction = {
  id: string;
  cooperativeId: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE' | 'CONTRIBUTION' | 'DIVIDEND' | 'LOAN' | 'LOAN_REPAYMENT';
  amount: number;
  description: string;
  category?: string;
  reference?: string;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
};

export type TransactionSummary = {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingApprovals: number;
  recentTransactions: Transaction[];
};

export type CreateTransactionRequest = {
  type: 'INCOME' | 'EXPENSE' | 'CONTRIBUTION' | 'DIVIDEND' | 'LOAN' | 'LOAN_REPAYMENT';
  amount: number;
  description: string;
  category?: string;
  reference?: string;
  requiresApproval?: boolean;
};

// API Response Types
export type ApiResponse<T> = {
  message?: string;
  data: T;
};

// Payment Response Types
export type PaymentResponse = {
  message: string;
  transactionRef: string;
  orderId: string;
};

export type ApiError = {
  status: number;
  message: string;
  details?: any;
};

export type OTPType = 'REGISTRATION' | 'PASSWORD_RESET';

// Other Types
export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  category?: string;
};

export type ChatConversation = {
  id: string;
  buyerId?: string;
  cooperativeId?: string;
  subject?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  lastMessageAt?: string;
  messages?: ChatMessage[];
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export type CampaignProductBridge = {
  product: Product;
  priority: number;
};

export type Campaign = {
  id: string;
  name: string;
  description?: string;
  type: 'PROMO' | 'BUNDLE' | 'FLASH';
  status: 'LIVE' | 'DRAFT' | 'ENDED';
  bannerImage?: string;
  discountValue?: number;
  discountType?: 'FIXED' | 'PERCENTAGE';
  benefits?: string;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  products: Array<{
    id: string;
    priority: number;
    product: Product;
  }>;
};

export type LoyaltyTier = {
  id: string;
  name: string;
  badge?: string;
  minSpend: number;
  benefits?: string;
  priority: number;
};

export type UserLoyaltyStatus = {
  lifetimeSpend: number;
  points: number;
  tier: LoyaltyTier | null;
  nextTier?: {
    id: string;
    name: string;
    minSpend: number;
  };
};

export type AnalyticsSummary = {
  topProducts: Array<{
    product: Product | null;
    quantitySold: number;
    revenue: number;
  }>;
  conversion: {
    conversionRate: number;
    periodDays: number;
  };
  engagement: {
    messages: number;
    wishlistAdds: number;
    reviews: number;
    productViews: number;
  };
};

export type AnalyticsSnapshot = {
  id: string;
  metric: string;
  value: number;
  metadata?: any;
  capturedAt: string;
  createdAt: string;
};

export type Language = {
  id: string;
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  isDefault: boolean;
};

export type Currency = {
  id: string;
  code: string;
  symbol: string;
  name: string;
  rate: number;
};

export type LocalizationData = {
  languages: Language[];
  currencies: Currency[];
};

export type NotificationItem = {
  id: string;
  recipientId: string;
  type: 'CHAT_MESSAGE' | 'PROMOTION' | 'SYSTEM';
  title: string;
  description?: string;
  payload?: any;
  read: boolean;
  createdAt: string;
};

// Platform Configuration Types (Super Admin)
export type SystemSettings = {
  id: string;
  platformName: string;
  platformLogo?: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  apiKeys?: any;
  brandingConfig?: any;
  createdAt: string;
  updatedAt: string;
};

export type CooperativeConfig = {
  id: string;
  autoApprovalEnabled: boolean;
  requiredDocuments: string[];
  minMembers: number;
  maxMembers?: number;
  registrationFee: number;
  approvalWorkflow?: any;
  createdAt: string;
  updatedAt: string;
};

export type FinancialConfig = {
  id: string;
  platformFeePercent: number;
  commissionRate: number;
  minTransactionLimit: number;
  maxTransactionLimit?: number;
  payoutRules?: any;
  paymentMethods: string[];
  createdAt: string;
  updatedAt: string;
};
