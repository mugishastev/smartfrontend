import {
  User,
  LoginRequest,
  RegisterUserRequest,
  UpdateProfileData,
  CooperativeRequest,
  UpdateCooperativeData,
  ApiResponse,
  ApiError,
  Product,
  Order,
  DashboardStats,
  CoopDashboardStats,
  MemberDashboardStats,
  MemberDashboardData,
  MemberRequest,
  RegulatorDashboardStats,
  PendingReview,
  MemberContribution,
  Cooperative,
  BuyerDashboardStats,
  AccountantDashboardStats,
  FinancialSummary,
  SecretaryDashboardStats,
  PendingApproval,
  Payment,
  Transaction,
  CreateTransactionRequest,
  ContactMessage,
  ContactPagination,
  ChatConversation,
  ChatMessage,
  Campaign,
  LoyaltyTier,
  UserLoyaltyStatus,
  AnalyticsSummary,
  AnalyticsSnapshot,
  LocalizationData,
  NotificationItem,
} from './types';

/**
 * Helpers
 */

// Provide a safe, predictable API_BASE. Accepts both "https://host" or "https://host/api"
function normalizeApiBase(raw?: string): string {
  const base = (raw || '').trim();
  // Default to production backend URL, fallback to localhost for development
  if (!base) {
    // Use production URL in production, localhost in development
    const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
    return isProduction
      ? 'http://localhost:5001/api'
      : 'http://localhost:5001/api';
  }
  // remove trailing slashes
  const trimmed = base.replace(/\/+$/, '');
  // if ends with /api already, return trimmed (keeps no trailing slash)
  if (/\/api$/i.test(trimmed)) return trimmed;
  // otherwise append /api
  return `${trimmed}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL as string | undefined);
const CACHE_TTL = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: ApiResponse<T> | null;
  expiry: number;
  promise: Promise<ApiResponse<T>> | null;
};

const categoryCache: CacheEntry<{ categories: string[] }> = {
  data: null,
  expiry: 0,
  promise: null,
};

const trendingCache: CacheEntry<any[]> & { limit: number } = {
  data: null,
  expiry: 0,
  promise: null,
  limit: 0,
};

const REQUEST_RETRIES = 3;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// Convert plain object to FormData (reuse)
function toFormData(obj: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof File) fd.append(k, v);
    else if (Array.isArray(v)) {
      v.forEach(val => fd.append(k, val instanceof File ? val : String(val)));
    } else fd.append(k, String(v));
  });
  return fd;
}

function buildCooperativeFormData(data: CooperativeRequest | UpdateCooperativeData): FormData {
  const fd = new FormData();

  // Required fields
  if ('name' in data && data.name) fd.append('name', data.name);
  if ('registrationNumber' in data && data.registrationNumber) fd.append('registrationNumber', data.registrationNumber);
  if ('email' in data && data.email) fd.append('email', data.email);
  if ('phone' in data && data.phone) fd.append('phone', data.phone);
  if ('address' in data && data.address) fd.append('address', data.address);
  if ('district' in data && data.district) fd.append('district', data.district);
  if ('sector' in data && data.sector) fd.append('sector', data.sector);
  if ('cell' in data && data.cell) fd.append('cell', data.cell);
  if ('village' in data && data.village) fd.append('village', data.village);
  if ('type' in data && data.type) fd.append('type', data.type);

  // Optional
  if ('description' in data && data.description) fd.append('description', data.description);
  if ('foundedDate' in data && data.foundedDate) fd.append('foundedDate', data.foundedDate);

  // Files
  if ('logo' in data && data.logo instanceof File) fd.append('logo', data.logo);
  if ('certificate' in data && data.certificate instanceof File) fd.append('certificate', data.certificate);
  if ('constitution' in data && data.constitution instanceof File) fd.append('constitution', data.constitution);

  return fd;
}

// Parse response safely: if JSON content-type parse JSON; otherwise return text or empty.
async function parseResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (res.status === 204) return { status: res.status, data: null, raw: null };
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return { status: res.status, data: json, raw: json };
  } else {
    const text = await res.text();
    return { status: res.status, data: text ? { message: text } : null, raw: text };
  }
}

export async function request<T = any>(
  path: string,
  options: RequestInit = {},
  retryCount: number = REQUEST_RETRIES
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = localStorage.getItem('token');

  // If body is FormData, do NOT set Content-Type header (browser will set multipart boundary)
  const bodyIsFormData = options.body instanceof FormData;
  const baseHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // do not set content-type here; set only when not FormData and when body exists
    ...(options.headers as Record<string, string> | undefined)
  };

  if (!bodyIsFormData && options.body && !(baseHeaders['Content-Type'])) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const finalOptions: RequestInit = {
    ...options,
    headers: baseHeaders,
    cache: 'no-store',
    credentials: 'include'
  };

  try {
    const res = await fetch(url, finalOptions);
    if (res.status === 429 && retryCount > 0) {
      const retryAfterHeader = res.headers.get('retry-after');
      const waitSeconds = Number(retryAfterHeader);
      const waitMs =
        !Number.isNaN(waitSeconds) && waitSeconds > 0
          ? waitSeconds * 1000
          : (REQUEST_RETRIES - retryCount + 1) * 500;
      await delay(waitMs);
      return request(path, options, retryCount - 1);
    }
    const parsed = await parseResponse(res);

    if (!res.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // prefer structured error fields if returned by backend
      const errPayload = parsed.data as any;
      const message = errPayload?.error ?? errPayload?.message ?? res.statusText;
      const apiErr: ApiError = {
        status: res.status,
        message,
        details: errPayload
      };
      throw apiErr;
    }

    // Normalized shape: { message?, data? }
    // Many backends return { data: ... } or the object directly; normalize callers should handle both.
    const payload = parsed.data as any;
    if (payload && ('data' in payload || 'message' in payload)) {
      return payload as ApiResponse<T>;
    }

    // otherwise wrap raw payload as data
    return {
      message: (payload && payload.message) || undefined,
      data: (payload && (payload.data ?? payload)) || (null as any)
    } as ApiResponse<T>;
  } catch (err: any) {
    // Handle network errors (connection refused, etc.)
    if (err instanceof TypeError && err.message.includes('fetch')) {
      const networkErr: ApiError = {
        status: 0,
        message: 'Cannot connect to server. Please ensure the backend server is running.',
        details: { originalError: err.message }
      };
      throw networkErr;
    }

    // Handle 401 Unauthorized - redirect to login
    if (err?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Re-throw ApiError unchanged
    if (err && err.status && err.message) throw err;
    throw { status: 500, message: err?.message ?? 'Network error', details: err } as ApiError;
  }
}

/* --- API functions (typed & normalized) --- */

// Auth
export async function login(data: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> {
  const response = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  const payload = response.data ?? (response as any);

  if (payload?.token) {
    localStorage.setItem('token', payload.token);
    if (payload.user) localStorage.setItem('user', JSON.stringify(payload.user));
  }

  return {
    message: response.message,
    data: payload
  };
}

export async function register(data: RegisterUserRequest): Promise<ApiResponse<{ userId: string }>> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function verifyEmail(email: string, code: string): Promise<ApiResponse<{ token: string; user: User }>> {
  return request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) });
}

export async function requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
  return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(data: { email: string; code: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
  return request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });
}

export async function resendOTP(email: string, type: 'REGISTRATION' | 'PASSWORD_RESET'): Promise<ApiResponse<{ message: string }>> {
  return request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email, type }) });
}

export async function getProfile(): Promise<ApiResponse<User>> {
  const response = await request<any>('/auth/profile');
  // Backend returns { user: {...} }, so extract user from response
  const payload = (response.data as any)?.user ?? response.data;
  return { message: response.message, data: payload as User };
}

export async function updateProfile(data: UpdateProfileData): Promise<ApiResponse<{ message: string; user: User }>> {
  return request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
  return request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) });
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/* Cooperative CRUD (FormData helper used) */
export async function registerCooperative(data: CooperativeRequest): Promise<ApiResponse<Cooperative>> {
  return request('/cooperatives/register', { method: 'POST', body: buildCooperativeFormData(data) });
}
export async function createCooperative(data: CooperativeRequest): Promise<ApiResponse<Cooperative>> {
  return request('/cooperatives', { method: 'POST', body: buildCooperativeFormData(data) });
}
export async function updateCooperative(data: UpdateCooperativeData): Promise<ApiResponse<Cooperative>> {
  return request('/cooperatives/profile', { method: 'PUT', body: buildCooperativeFormData(data) });
}

/* Dashboard */
export async function getCoopDashboard(cooperativeId: string): Promise<ApiResponse<{ cooperative: Cooperative; stats: CoopDashboardStats }>> {
  return request(`/cooperatives/${encodeURIComponent(cooperativeId)}/dashboard`);
}
export async function getMemberDashboard(memberId: string): Promise<ApiResponse<MemberDashboardData>> {
  const response = await request(`/members/${encodeURIComponent(memberId)}/dashboard`);
  return {
    message: response?.message,
    data: response?.data ?? response,
  } as ApiResponse<MemberDashboardData>;
}

export async function createRequest(data: {
  type: string;
  amount?: number;
  description: string;
}): Promise<ApiResponse<{ request: any }>> {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyRequests(status?: string, type?: string): Promise<ApiResponse<{ requests: MemberRequest[] }>> {
  const qp = new URLSearchParams();
  if (status) qp.append('status', status);
  if (type) qp.append('type', type);
  const q = qp.toString() ? `?${qp.toString()}` : '';
  const response = await request(`/requests/my${q}`);
  // Handle different response structures from backend
  const responseData = response?.data as any;
  return {
    message: response?.message,
    data: {
      requests: responseData?.requests ?? responseData ?? [],
    },
  } as ApiResponse<{ requests: MemberRequest[] }>;
}
export async function getRegulatorDashboard(): Promise<ApiResponse<{ stats: RegulatorDashboardStats }>> {
  return request('/regulator/dashboard');
}
export async function getBuyerStats(): Promise<ApiResponse<BuyerDashboardStats>> {
  const r = await request<BuyerDashboardStats>('/buyer/stats');
  return { message: r.message, data: r.data ?? (r as any) };
}

/* Members */
export async function getMemberContributions(memberId: string): Promise<ApiResponse<{ contributions: MemberContribution[] }>> {
  return request(`/members/${encodeURIComponent(memberId)}/contributions`);
}
export async function getMemberProfile(): Promise<ApiResponse<User>> {
  // Use /auth/profile endpoint which works for all authenticated users including members
  return getProfile();
}

/* Regulator */
export async function getPendingReviews(): Promise<ApiResponse<{ reviews: PendingReview[] }>> {
  return request('/regulator/pending-reviews');
}
export async function updateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED', comment?: string): Promise<ApiResponse<{ message: string }>> {
  return request(`/regulator/reviews/${encodeURIComponent(reviewId)}`, { method: 'PUT', body: JSON.stringify({ status, comment }) });
}
export async function getRegulatorProfile(): Promise<ApiResponse<User>> {
  return request('/regulator/profile');
}

/* Cooperative admin - typed lists */
export async function listMembers(cooperativeId: string): Promise<ApiResponse<{ members: User[] }>> {
  return request(`/members?cooperativeId=${encodeURIComponent(cooperativeId)}`);
}
export async function listProducts(cooperativeId: string, params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<ApiResponse<{ products: Product[]; pagination?: any }>> {
  const queryParams = new URLSearchParams();
  queryParams.append('cooperativeId', cooperativeId);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.category) queryParams.append('category', params.category);
  if (params?.search) queryParams.append('search', params.search);
  const r = await request(`/products?${queryParams.toString()}`);
  const payload = r.data ?? (r as any);
  return {
    message: r.message,
    data: {
      products: payload?.products ?? payload ?? [],
      pagination: payload?.pagination
    }
  } as ApiResponse<{ products: Product[]; pagination?: any }>;
}
export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  const response = await request(`/products/${encodeURIComponent(id)}`);
  // Backend returns { product: {...} } or { data: { product: {...} } }
  const responseData = response?.data as any;
  const product = responseData?.product ?? responseData ?? response;
  return {
    message: response?.message,
    data: product,
  } as ApiResponse<Product>;
}
export async function getProductCategories(): Promise<ApiResponse<{ categories: string[] }>> {
  const now = Date.now();
  if (categoryCache.data && now < categoryCache.expiry) {
    return categoryCache.data;
  }
  if (categoryCache.promise) {
    return categoryCache.promise;
  }

  const fetchPromise = request('/products/categories')
    .then((r) => {
      const payload = r.data ?? (r as any);
      const formatted: ApiResponse<{ categories: string[] }> = {
        message: r.message,
        data: { categories: payload?.categories ?? payload ?? [] },
      };
      categoryCache.data = formatted;
      categoryCache.expiry = Date.now() + CACHE_TTL;
      categoryCache.promise = null;
      return formatted;
    })
    .catch((error) => {
      categoryCache.promise = null;
      throw error;
    });

  categoryCache.promise = fetchPromise;
  return fetchPromise;
}
export async function createProduct(data: FormData): Promise<ApiResponse<{ message: string; product: Product }>> {
  return request('/products', { method: 'POST', body: data });
}
export async function updateProduct(id: string, data: FormData): Promise<ApiResponse<{ message: string; product: Product }>> {
  return request(`/products/${encodeURIComponent(id)}`, { method: 'PUT', body: data });
}
export async function deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
  return request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/* Invitations / imports */
export async function inviteMember(email: string, role: string): Promise<ApiResponse<any>> {
  try {
    return await request('/members/invite', { method: 'POST', body: JSON.stringify({ email, role }) });
  } catch (error: any) {
    // Ensure error details are properly formatted
    if (error?.details) {
      throw error;
    }
    throw {
      status: error?.status || 500,
      message: error?.message || 'Failed to invite member',
      details: error?.details || error?.error || error
    };
  }
}
export async function importMembers(file: File): Promise<ApiResponse<any>> {
  const fd = new FormData();
  fd.append('file', file);
  return request('/members/import', { method: 'POST', body: fd });
}
export async function getPendingInvitations(): Promise<ApiResponse<any>> {
  return request('/members/invitations');
}
export async function cancelInvitation(invitationId: string): Promise<ApiResponse<any>> {
  return request(`/members/invitations/${encodeURIComponent(invitationId)}`, { method: 'DELETE' });
}
export async function acceptInvitation(token: string, password: string, phone?: string): Promise<ApiResponse<any>> {
  return request('/members/accept-invitation', { method: 'POST', body: JSON.stringify({ token, password, phone }) });
}

/* Member management */
export async function addMember(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: 'MEMBER' | 'SECRETARY' | 'ACCOUNTANT';
  idNumber?: string;
  village?: string;
}): Promise<ApiResponse<{ message: string; member: User }>> {
  return request('/members', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateMember(id: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'MEMBER' | 'SECRETARY' | 'ACCOUNTANT';
  isActive?: boolean;
}): Promise<ApiResponse<{ message: string; member: User }>> {
  return request(`/members/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteMember(id: string): Promise<ApiResponse<{ message: string }>> {
  return request(`/members/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function getMemberById(id: string): Promise<ApiResponse<User>> {
  return request(`/members/${encodeURIComponent(id)}`);
}

/* Admin / Super admin */
export async function getSuperAdminStats(): Promise<ApiResponse<DashboardStats>> {
  return request('/admin/analytics');
}

export async function getRecentActivities(): Promise<ApiResponse<any[]>> {
  const r = await request('/admin/activities');
  const payload = r.data ?? (r as any);
  return {
    message: r.message,
    data: Array.isArray(payload) ? payload : (payload?.data ?? [])
  } as ApiResponse<any[]>;
}
export async function getSystemHealth(): Promise<ApiResponse<any>> {
  return request('/admin/system-health');
}
export async function updateCooperativeStatus(id: string, status: string, remarks?: string): Promise<ApiResponse<any>> {
  return request(`/admin/cooperatives/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, remarks })
  });
}
export async function listCooperatives(search?: string, status?: string): Promise<ApiResponse<{ cooperatives: Cooperative[]; pagination: any }>> {
  const qp = new URLSearchParams();
  if (search) qp.append('search', search);
  if (status) qp.append('status', status);
  const q = qp.toString() ? `?${qp.toString()}` : '';
  const r = await request(`/admin/cooperatives${q}`);

  // Backend returns: { message, cooperatives, pagination }
  // Check both possible response structures
  const rAny = r as any;
  const cooperatives = r.data?.cooperatives ?? rAny.cooperatives ?? [];
  const pagination = r.data?.pagination ?? rAny.pagination ?? {
    total: Array.isArray(cooperatives) ? cooperatives.length : 0,
    page: 1,
    limit: Array.isArray(cooperatives) ? cooperatives.length : 0,
    totalPages: 1
  };

  return {
    message: r.message || 'Cooperatives retrieved successfully',
    data: {
      cooperatives: Array.isArray(cooperatives) ? cooperatives : [],
      pagination
    }
  };
}

export async function getCooperativeDetails(id: string): Promise<ApiResponse<Cooperative>> {
  const r = await request(`/admin/cooperatives/${encodeURIComponent(id)}`);
  // Backend returns: { message, data: { cooperative } }
  const rAny = r as any;
  const cooperative = r.data?.cooperative ?? rAny.cooperative ?? null;
  return {
    message: r.message || 'Cooperative retrieved successfully',
    data: cooperative
  } as ApiResponse<Cooperative>;
}
export async function approveCooperative(id: string, adminData: { adminEmail: string; adminFirstName: string; adminLastName: string; adminPassword: string }): Promise<ApiResponse<any>> {
  if (!adminData || !adminData.adminEmail || !adminData.adminFirstName || !adminData.adminLastName || !adminData.adminPassword) {
    throw new Error('Admin details are required: adminEmail, adminFirstName, adminLastName, adminPassword');
  }
  return request(`/cooperatives/${encodeURIComponent(id)}/approve`, { method: 'POST', body: JSON.stringify(adminData) });
}
export async function rejectCooperative(id: string, reason: string = 'Criteria not met'): Promise<ApiResponse<void>> {
  return request(`/cooperatives/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}
export async function suspendCooperative(id: string, reason: string = 'Administrative action'): Promise<ApiResponse<void>> {
  return request(`/cooperatives/${encodeURIComponent(id)}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}
export async function unsuspendCooperative(id: string, reason: string = 'Action reversed'): Promise<ApiResponse<any>> {
  return request(`/cooperatives/${encodeURIComponent(id)}/unsuspend`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

/* Users */
export async function listAllUsers(search?: string, role?: string, page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
  const qp = new URLSearchParams();
  if (search) qp.append('search', search);
  if (role && role !== 'ALL') qp.append('role', role);
  qp.append('page', String(page));
  qp.append('limit', String(limit));
  const url = qp.toString() ? `/admin/users?${qp.toString()}` : '/admin/users';
  return request(url);
}
export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  return request(`/users/${encodeURIComponent(userId)}`);
}
export async function updateUserStatus(userId: string, action: 'activate' | 'deactivate' | 'delete'): Promise<ApiResponse<void>> {
  return request(`/users/${encodeURIComponent(userId)}/${action}`, { method: 'POST' });
}

/* Buyer */
export async function getBuyerOrders(limit?: number): Promise<ApiResponse<Order[]>> {
  const q = limit ? `?limit=${encodeURIComponent(String(limit))}` : '';
  const r = await request(`/buyer/orders${q}`);
  return { message: r.message, data: r.data ?? (r as any) } as ApiResponse<Order[]>;
}
export async function getFavorites(): Promise<ApiResponse<any[]>> { return request('/wishlist'); }
export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  const r = await request(`/products?search=${encodeURIComponent(query)}`);
  // normalize to products array
  const payload = r.data ?? (r as any);
  return { message: r.message, data: payload?.products ?? payload ?? [] } as ApiResponse<Product[]>;
}

export async function getAllProducts(filters?: {
  category?: string;
  search?: string;
  cooperativeId?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  quality?: string;
  location?: string;
  sortBy?: 'recent' | 'price-low' | 'price-high' | 'rating' | 'name';
  inStock?: boolean;
}): Promise<ApiResponse<{ products: Product[]; pagination?: any }>> {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.cooperativeId) queryParams.append('cooperativeId', filters.cooperativeId);
  if (filters?.page) queryParams.append('page', String(filters.page));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));
  if (filters?.minPrice) queryParams.append('minPrice', String(filters.minPrice));
  if (filters?.maxPrice) queryParams.append('maxPrice', String(filters.maxPrice));
  if (filters?.quality) queryParams.append('quality', filters.quality);
  if (filters?.location) queryParams.append('location', filters.location);
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.inStock !== undefined) queryParams.append('inStock', String(filters.inStock));
  const q = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const r = await request(`/products${q}`);
  const payload = r.data ?? (r as any);
  return {
    message: r.message,
    data: {
      products: payload?.products ?? payload ?? [],
      pagination: payload?.pagination,
    },
  } as ApiResponse<{ products: Product[]; pagination?: any }>;
}

export async function getChatConversations(): Promise<ApiResponse<ChatConversation[]>> {
  return request('/chat');
}

export async function createChatConversation(payload: { cooperativeId: string; orderId?: string; subject?: string }): Promise<ApiResponse<ChatConversation>> {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getChatMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
  return request(`/chat/${encodeURIComponent(conversationId)}/messages`);
}

export async function sendChatMessage(conversationId: string, payload: { receiverId: string; content: string; attachments?: string[] }): Promise<ApiResponse<ChatMessage>> {
  return request(`/chat/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getActiveCampaigns(): Promise<ApiResponse<Campaign[]>> {
  return request('/campaigns/active');
}

export async function getBundles(): Promise<ApiResponse<Campaign[]>> {
  return request('/campaigns/bundles');
}

export async function getLoyaltyTiers(): Promise<ApiResponse<LoyaltyTier[]>> {
  return request('/loyalty/tiers');
}

export async function getLoyaltyStatus(): Promise<ApiResponse<UserLoyaltyStatus>> {
  return request('/loyalty/me');
}

export async function getAnalyticsSummary(): Promise<ApiResponse<AnalyticsSummary>> {
  return request('/analytics/summary');
}

export async function getAnalyticsSnapshots(limit?: number): Promise<ApiResponse<AnalyticsSnapshot[]>> {
  const query = limit ? `?limit=${encodeURIComponent(String(limit))}` : '';
  return request(`/analytics/snapshots${query}`);
}

export async function getLocalizationData(): Promise<ApiResponse<LocalizationData>> {
  return request('/localization');
}

export async function getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
  return request('/notifications');
}

export async function markNotificationRead(id: string): Promise<ApiResponse<NotificationItem>> {
  return request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
}

/* Contact */
export async function submitContact(data: { name: string; email: string; subject: string; message: string }): Promise<ApiResponse<{ message: string }>> {
  return request('/contacts', { method: 'POST', body: JSON.stringify(data) });
}

export async function getContacts(filters?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<{ contacts: ContactMessage[]; pagination: ContactPagination }>> {
  const qp = new URLSearchParams();
  if (filters?.status) qp.append('status', filters.status);
  if (filters?.page) qp.append('page', String(filters.page));
  if (filters?.limit) qp.append('limit', String(filters.limit));
  const url = qp.toString() ? `/contacts?${qp.toString()}` : '/contacts';
  const res = await request(url);
  const payload = res.data ?? (res as any);
  return {
    message: res.message,
    data: {
      contacts: payload?.contacts ?? payload?.data?.contacts ?? [],
      pagination: payload?.pagination ?? payload?.data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 }
    }
  };
}

export async function getContactById(id: string): Promise<ApiResponse<ContactMessage>> {
  return request(`/contacts/${encodeURIComponent(id)}`);
}

export async function respondToContact(contactId: string, response: string): Promise<ApiResponse<ContactMessage>> {
  return request(`/contacts/${encodeURIComponent(contactId)}/respond`, {
    method: 'PUT',
    body: JSON.stringify({ response })
  });
}

/* Accountant */
export async function getAccountantDashboard(cooperativeId: string): Promise<ApiResponse<{ stats: AccountantDashboardStats }>> {
  return request(`/accountant/dashboard/${encodeURIComponent(cooperativeId)}`);
}
export async function generateFinancialReport(cooperativeId: string, type: 'monthly' | 'quarterly' | 'annual'): Promise<Blob> {
  const url = `${API_BASE}/accountant/reports/${encodeURIComponent(cooperativeId)}/${encodeURIComponent(type)}`;
  const token = localStorage.getItem('token');
  const res = await fetch(url, { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : undefined, credentials: 'include' });
  if (!res.ok) throw { status: res.status, message: 'Failed to generate report' } as ApiError;
  return res.blob();
}

export async function getFinancialSummary(cooperativeId: string): Promise<ApiResponse<FinancialSummary>> {
  return request(`/accountant/financial-summary/${encodeURIComponent(cooperativeId)}`);
}

/* Secretary */
export async function getSecretaryDashboard(cooperativeId: string): Promise<ApiResponse<{ stats: SecretaryDashboardStats }>> {
  return request(`/secretary/dashboard/${encodeURIComponent(cooperativeId)}`);
}
export async function getPendingApprovals(cooperativeId: string): Promise<ApiResponse<{ approvals: PendingApproval[] }>> {
  return request(`/secretary/pending-approvals/${encodeURIComponent(cooperativeId)}`);
}
export async function approveTransaction(approvalId: string): Promise<ApiResponse<{ message: string }>> {
  return request(`/secretary/approvals/${encodeURIComponent(approvalId)}/approve`, { method: 'POST' });
}
export async function rejectTransaction(approvalId: string): Promise<ApiResponse<{ message: string }>> {
  return request(`/secretary/approvals/${encodeURIComponent(approvalId)}/reject`, { method: 'POST' });
}

/* Buyer payments & orders */
export async function getBuyerPayments(): Promise<ApiResponse<Payment[]>> {
  return request('/buyer/payments');
}
export async function createOrder(orderData: {
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  shippingInfo: {
    fullName: string;
    phone: string;
    address: string;
    district: string;
    sector: string;
    deliveryNotes?: string;
  };
  totalAmount: number;
}): Promise<ApiResponse<Order>> {
  return request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
}

/* Transactions */
export async function getTransactions(cooperativeId: string, filters?: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ transactions: Transaction[]; total: number; page: number; limit: number }>> {
  const qp = new URLSearchParams();
  if (filters?.status) qp.append('status', filters.status);
  if (filters?.type) qp.append('type', filters.type);
  if (filters?.startDate) qp.append('startDate', filters.startDate);
  if (filters?.endDate) qp.append('endDate', filters.endDate);
  if (filters?.page) qp.append('page', String(filters.page));
  if (filters?.limit) qp.append('limit', String(filters.limit));
  const url = qp.toString() ? `/transactions/${encodeURIComponent(cooperativeId)}?${qp.toString()}` : `/transactions/${encodeURIComponent(cooperativeId)}`;
  return request(url);
}
export async function createTransaction(cooperativeId: string, transactionData: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
  return request(`/transactions/${encodeURIComponent(cooperativeId)}`, { method: 'POST', body: JSON.stringify(transactionData) });
}
export async function getTransactionById(transactionId: string): Promise<ApiResponse<Transaction>> {
  return request(`/transactions/transaction/${encodeURIComponent(transactionId)}`);
}

/* Announcements */
export async function getAnnouncements(filters?: { type?: string; page?: number; limit?: number; }): Promise<ApiResponse<{ announcements: any[]; pagination: any }>> {
  const qp = new URLSearchParams();
  if (filters?.type && filters.type !== 'all') qp.append('type', filters.type);
  if (filters?.page) qp.append('page', String(filters.page));
  if (filters?.limit) qp.append('limit', String(filters.limit));
  const r = await request(`/announcements${qp.toString() ? `?${qp.toString()}` : ''}`);
  const payload = r.data ?? (r as any);
  return {
    message: r.message,
    data: {
      announcements: payload?.announcements ?? payload ?? [],
      pagination: payload?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 }
    }
  } as ApiResponse<{ announcements: any[]; pagination: any }>;
}

export async function getAnnouncementById(id: string): Promise<ApiResponse<any>> {
  return request(`/announcements/${encodeURIComponent(id)}`);
}

export async function getReports(cooperativeId: string, type?: string): Promise<ApiResponse<{ reports: any[] }>> {
  const qp = new URLSearchParams();
  if (type) qp.append('type', type);
  const q = qp.toString() ? `?${qp.toString()}` : '';
  const response = await request(`/reports/${encodeURIComponent(cooperativeId)}${q}`);
  return {
    message: response?.message,
    data: {
      reports: response?.data?.reports ?? response?.data ?? [],
    },
  } as ApiResponse<{ reports: any[] }>;
}

export async function getReportById(reportId: string): Promise<ApiResponse<any>> {
  return request(`/reports/report/${encodeURIComponent(reportId)}`);
}

/* Super Admin Report Generation */
export async function generatePlatformFinancialReport(period: string): Promise<ApiResponse<any>> {
  return request('/admin/reports/financial', {
    method: 'POST',
    body: JSON.stringify({ period })
  });
}

export async function generatePlatformUserReport(period: string): Promise<ApiResponse<any>> {
  return request('/admin/reports/users', {
    method: 'POST',
    body: JSON.stringify({ period })
  });
}

export async function generatePlatformCooperativeReport(period: string): Promise<ApiResponse<any>> {
  return request('/admin/reports/cooperatives', {
    method: 'POST',
    body: JSON.stringify({ period })
  });
}

export async function generatePlatformPerformanceReport(period: string): Promise<ApiResponse<any>> {
  return request('/admin/reports/performance', {
    method: 'POST',
    body: JSON.stringify({ period })
  });
}

/* Coop Admin Report Generation (using existing endpoint) */
export async function generateCooperativeReport(
  cooperativeId: string,
  reportType: 'financial' | 'member',
  period: string
): Promise<ApiResponse<any>> {
  const endpoint = reportType === 'financial'
    ? `/reports/${encodeURIComponent(cooperativeId)}/financial`
    : `/reports/${encodeURIComponent(cooperativeId)}/member`;

  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ period })
  });
}

/* Reviews API */
export async function createReview(data: {
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: File[];
}): Promise<ApiResponse<any>> {
  const fd = new FormData();
  fd.append('productId', data.productId);
  if (data.orderId) fd.append('orderId', data.orderId);
  fd.append('rating', String(data.rating));
  if (data.comment) fd.append('comment', data.comment);
  if (data.images) {
    Array.from(data.images).forEach(img => fd.append('images', img));
  }
  return request('/reviews', { method: 'POST', body: fd });
}

export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: 'recent' | 'rating' | 'helpful' = 'recent'
): Promise<ApiResponse<any>> {
  const qp = new URLSearchParams();
  qp.append('page', String(page));
  qp.append('limit', String(limit));
  qp.append('sortBy', sortBy);
  return request(`/reviews/product/${encodeURIComponent(productId)}?${qp.toString()}`);
}

export async function markReviewHelpful(reviewId: string): Promise<ApiResponse<any>> {
  return request(`/reviews/${encodeURIComponent(reviewId)}/helpful`, { method: 'POST' });
}

export async function deleteReview(reviewId: string): Promise<ApiResponse<any>> {
  return request(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' });
}

export async function getUserReviews(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
  const qp = new URLSearchParams();
  qp.append('page', String(page));
  qp.append('limit', String(limit));
  return request(`/reviews/my?${qp.toString()}`);
}

/* Shipping API */
export async function calculateShipping(data: {
  cooperativeId: string;
  buyerDistrict: string;
  items: Array<{ productId: string; quantity: number }>;
  totalAmount?: number;
}): Promise<ApiResponse<Array<{
  method: string;
  cost: number;
  estimatedDays: number;
  description: string;
}>>> {
  return request('/orders/calculate-shipping', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getShippingMethods(): Promise<ApiResponse<any[]>> {
  return request('/orders/shipping-methods');
}

/* Return/Refund API */
export async function createReturnRequest(data: {
  orderId: string;
  productId: string;
  orderItemId?: string;
  reason: string;
  description?: string;
  images?: File[];
}): Promise<ApiResponse<any>> {
  const fd = new FormData();
  fd.append('orderId', data.orderId);
  fd.append('productId', data.productId);
  if (data.orderItemId) fd.append('orderItemId', data.orderItemId);
  fd.append('reason', data.reason);
  if (data.description) fd.append('description', data.description);
  if (data.images) {
    Array.from(data.images).forEach(img => fd.append('images', img));
  }
  return request('/returns', { method: 'POST', body: fd });
}

export async function getReturnRequests(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
  const qp = new URLSearchParams();
  qp.append('page', String(page));
  qp.append('limit', String(limit));
  return request(`/returns?${qp.toString()}`);
}

export async function getReturnRequestById(returnId: string): Promise<ApiResponse<any>> {
  return request(`/returns/${encodeURIComponent(returnId)}`);
}

export async function cancelReturnRequest(returnId: string): Promise<ApiResponse<any>> {
  return request(`/returns/${encodeURIComponent(returnId)}/cancel`, { method: 'POST' });
}

export async function approveReturnRequest(returnId: string): Promise<ApiResponse<any>> {
  return request(`/returns/${encodeURIComponent(returnId)}/approve`, { method: 'POST' });
}

export async function rejectReturnRequest(returnId: string, rejectionReason: string): Promise<ApiResponse<any>> {
  return request(`/returns/${encodeURIComponent(returnId)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejectionReason })
  });
}

export async function processRefund(returnId: string, refundRef: string): Promise<ApiResponse<any>> {
  return request(`/returns/${encodeURIComponent(returnId)}/refund`, {
    method: 'POST',
    body: JSON.stringify({ refundRef })
  });
}

/* Wishlist API */
export async function addToWishlist(productId: string): Promise<ApiResponse<any>> {
  return request('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId })
  });
}

export async function removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
  return request(`/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

export async function getWishlist(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
  const qp = new URLSearchParams();
  qp.append('page', String(page));
  qp.append('limit', String(limit));
  return request(`/wishlist?${qp.toString()}`);
}

export async function checkWishlistStatus(productId: string): Promise<ApiResponse<{ isInWishlist: boolean }>> {
  return request(`/wishlist/check/${encodeURIComponent(productId)}`);
}

export async function getWishlistCount(): Promise<ApiResponse<{ count: number }>> {
  return request('/wishlist/count');
}

/* Recommendations API */
export async function getProductRecommendations(
  productId?: string,
  limit: number = 10
): Promise<ApiResponse<any[]>> {
  const qp = new URLSearchParams();
  if (productId) qp.append('productId', productId);
  qp.append('limit', String(limit));
  return request(`/recommendations?${qp.toString()}`);
}

export async function getTrendingProducts(limit: number = 10): Promise<ApiResponse<any[]>> {
  const now = Date.now();
  if (trendingCache.data && trendingCache.limit === limit && now < trendingCache.expiry) {
    return trendingCache.data;
  }
  if (trendingCache.promise && trendingCache.limit === limit) {
    return trendingCache.promise;
  }

  const qp = new URLSearchParams();
  qp.append('limit', String(limit));
  trendingCache.limit = limit;

  const fetchPromise = request(`/recommendations/trending?${qp.toString()}`)
    .then((r) => {
      trendingCache.data = r;
      trendingCache.expiry = Date.now() + CACHE_TTL;
      trendingCache.promise = null;
      return r;
    })
    .catch((error) => {
      trendingCache.promise = null;
      throw error;
    });

  trendingCache.promise = fetchPromise;
  return fetchPromise;
}

export async function getYouMightLike(limit: number = 10): Promise<ApiResponse<any[]>> {
  const qp = new URLSearchParams();
  qp.append('limit', String(limit));
  return request(`/recommendations/you-might-like?${qp.toString()}`);
}

export async function updateAnnouncement(id: string, data: {
  title?: string;
  content?: string;
  type?: string;
  isPublic?: boolean;
  expiresAt?: string;
  attachments?: FileList;
}): Promise<ApiResponse<any>> {
  const fd = new FormData();
  if (data.title) fd.append('title', data.title);
  if (data.content) fd.append('content', data.content);
  if (data.type) fd.append('type', data.type);
  if (data.isPublic !== undefined) fd.append('isPublic', String(data.isPublic));
  if (data.expiresAt) fd.append('expiresAt', data.expiresAt);
  if (data.attachments) Array.from(data.attachments).forEach(f => fd.append('attachments', f));
  return request(`/announcements/${encodeURIComponent(id)}`, { method: 'PUT', body: fd });
}

export async function deleteAnnouncement(id: string): Promise<ApiResponse<any>> {
  return request(`/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  type: string;
  isPublic?: boolean;
  expiresAt?: string;
  attachments?: FileList;
}): Promise<ApiResponse<any>> {
  const fd = new FormData();
  fd.append('title', data.title);
  fd.append('content', data.content);
  fd.append('type', data.type);
  if (data.isPublic !== undefined) fd.append('isPublic', String(data.isPublic));
  if (data.expiresAt) fd.append('expiresAt', data.expiresAt);
  if (data.attachments) Array.from(data.attachments).forEach(f => fd.append('attachments', f));
  return request('/announcements', { method: 'POST', body: fd });
}

/* default export for convenience */
export default {
  request,
  login, register, verifyEmail, requestPasswordReset, resetPassword, resendOTP, getProfile, updateProfile, logout,
  registerCooperative, createCooperative, updateCooperative, listCooperatives, approveCooperative, rejectCooperative, suspendCooperative,
  getSuperAdminStats, getRecentActivities, getCooperativeDetails, getAccountantDashboard, getSecretaryDashboard,
  listMembers, getMemberProfile, getMemberContributions, addMember,
  listProducts, searchProducts, getAllProducts,
  getRegulatorProfile, getPendingReviews, updateReviewStatus,
  generateFinancialReport,
  getPendingApprovals, approveTransaction, rejectTransaction,
  getBuyerOrders, getFavorites,
  submitContact,
  getTransactions, createTransaction, getTransactionById, getFinancialSummary,
  getAnnouncements, getAnnouncementById, createAnnouncement, getReports, getReportById, createOrder, processPayment, cancelOrder,
  generatePlatformFinancialReport, generatePlatformUserReport, generatePlatformCooperativeReport, generatePlatformPerformanceReport,
  generateCooperativeReport,
  // Reviews
  createReview, getProductReviews, markReviewHelpful, deleteReview, getUserReviews,
  // Shipping
  calculateShipping, getShippingMethods,
  // Returns
  createReturnRequest, getReturnRequests, getReturnRequestById, cancelReturnRequest, approveReturnRequest, rejectReturnRequest, processRefund,
  // Wishlist
  addToWishlist, removeFromWishlist, getWishlist, checkWishlistStatus, getWishlistCount,
  // Recommendations
  getProductRecommendations, getTrendingProducts, getYouMightLike
};

export async function processPayment(orderId: string, phoneNumber: string): Promise<ApiResponse<any>> {
  return request(`/orders/${encodeURIComponent(orderId)}/pay`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber })
  });
}

export async function cancelOrder(orderId: string): Promise<ApiResponse<any>> {
  return request(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST'
  });
}
