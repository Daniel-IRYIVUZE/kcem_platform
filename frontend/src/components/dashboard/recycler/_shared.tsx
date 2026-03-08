// Shared utilities for the recycler dashboard
// Data is fetched from the backend API, not from mock data

// DEPRECATED: These are placeholders to maintain backward compatibility
// Use backend API hooks to fetch real data
export const companyProfile = {
  name: 'GreenEnergy Recyclers',
  location: 'Kicukiro Industrial Zone, Kigali',
  fleetSize: 0,
  activeBids: 0,
  bidsWon: 0,
  totalCollected: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  greenScore: 0,
};

export const fleetData: any[] = [];
export const inventoryData: any[] = [];
export const revenueTrend = { labels: [], datasets: [] };
export const collectionsByType = { labels: [], datasets: [] };

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    won: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    winning: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    collecting: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    outbid: 'bg-orange-100 dark:bg-yellow-700/30 text-yellow-700 dark:text-yellow-700',
    lost: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    maintenance: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
