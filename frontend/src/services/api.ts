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
  waste_type: string;
  volume: number;
  unit: string;
  quality: string;
  min_bid: number;
  reserve_price?: number;
  auction_duration: string;
  auto_accept_above?: number;
  special_instructions?: string;
  contact_person?: string;
  status: string;
  location?: string;
  assigned_recycler?: string;
  assigned_driver?: string;
  collection_date?: string;
  collection_time?: string;
  actual_weight?: number;
  created_at: string;
  expires_at?: string;
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
    request<WasteListing>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) => request<void>(`/listings/${id}`, { method: 'DELETE' }),

  // Bids on a listing
  getBids: (listingId: number) => request<Bid[]>(`/listings/${listingId}/bids`),

  placeBid: (listingId: number, data: { amount: number; note?: string; collection_preference?: string }) =>
    request<Bid>(`/listings/${listingId}/bids`, { method: 'POST', body: JSON.stringify(data) }),

  acceptBid: (listingId: number, bidId: number) =>
    request<Bid>(`/listings/${listingId}/bids/${bidId}/accept`, { method: 'POST' }),
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
};

// ─── Collections ─────────────────────────────────────────────────────────────

export const collectionsAPI = {
  list: (params?: { status?: string; driver_id?: number; skip?: number; limit?: number }) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<Collection[]>(`/collections${q ? `?${q}` : ''}`);
  },

  get: (id: number) => request<Collection>(`/collections/${id}`),

  create: (data: Partial<Collection>) =>
    request<Collection>('/collections', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: number, data: { status: string; actual_weight?: number; rating?: number; notes?: string }) =>
    request<Collection>(`/collections/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
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

// ─── Health check ─────────────────────────────────────────────────────────────

export const healthCheck = () =>
  fetch(`${API_BASE.replace('/api', '')}/health`).then(r => r.json()).catch(() => null);
