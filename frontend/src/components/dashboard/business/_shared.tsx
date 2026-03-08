// components/dashboard/business/_shared.tsx
// Data is fetched from the backend API, not from mock data

// DEPRECATED: These are placeholders to maintain backward compatibility
// Use backend API hooks to fetch real data
export const hotelProfile = {
  name: 'Hotel',
  location: 'Kigali',
  totalListings: 0,
  activeListings: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  greenScore: 0,
  memberSince: new Date().toISOString(),
  collectionsCompleted: 0,
  pendingCollections: 0,
};

export const revenueTrend = { labels: [], datasets: [] };
export const wasteBreakdown = { labels: [], datasets: [] };

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
