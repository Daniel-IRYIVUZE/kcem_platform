
export interface WasteListing {
  id: string;
  hotelId: string;
  hotelName: string;
  wasteType: 'UCO' | 'Glass' | 'Paper/Cardboard' | 'Mixed';
  volume: number;
  unit: 'kg' | 'liters';
  quality: 'A' | 'B' | 'C';
  photos: string[];
  minBid: number;
  reservePrice: number;
  auctionDuration: string;
  autoAcceptAbove: number;
  specialInstructions: string;
  contactPerson: string;
  status: 'open' | 'assigned' | 'collected' | 'completed' | 'cancelled' | 'expired' | 'draft';
  createdAt: string;
  expiresAt: string;
  bids: Bid[];
  assignedRecycler?: string;
  assignedDriver?: string;
  collectionDate?: string;
  collectionTime?: string;
  actualWeight?: number;
  proofPhotos?: string[];
  location: string;
}

export interface Bid {
  id: string;
  listingId: string;
  recyclerId: string;
  recyclerName: string;
  amount: number;
  note: string;
  collectionPreference: string;
  status: 'active' | 'won' | 'lost' | 'withdrawn';
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'business' | 'recycler' | 'driver' | 'individual';
  status: 'active' | 'pending' | 'suspended';
  location: string;
  joinDate: string;
  lastActive: string;
  avatar: string;
  verified: boolean;
  greenScore?: number;
  monthlyWaste?: number;
  totalRevenue?: number;
  vehicleType?: string;
  vehiclePlate?: string;
  rating?: number;
  completedRoutes?: number;
  processingCapacity?: number;
  licenseNumber?: string;
  wasteTypes?: string[];
}

export interface Transaction {
  id: string;
  date: string;
  from: string;
  to: string;
  wasteType: string;
  volume: number;
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'disputed' | 'refunded';
  listingId: string;
  receipt?: string;
}

export interface Collection {
  id: string;
  listingId: string;
  hotelName: string;
  recyclerName: string;
  driverName: string;
  driverId: string;
  wasteType: string;
  volume: number;
  status: 'scheduled' | 'en-route' | 'collected' | 'verified' | 'completed' | 'missed';
  scheduledDate: string;
  scheduledTime: string;
  completedAt?: string;
  proofPhotos: string[];
  actualWeight?: number;
  rating?: number;
  notes: string;
  location: string;
  earnings: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  responses: { from: string; message: string; date: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: 'create' | 'read' | 'update' | 'delete';
  target: string;
  details: string;
  status: 'success' | 'failure';
}

export interface DriverRoute {
  id: string;
  driverId: string;
  date: string;
  stops: RouteStop[];
  status: 'pending' | 'in-progress' | 'completed';
  totalDistance: number;
  estimatedEarnings: number;
  actualEarnings?: number;
  startTime: string;
  endTime?: string;
}

export interface RouteStop {
  id: string;
  hotelName: string;
  location: string;
  wasteType: string;
  volume: number;
  eta: string;
  status: 'pending' | 'arrived' | 'collecting' | 'completed' | 'skipped';
  contactPerson: string;
  contactPhone: string;
  specialInstructions: string;
  actualWeight?: number;
  photos: string[];
  completedAt?: string;
}

export interface RecyclingEvent {
  id: string;
  userId: string;
  userName: string;
  date: string;
  wasteType: 'Plastic' | 'Paper/Cardboard' | 'Glass' | 'Organic Waste' | 'Metal' | 'E-Waste' | 'Mixed';
  weight: number;
  location: string;
  points: number;
  notes: string;
  verified: boolean;
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  replies: { from: string; fromName: string; body: string; date: string }[];
}

// --- Storage helpers ---
const STORE_KEY = 'ecotrade_store';

function getStore(): Record<string, any> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setStore(store: Record<string, any>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event('ecotrade_data_change'));
}

function getCollection<T>(key: string): T[] {
  return getStore()[key] || [];
}

function setCollection<T>(key: string, data: T[]) {
  const store = getStore();
  store[key] = data;
  setStore(store);
}

// --- Generic CRUD ---
export function getAll<T>(collection: string): T[] {
  return getCollection<T>(collection);
}

export function getById<T extends { id: string }>(collection: string, id: string): T | undefined {
  return getCollection<T>(collection).find(item => item.id === id);
}

export function create<T extends { id: string }>(collection: string, item: T): T {
  const items = getCollection<T>(collection);
  items.push(item);
  setCollection(collection, items);
  addAuditLog('create', collection, `Created ${collection} item: ${item.id}`);
  return item;
}

export function update<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): T | undefined {
  const items = getCollection<T>(collection);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...updates };
  setCollection(collection, items);
  addAuditLog('update', collection, `Updated ${collection} item: ${id}`);
  return items[index];
}

export function remove<T extends { id: string }>(collection: string, id: string): boolean {
  const items = getCollection<T>(collection);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  setCollection(collection, filtered);
  addAuditLog('delete', collection, `Deleted ${collection} item: ${id}`);
  return true;
}

// --- Audit log helper ---
function addAuditLog(action: AuditLog['action'], target: string, details: string) {
  const logs = getCollection<AuditLog>('auditLogs');
  logs.unshift({
    id: `AL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    adminUser: localStorage.getItem('userName') || 'System',
    action,
    target,
    details,
    status: 'success'
  });
  // Keep only last 500 entries
  if (logs.length > 500) logs.length = 500;
  const store = getStore();
  store['auditLogs'] = logs;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// --- Report generation ---
export function generateCSV(headers: string[], rows: string[][]): string {
  const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  return csvContent;
}

export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = generateCSV(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function downloadPDF(title: string, content: string) {
  // Generate printable HTML report and trigger print dialog
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html><head><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
      h1 { color: #0891b2; border-bottom: 3px solid #0891b2; padding-bottom: 10px; }
      h2 { color: #333; margin-top: 30px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th { background: #0891b2; color: white; padding: 10px; text-align: left; }
      td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
      tr:nth-child(even) { background: #f8f8f8; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; color: #0891b2; }
      .date { color: #666; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; text-align: center; }
      .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
      .stat-card { background: #f0fdfa; padding: 15px; border-radius: 8px; text-align: center; }
      .stat-value { font-size: 24px; font-weight: bold; color: #0891b2; }
      .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <div class="header">
      <div class="logo">EcoTrade Rwanda</div>
      <div class="date">Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
    <h1>${title}</h1>
    ${content}
    <div class="footer">
      <p>EcoTrade Rwanda — Digital B2B Marketplace for Reverse Logistics</p>
      <p>Kigali, Rwanda | contact@ecotrade.rw | +250 780 162 164</p>
    </div>
    </body></html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

// --- ID generator ---
export function generateId(prefix: string = 'ET'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

// --- Seed initial data ---
export function seedDataIfEmpty() {
  const store = getStore();
  if (store._seeded) return;

  const now = new Date();
  const fmt = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return fmt(d); };
  const hoursAgo = (n: number) => { const d = new Date(now); d.setHours(d.getHours() - n); return fmt(d); };

  // Seed Users
  const users: PlatformUser[] = [
    { id: 'U001', name: 'Mille Collines Hotel', email: 'hotel@millecollines.rw', phone: '+250 780 162 164', role: 'business', status: 'active', location: 'Nyarugenge, Kigali', joinDate: daysAgo(180), lastActive: hoursAgo(1), avatar: '', verified: true, greenScore: 78, monthlyWaste: 280, totalRevenue: 342000 },
    { id: 'U002', name: 'Serena Hotel Kigali', email: 'waste@serena.rw', phone: '+250 780 162 164', role: 'business', status: 'active', location: 'Kiyovu, Kigali', joinDate: daysAgo(150), lastActive: hoursAgo(3), avatar: '', verified: true, greenScore: 85, monthlyWaste: 350, totalRevenue: 456000 },
    { id: 'U003', name: 'Marriott Hotel Kigali', email: 'ops@marriott.rw', phone: '+250 780 162 164', role: 'business', status: 'active', location: 'Kimihurura, Kigali', joinDate: daysAgo(120), lastActive: hoursAgo(2), avatar: '', verified: true, greenScore: 72, monthlyWaste: 200, totalRevenue: 234000 },
    { id: 'U004', name: 'Radisson Blu Kigali', email: 'green@radisson.rw', phone: '+250 780 162 164', role: 'business', status: 'pending', location: 'Nyarugenge, Kigali', joinDate: daysAgo(15), lastActive: daysAgo(1), avatar: '', verified: false, greenScore: 0, monthlyWaste: 0, totalRevenue: 0 },
    { id: 'U005', name: 'Park Inn by Radisson', email: 'eco@parkinn.rw', phone: '+250 780 162 164', role: 'business', status: 'active', location: 'Remera, Kigali', joinDate: daysAgo(90), lastActive: hoursAgo(5), avatar: '', verified: true, greenScore: 68, monthlyWaste: 180, totalRevenue: 198000 },
    { id: 'U006', name: 'GreenEnergy Recyclers', email: 'recycler@greenenergy.rw', phone: '+250 780 162 164', role: 'recycler', status: 'active', location: 'Kicukiro, Kigali', joinDate: daysAgo(200), lastActive: hoursAgo(1), avatar: '', verified: true, processingCapacity: 50, licenseNumber: 'REC-2024-001', wasteTypes: ['UCO', 'Glass'], rating: 4.8, totalRevenue: 1200000 },
    { id: 'U007', name: 'EcoProcess Rwanda', email: 'info@ecoprocess.rw', phone: '+250 780 162 164', role: 'recycler', status: 'active', location: 'Gasabo, Kigali', joinDate: daysAgo(160), lastActive: hoursAgo(4), avatar: '', verified: true, processingCapacity: 30, licenseNumber: 'REC-2024-002', wasteTypes: ['Paper/Cardboard', 'Mixed'], rating: 4.5, totalRevenue: 890000 },
    { id: 'U008', name: 'Jean Pierre Habimana', email: 'driver@ecotrade.rw', phone: '+250 780 162 164', role: 'driver', status: 'active', location: 'Nyarugenge, Kigali', joinDate: daysAgo(100), lastActive: hoursAgo(2), avatar: '', verified: true, vehicleType: 'Toyota Hilux', vehiclePlate: 'RAC 123 A', rating: 4.9, completedRoutes: 187 },
    { id: 'U009', name: 'Emmanuel Mugisha', email: 'emmanuel@ecotrade.rw', phone: '+250 780 162 164', role: 'driver', status: 'active', location: 'Kicukiro, Kigali', joinDate: daysAgo(80), lastActive: hoursAgo(6), avatar: '', verified: true, vehicleType: 'Isuzu NPR', vehiclePlate: 'RAD 456 B', rating: 4.6, completedRoutes: 143 },
    { id: 'U010', name: 'Ineza Uwimana', email: 'ineza@ecotrade.rw', phone: '+250 780 162 164', role: 'driver', status: 'pending', location: 'Gasabo, Kigali', joinDate: daysAgo(5), lastActive: daysAgo(1), avatar: '', verified: false, vehicleType: 'Mitsubishi Canter', vehiclePlate: 'RAE 789 C', rating: 0, completedRoutes: 0 },
    { id: 'U011', name: 'Marie Claire Umutoni', email: 'individual@ecotrade.rw', phone: '+250 780 162 164', role: 'individual', status: 'active', location: 'Kimironko, Kigali', joinDate: daysAgo(60), lastActive: hoursAgo(8), avatar: '', verified: true },
    { id: 'U012', name: 'Admin User', email: 'admin@ecotrade.rw', phone: '+250 780 162 164', role: 'admin', status: 'active', location: 'Kigali, Rwanda', joinDate: daysAgo(365), lastActive: hoursAgo(0), avatar: '', verified: true },
  ];

  // Seed Listings
  const listings: WasteListing[] = [
    { id: 'WL001', hotelId: 'U001', hotelName: 'Mille Collines Hotel', wasteType: 'UCO', volume: 200, unit: 'liters', quality: 'A', photos: [], minBid: 15000, reservePrice: 20000, auctionDuration: '24h', autoAcceptAbove: 25000, specialInstructions: 'Use service entrance at rear', contactPerson: 'Jean Bosco', status: 'open', createdAt: hoursAgo(6), expiresAt: new Date(now.getTime() + 18 * 3600000).toISOString(), bids: [], location: 'Nyarugenge, Kigali' },
    { id: 'WL002', hotelId: 'U002', hotelName: 'Serena Hotel Kigali', wasteType: 'Glass', volume: 150, unit: 'kg', quality: 'A', photos: [], minBid: 8000, reservePrice: 12000, auctionDuration: '12h', autoAcceptAbove: 15000, specialInstructions: 'Sorted by color already', contactPerson: 'Marie Rose', status: 'open', createdAt: hoursAgo(3), expiresAt: new Date(now.getTime() + 9 * 3600000).toISOString(), bids: [], location: 'Kiyovu, Kigali' },
    { id: 'WL003', hotelId: 'U003', hotelName: 'Marriott Hotel Kigali', wasteType: 'Paper/Cardboard', volume: 300, unit: 'kg', quality: 'B', photos: [], minBid: 12000, reservePrice: 18000, auctionDuration: '24h', autoAcceptAbove: 22000, specialInstructions: 'Loading dock access needed', contactPerson: 'Muhire Nkusi', status: 'open', createdAt: hoursAgo(12), expiresAt: new Date(now.getTime() + 12 * 3600000).toISOString(), bids: [], location: 'Kimihurura, Kigali' },
    { id: 'WL004', hotelId: 'U001', hotelName: 'Mille Collines Hotel', wasteType: 'Glass', volume: 80, unit: 'kg', quality: 'B', photos: [], minBid: 5000, reservePrice: 8000, auctionDuration: '6h', autoAcceptAbove: 10000, specialInstructions: '', contactPerson: 'Jean Bosco', status: 'assigned', createdAt: daysAgo(2), expiresAt: daysAgo(1), bids: [{ id: 'B001', listingId: 'WL004', recyclerId: 'U006', recyclerName: 'GreenEnergy Recyclers', amount: 9500, note: 'Can collect today', collectionPreference: 'Morning', status: 'won', createdAt: daysAgo(2) }], assignedRecycler: 'GreenEnergy Recyclers', assignedDriver: 'Jean Pierre Habimana', collectionDate: new Date().toISOString().split('T')[0], location: 'Nyarugenge, Kigali' },
    { id: 'WL005', hotelId: 'U005', hotelName: 'Park Inn by Radisson', wasteType: 'UCO', volume: 100, unit: 'liters', quality: 'A', photos: [], minBid: 8000, reservePrice: 12000, auctionDuration: '24h', autoAcceptAbove: 14000, specialInstructions: 'Available after 2 PM', contactPerson: 'Mutesi Uwase', status: 'completed', createdAt: daysAgo(7), expiresAt: daysAgo(6), bids: [{ id: 'B002', listingId: 'WL005', recyclerId: 'U007', recyclerName: 'EcoProcess Rwanda', amount: 13000, note: '', collectionPreference: 'Afternoon', status: 'won', createdAt: daysAgo(7) }], assignedRecycler: 'EcoProcess Rwanda', assignedDriver: 'Emmanuel Mugisha', location: 'Remera, Kigali' },
  ];

  // Seed Transactions
  const transactions: Transaction[] = [
    { id: 'TX001', date: daysAgo(7), from: 'Park Inn by Radisson', to: 'EcoProcess Rwanda', wasteType: 'UCO', volume: 100, amount: 13000, fee: 650, status: 'completed', listingId: 'WL005' },
    { id: 'TX002', date: daysAgo(3), from: 'Mille Collines Hotel', to: 'GreenEnergy Recyclers', wasteType: 'UCO', volume: 150, amount: 22500, fee: 1125, status: 'completed', listingId: 'WL001' },
    { id: 'TX003', date: daysAgo(1), from: 'Serena Hotel Kigali', to: 'GreenEnergy Recyclers', wasteType: 'Glass', volume: 200, amount: 16000, fee: 800, status: 'pending', listingId: 'WL002' },
    { id: 'TX004', date: daysAgo(14), from: 'Marriott Hotel Kigali', to: 'EcoProcess Rwanda', wasteType: 'Paper/Cardboard', volume: 250, amount: 30000, fee: 1500, status: 'completed', listingId: 'WL003' },
    { id: 'TX005', date: daysAgo(5), from: 'Serena Hotel Kigali', to: 'GreenEnergy Recyclers', wasteType: 'UCO', volume: 180, amount: 27000, fee: 1350, status: 'completed', listingId: 'WL002' },
  ];

  // Seed Collections
  const collections: Collection[] = [
    { id: 'COL001', listingId: 'WL004', hotelName: 'Mille Collines Hotel', recyclerName: 'GreenEnergy Recyclers', driverName: 'Jean Pierre Habimana', driverId: 'U008', wasteType: 'Glass', volume: 80, status: 'scheduled', scheduledDate: new Date().toISOString().split('T')[0], scheduledTime: '14:00', proofPhotos: [], notes: '', location: 'Nyarugenge, Kigali', earnings: 3500 },
    { id: 'COL002', listingId: 'WL005', hotelName: 'Park Inn by Radisson', recyclerName: 'EcoProcess Rwanda', driverName: 'Emmanuel Mugisha', driverId: 'U009', wasteType: 'UCO', volume: 100, status: 'completed', scheduledDate: daysAgo(7).split('T')[0], scheduledTime: '15:00', completedAt: daysAgo(7), proofPhotos: [], actualWeight: 98, rating: 5, notes: 'Smooth collection', location: 'Remera, Kigali', earnings: 4500 },
    { id: 'COL003', listingId: 'WL001', hotelName: 'Mille Collines Hotel', recyclerName: 'GreenEnergy Recyclers', driverName: 'Jean Pierre Habimana', driverId: 'U008', wasteType: 'UCO', volume: 200, status: 'completed', scheduledDate: daysAgo(3).split('T')[0], scheduledTime: '10:00', completedAt: daysAgo(3), proofPhotos: [], actualWeight: 195, rating: 4, notes: '', location: 'Nyarugenge, Kigali', earnings: 5000 },
  ];

  // Seed Support Tickets
  const tickets: SupportTicket[] = [
    { id: 'TK001', userId: 'U001', userName: 'Mille Collines Hotel', subject: 'Payment delay for collection #COL003', message: 'Our payment for the UCO collection on Tuesday has not been received yet. Please check.', status: 'open', priority: 'high', createdAt: daysAgo(1), updatedAt: daysAgo(1), responses: [] },
    { id: 'TK002', userId: 'U008', userName: 'Jean Pierre Habimana', subject: 'Vehicle maintenance needed', message: 'My Toyota Hilux needs brake pad replacement. Next service was due last week.', status: 'in-progress', priority: 'medium', createdAt: daysAgo(3), updatedAt: daysAgo(2), responses: [{ from: 'Admin', message: 'We have scheduled your vehicle for service on Thursday. Please drop it off at 8 AM.', date: daysAgo(2) }] },
  ];

  // Seed Messages
  const messages: Message[] = [
    { id: 'MSG001', from: 'U006', fromName: 'GreenEnergy Recyclers', to: 'U001', toName: 'Mille Collines Hotel', subject: 'UCO Collection Schedule', body: 'Hello, we would like to schedule the UCO collection for tomorrow morning at 10 AM. Is that convenient?', date: hoursAgo(4), read: false, replies: [] },
    { id: 'MSG002', from: 'U012', fromName: 'Admin', to: 'U006', toName: 'GreenEnergy Recyclers', subject: 'License Renewal Reminder', body: 'Your recycling license REC-2024-001 expires in 30 days. Please submit renewal documents.', date: daysAgo(2), read: true, replies: [{ from: 'U006', fromName: 'GreenEnergy Recyclers', body: 'Thank you for the reminder. We will submit the documents next week.', date: daysAgo(1) }] },
  ];

  // Seed Driver Routes
  const routes: DriverRoute[] = [
    {
      id: 'DR001', driverId: 'U008', date: new Date().toISOString().split('T')[0],
      stops: [
        { id: 'S001', hotelName: 'Mille Collines Hotel', location: 'Nyarugenge', wasteType: 'UCO', volume: 200, eta: '09:00', status: 'completed', contactPerson: 'Jean Bosco', contactPhone: '+250 780 162 164', specialInstructions: 'Service entrance', actualWeight: 195, photos: [], completedAt: hoursAgo(3) },
        { id: 'S002', hotelName: 'Serena Hotel Kigali', location: 'Kiyovu', wasteType: 'Glass', volume: 150, eta: '10:30', status: 'pending', contactPerson: 'Marie Rose', contactPhone: '+250 780 162 164', specialInstructions: '', photos: [] },
        { id: 'S003', hotelName: 'Marriott Hotel Kigali', location: 'Kimihurura', wasteType: 'Paper/Cardboard', volume: 300, eta: '12:00', status: 'pending', contactPerson: 'Muhire Nkusi', contactPhone: '+250 780 162 164', specialInstructions: 'Loading dock', photos: [] },
      ],
      status: 'in-progress', totalDistance: 28, estimatedEarnings: 12500, startTime: '08:30'
    },
  ];

  // Seed RecyclingEvents
  const recyclingEvents: RecyclingEvent[] = [
    { id: 'RE001', userId: 'U011', userName: 'Marie Claire Umutoni', date: daysAgo(3).split('T')[0], wasteType: 'Plastic', weight: 5, location: 'Kicukiro Collection Point', points: 50, notes: '', verified: true },
    { id: 'RE002', userId: 'U011', userName: 'Marie Claire Umutoni', date: daysAgo(6).split('T')[0], wasteType: 'Paper/Cardboard', weight: 8, location: 'Kicukiro Collection Point', points: 40, notes: '', verified: true },
    { id: 'RE003', userId: 'U011', userName: 'Marie Claire Umutoni', date: daysAgo(9).split('T')[0], wasteType: 'Glass', weight: 3, location: 'Gasabo Eco-Center', points: 45, notes: '', verified: false },
    { id: 'RE004', userId: 'U011', userName: 'Marie Claire Umutoni', date: daysAgo(15).split('T')[0], wasteType: 'Organic Waste', weight: 12, location: 'Kicukiro Collection Point', points: 36, notes: 'Compost bin drop-off', verified: true },
    { id: 'RE005', userId: 'U011', userName: 'Marie Claire Umutoni', date: daysAgo(20).split('T')[0], wasteType: 'Plastic', weight: 7, location: 'Kicukiro Collection Point', points: 70, notes: '', verified: true },
    { id: 'RE006', userId: 'U011', userName: 'Marie Claire Umutoni', date: daysAgo(25).split('T')[0], wasteType: 'Metal', weight: 2, location: 'Gasabo Eco-Center', points: 60, notes: '', verified: true },
  ];

  store.users = users;
  store.listings = listings;
  store.transactions = transactions;
  store.collections = collections;
  store.supportTickets = tickets;
  store.messages = messages;
  store.driverRoutes = routes;
  store.recyclingEvents = recyclingEvents;
  store.auditLogs = [];
  store._seeded = true;
  setStore(store);
}
