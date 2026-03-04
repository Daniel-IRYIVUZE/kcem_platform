// components/dashboard/business/_shared.tsx
import { getAll } from '../../../utils/dataStore';
import type { WasteListing, PlatformUser } from '../../../utils/dataStore';

export const getHotelProfile = () => {
  const all = getAll<WasteListing>('listings');
  const users = getAll<PlatformUser>('users');
  const hotel = users.find(u => u.role === 'business') || ({ name: 'Hotel Mille Collines', location: 'KG 2 Ave, Kigali', greenScore: 92 } as any);
  return { name: hotel.name, location: hotel.location || 'Nyarugenge, Kigali', totalListings: all.length, activeListings: all.filter(l => l.status === 'open').length, totalRevenue: 342000, monthlyRevenue: 57000, greenScore: hotel.greenScore || 78, memberSince: hotel.joinDate || '2025-08-29', collectionsCompleted: 2, pendingCollections: all.filter(l => l.status === 'assigned').length };
};
export const hotelProfile = getHotelProfile();

export const revenueTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [35000, 40000, 45000, 50000, 55000, 60000, 65000], borderColor: '#0891b2', backgroundColor: '#0891b2' }],
};

export const wasteBreakdown = {
  labels: ['UCO', 'Glass', 'Paper/Cardboard', 'Organic Waste'],
  datasets: [{ data: [40, 25, 20, 15] }],
};

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    collecting: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200', in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200', 'en-route': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    bid_accepted: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', expired: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200', open: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
    assigned: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', collected: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', missed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    verified: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', disputed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200', refunded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};
