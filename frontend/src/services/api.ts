// services/api.ts — EcoTrade Rwanda API client
// Wraps every backend endpoint with typed helpers and JWT injection.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── Generic fetch helper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  isFormData = false,
): Promise<T> {
  const token = localStorage.getItem('ecotrade_token');

  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface APIUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  hotel_profile?: {
    business_name: string;
    registration_number?: string;
    tax_id?: string;
    contact_person?: string;
    position?: string;
  };
  recycler_profile?: {
    company_name: string;
    license_number?: string;
    waste_types?: string[];
    facility_address?: string;
    processing_capacity?: number;
  };
  driver_profile?: {
    national_id?: string;
    vehicle_type?: string;
    vehicle_plate?: string;
    service_radius?: number;
    operating_hours?: string;
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: APIUser;
}

export interface RegisterResponse {
  message: string;
  user: APIUser;
}

export interface WasteListing {
  id: number;
  hotel_id: number;
  hotel_name: string;
  image_url?: string;
  title: string;
  description?: string;
  waste_type: string;
  volume: number;
  unit: string;
  quality?: string;
  min_bid: number;
  bid_count: number;
  highest_bid: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  special_instructions?: string;
  notes?: string;
  contact_person?: string;
  status: string;
  location?: string;
  is_urgent?: boolean;
  view_count?: number;
  created_at: string;
  expires_at?: string;
  // Legacy/optional fields for backward-compat
  reserve_price?: number;
  auction_duration?: string;
  assigned_recycler?: string;
  assigned_driver?: string;
  collection_date?: string;
  collection_time?: string;
  actual_weight?: number;
}

export interface Bid {
  id: number;
  listing_id: number;
  recycler_id: number;
  recycler_name: string;
  amount: number;
  note?: string;
  collection_preference?: string;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  listing_id?: number;
  from_user: string;
  to_user: string;
  waste_type: string;
  volume: number;
  amount: number;
  fee: number;
  status: string;
  created_at: string;
  receipt?: string;
}

export interface Collection {
  id: number;
  listing_id?: number;
  hotel_name: string;
  recycler_name: string;
  driver_name: string;
  driver_id?: number;
  waste_type: string;
  volume: number;
  status: string;
  scheduled_date: string;
  scheduled_time?: string;
  completed_at?: string;
  actual_weight?: number;
  rating?: number;
  notes?: string;
  location?: string;
  earnings: number;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  user_name: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  from_name: string;
  message: string;
  created_at: string;
}

export interface Message {
  id: number;
  from_user_id: number;
  from_name: string;
  to_user_id: number;
  to_name: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  replies: MessageReply[];
}

export interface MessageReply {
  id: number;
  message_id: number;
  from_user_id: number;
  from_name: string;
  body: string;
  created_at: string;
}

export interface DriverRoute {
  id: number;
  driver_id: number;
  date: string;
  status: string;
  total_distance: number;
  estimated_earnings: number;
  actual_earnings?: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  stops: RouteStop[];
}

export interface RouteStop {
  id: number;
  route_id: number;
  hotel_name: string;
  location?: string;
  waste_type?: string;
  volume?: number;
  eta?: string;
  status: string;
  contact_person?: string;
  contact_phone?: string;
  special_instructions?: string;
  actual_weight?: number;
  completed_at?: string;
}

export interface RecyclingEvent {
  id: number;
  user_id: number;
  user_name: string;
  date: string;
  waste_type: string;
  weight: number;
  location?: string;
  points: number;
  notes?: string;
  verified: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  admin_user_id?: number;
  admin_name?: string;
  action: string;
  target: string;
  details?: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category: string;
  tags?: string;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  author_id: number;
  author_name: string;
  author_email: string;
  author_display_name?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostCreate {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category: string;
  tags?: string;
  is_published?: boolean;
  is_featured?: boolean;
  author_display_name?: string;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category?: string;
  tags?: string;
  is_published?: boolean;
  is_featured?: boolean;
  author_display_name?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (formData: FormData) =>
    request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: formData,
    }, true),
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersAPI = {
  list: (params?: { role?: string; status?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<APIUser[]>(`/users${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<APIUser>(`/users/${id}`),

  update: (id: number, data: Partial<APIUser>) =>
    request<APIUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),

  approve: (id: number) =>
    request<APIUser>(`/users/${id}/approve`, { method: 'POST' }),

  suspend: (id: number) =>
    request<APIUser>(`/users/${id}/suspend`, { method: 'POST' }),

  me: () => request<APIUser>('/users/me'),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<APIUser>('/users/me/avatar', {
      method: 'POST',
      body: formData,
    }, true);
  },
};

// ─── Listings ─────────────────────────────────────────────────────────────────

export const listingsAPI = {
  list: (params?: {
    status?: string;
    waste_type?: string;
    hotel_id?: number;
    skip?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<WasteListing[]>(`/listings${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<WasteListing>(`/listings/${id}`),

  create: (data: Partial<WasteListing>) =>
    request<WasteListing>('/listings', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<WasteListing>) =>
    request<WasteListing>(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => request<void>(`/listings/${id}`, { method: 'DELETE' }),

  mine: () => request<WasteListing[]>('/listings/mine'),

  // Bids on a listing
  getBids: (listingId: number) => request<Bid[]>(`/bids/listing/${listingId}`),

  placeBid: (listingId: number, data: { amount: number; note?: string; collection_preference?: string }) =>
    request<Bid>('/bids', {
      method: 'POST',
      body: JSON.stringify({
        listing_id: listingId,
        amount: data.amount,
        notes: data.note,
      }),
    }),

  acceptBid: (_listingId: number, bidId: number) =>
    request<Bid>(`/bids/${bidId}/accept`, { method: 'POST' }),
};

export const bidsAPI = {
  mine: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<Bid[]>(`/bids/mine${q ? `?${q}` : ''}`);
  },

  withdraw: (bidId: number) =>
    request<Bid>(`/bids/${bidId}/withdraw`, { method: 'POST' }),

  increase: (bidId: number, amount: number) =>
    request<Bid>(`/bids/${bidId}/increase`, { method: 'PATCH', body: JSON.stringify({ amount }) }),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsAPI = {
  list: (params?: { status?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<Transaction[]>(`/transactions${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<Transaction>(`/transactions/${id}`),

  create: (data: Partial<Transaction>) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: { status?: string; receipt?: string }) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  mine: (params?: { status?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<Transaction[]>(`/transactions/mine${q ? `?${q}` : ''}`);
  },
};

// ─── Collections ─────────────────────────────────────────────────────────────

export const collectionsAPI = {
  list: (params?: { status?: string; driver_id?: number; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<Collection[]>(`/collections/mine${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<Collection>(`/collections/${id}`),

  create: (data: Partial<Collection>) =>
    request<Collection>('/collections', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: number, data: { status: string; actual_weight?: number; rating?: number; notes?: string }) =>
    request<Collection>(`/collections/${id}/advance`, { method: 'POST', body: JSON.stringify(data) }),

  assignDriver: (id: number, data: { driver_id: number; vehicle_id: number }) =>
    request<Collection>(`/collections/${id}/assign-driver`, { method: 'POST', body: JSON.stringify(data) }),

  uploadProof: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ id: number; image_url?: string }>(`/collections/${id}/proofs`, {
      method: 'POST',
      body: formData,
    }, true);
  },
};

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const supportAPI = {
  list: (params?: { status?: string; priority?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<SupportTicket[]>(`/support${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<SupportTicket>(`/support/${id}`),

  create: (data: { subject: string; message: string; priority?: string }) =>
    request<SupportTicket>('/support', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: { status?: string; priority?: string }) =>
    request<SupportTicket>(`/support/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  respond: (id: number, data: { from_name: string; message: string }) =>
    request<TicketResponse>(`/support/${id}/responses`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesAPI = {
  list: () => request<Message[]>('/messages'),

  get: (id: number) => request<Message>(`/messages/${id}`),

  send: (data: { to_user_id: number; to_name: string; subject: string; body: string }) =>
    request<Message>('/messages', { method: 'POST', body: JSON.stringify(data) }),

  reply: (id: number, body: string) =>
    request<MessageReply>(`/messages/${id}/replies`, { method: 'POST', body: JSON.stringify({ body }) }),

  markRead: (id: number) =>
    request<Message>(`/messages/${id}/read`, { method: 'POST' }),
};

// ─── Routes ───────────────────────────────────────────────────────────────────

export const routesAPI = {
  list: (params?: { date?: string; status?: string; driver_id?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<DriverRoute[]>(`/routes${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<DriverRoute>(`/routes/${id}`),

  create: (data: {
    date: string;
    total_distance?: number;
    estimated_earnings?: number;
    start_time?: string;
    stops?: Partial<RouteStop>[];
  }) => request<DriverRoute>('/routes', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: { status?: string; end_time?: string; actual_earnings?: number }) =>
    request<DriverRoute>(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  updateStop: (routeId: number, stopId: number, data: { status: string; actual_weight?: number }) =>
    request<RouteStop>(`/routes/${routeId}/stops/${stopId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Recycling Events ─────────────────────────────────────────────────────────

export const recyclingAPI = {
  list: (params?: { user_id?: number; verified?: boolean; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<RecyclingEvent[]>(`/recycling${q ? `?${q}` : ''}`);
  },

  create: (data: { date: string; waste_type: string; weight: number; location?: string; points?: number; notes?: string }) =>
    request<RecyclingEvent>('/recycling', { method: 'POST', body: JSON.stringify(data) }),

  verify: (id: number) =>
    request<RecyclingEvent>(`/recycling/${id}/verify`, { method: 'POST' }),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditAPI = {
  list: (params?: { action?: string; target?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<AuditLog[]>(`/audit${q ? `?${q}` : ''}`);
  },

  create: (data: { action: string; target: string; details?: string; status?: string }) =>
    request<AuditLog>('/audit', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsAPI = {
  list: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<Notification[]>(`/notifications${q ? `?${q}` : ''}`);
  },

  unreadCount: () =>
    request<{ count: number }>('/notifications/unread-count'),

  markRead: (id: number) =>
    request<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllRead: () =>
    request<{ marked: number }>('/notifications/read-all', { method: 'POST' }),
};

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export const blogAPI = {
  // Public endpoints
  list: (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured_only?: boolean;
  }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<BlogPost[]>(`/blog${q ? `?${q}` : ''}`);
  },

  getBySlug: (slug: string) =>
    request<BlogPost>(`/blog/slug/${slug}`),

  getById: (id: number) =>
    request<BlogPost>(`/blog/${id}`),

  getCategories: () =>
    request<string[]>('/blog/categories'),

  // Admin endpoints
  listAll: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<BlogPost[]>(`/blog/admin/all${q ? `?${q}` : ''}`);
  },

  create: (data: BlogPostCreate) =>
    request<BlogPost>('/blog', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: BlogPostUpdate) =>
    request<BlogPost>(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<void>(`/blog/${id}`, { method: 'DELETE' }),

  publish: (id: number) =>
    request<BlogPost>(`/blog/${id}/publish`, { method: 'POST' }),

  unpublish: (id: number) =>
    request<BlogPost>(`/blog/${id}/unpublish`, { method: 'POST' }),

  toggleFeatured: (id: number) =>
    request<BlogPost>(`/blog/${id}/toggle-featured`, { method: 'POST' }),
};

// ─── Hotels ───────────────────────────────────────────────────────────────────

export interface HotelProfile {
  id: number;
  user_id: number;
  hotel_name: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  stars?: number;
  room_count?: number;
  green_score: number;
  total_waste_listed?: number;
  total_revenue?: number;
  rating?: number;
  is_verified?: boolean;
  created_at: string;
}

export const hotelsAPI = {
  me: () => request<HotelProfile>('/hotels/me'),
  list: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<HotelProfile[]>(`/hotels${q ? `?${q}` : ''}`);
  },
  get: (id: number) => request<HotelProfile>(`/hotels/${id}`),
  update: (data: Partial<HotelProfile>) =>
    request<HotelProfile>('/hotels/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Recyclers ────────────────────────────────────────────────────────────────

export interface RecyclerProfile {
  id: number;
  user_id: number;
  company_name: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  waste_types_handled?: string;
  storage_capacity?: number;
  fleet_size?: number;
  green_score: number;
  total_collected?: number;
  total_spent?: number;
  rating?: number;
  active_bids?: number;
  is_verified?: boolean;
  created_at: string;
}

export const recyclersAPI = {
  me: () => request<RecyclerProfile>('/recyclers/me'),
  list: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<RecyclerProfile[]>(`/recyclers${q ? `?${q}` : ''}`);
  },
  get: (id: number) => request<RecyclerProfile>(`/recyclers/${id}`),
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: number;
  recycler_id: number;
  material_type: string;
  current_stock: number;
  capacity: number;
  unit: string;
  last_updated: string;
  created_at: string;
}

export const inventoryAPI = {
  mine: () => request<InventoryItem[]>('/inventory/mine'),
};

// ─── Drivers ──────────────────────────────────────────────────────────────────

export interface DriverProfile {
  id: number;
  user_id: number;
  recycler_id?: number;
  vehicle_id?: number;
  license_number?: string;
  phone?: string;
  status: 'available' | 'on_route' | 'off_duty';
  current_lat?: number;
  current_lng?: number;
  rating: number;
  total_trips: number;
  is_verified: boolean;
  created_at: string;
  // Enriched fields (added client-side or from user join)
  name?: string;
  vehicle_type?: string;
  plate_number?: string;
}

export const driversAPI = {
  list: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams(params as Record<string, string> || {}).toString();
    return request<DriverProfile[]>(`/drivers${q ? `?${q}` : ''}`);
  },
  available: () => request<DriverProfile[]>('/drivers/available'),
  get: (id: number) => request<DriverProfile>(`/drivers/${id}`),
  me: () => request<DriverProfile>('/drivers/me'),
  setAvailability: (available: boolean) =>
    request<DriverProfile>('/drivers/me/availability', {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    }),
};

// ─── Hotel driver request ─────────────────────────────────────────────────────

export const hotelCollectionAPI = {
  requestDriver: (collectionId: number, data: { driver_id: number; vehicle_id?: number }) =>
    request<Collection>(`/collections/${collectionId}/request-driver`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Health check ─────────────────────────────────────────────────────────────

export const healthCheck = () =>
  fetch(`${API_BASE.replace('/api', '')}/health`).then(r => r.json()).catch(() => null);

// ─── Public stats ─────────────────────────────────────────────────────────────

export interface PlatformStats {
  hotels: number;
  recyclers: number;
  drivers: number;
  total_volume_kg: number;
  total_listings: number;
  total_transactions: number;
  total_revenue_rwf: number;
}

export interface ActivityItem {
  type: string;
  name: string;
  action: string;
  waste: string;
  created_at: string | null;
}

export const statsAPI = {
  get: () => request<PlatformStats>('/stats/'),
  recentActivity: (limit = 8) => request<ActivityItem[]>(`/stats/recent-activity?limit=${limit}`),
};

