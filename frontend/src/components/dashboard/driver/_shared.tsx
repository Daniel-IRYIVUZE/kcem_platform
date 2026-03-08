// components/dashboard/driver/_shared.tsx

// Data is fetched from the backend API, not from mock data


// DEPRECATED: These are placeholders to maintain backward compatibility
// Use the hooks below instead to fetch real data from the backend
export const driverProfile = {
  name: 'Driver',
  company: 'EcoTrade Rwanda',
  vehicle: 'Vehicle',
  plate: 'Plate',
  capacity: '0 kg',
  phone: '+250',
  rating: 0,
  totalTrips: 0,
  completedToday: 0,
  remainingToday: 0,
  totalEarnings: 0,
  monthlyEarnings: 0,
};

export const todaysStops: any[] = [];
export const assignments: any[] = [];
export const completedJobs: any[] = [];
export const earningsData = { labels: [], datasets: [] };
export const monthlyEarnings = { labels: [], datasets: [] };
export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', scheduled: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};
