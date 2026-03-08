// Shared mock data and utilities for the individual/user dashboard
// Data is fetched from the backend API, not from mock data


// DEPRECATED: These are placeholders to maintain backward compatibility
// Use the hooks below instead to fetch real data from the backend
export const userProfile = {
  name: 'User',
  email: 'user@example.com',
  location: 'Kigali',
  memberSince: new Date().toISOString(),
  greenScore: 0,
  totalRecycled: 0,
  co2Saved: 0,
  totalSpent: 0,
  ordersCompleted: 0,
};

export const recyclingHistory: any[] = [];
export const userOrders: any[] = [];
export const impactTrend = { labels: [], datasets: [] };
export const wasteByType = { labels: [], datasets: [] };
export const spendingTrend = { labels: [], datasets: [] };
export const marketplaceListings: any[] = [];
export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', in_transit: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};
