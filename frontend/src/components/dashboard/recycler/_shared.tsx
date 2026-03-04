// Shared mock data and utilities for the recycler dashboard
export const companyProfile = {
  name: 'GreenEnergy Recyclers',
  location: 'Kicukiro Industrial Zone, Kigali',
  fleetSize: 2,
  activeBids: 3,
  bidsWon: 2,
  totalCollected: 375,
  totalRevenue: 120000,
  monthlyRevenue: 18000,
  greenScore: 88,
};

export const fleetData = [
  { id: 1, driver: 'Jean Pierre Habimana', vehicle: 'Toyota Hilux', plate: 'RAC 123 A', capacity: '1,500 kg', status: 'active', trips: 187, rating: 4.9, currentRoute: 'KG-01' },
  { id: 2, driver: 'Emmanuel Mugisha', vehicle: 'Isuzu NPR', plate: 'RAD 456 B', capacity: '2,000 kg', status: 'active', trips: 143, rating: 4.6, currentRoute: '—' },
];

export const inventoryData = [
  { id: 1, type: 'UCO', currentStock: '200 L', capacity: '500 L', utilization: 40, lastUpdated: '2026-02-23', value: 'RWF 22,500' },
  { id: 2, type: 'Glass', currentStock: '80 kg', capacity: '300 kg', utilization: 27, lastUpdated: '2026-02-23', value: 'RWF 9,500' },
  { id: 3, type: 'Paper/Cardboard', currentStock: '0 kg', capacity: '200 kg', utilization: 0, lastUpdated: '2026-02-26', value: 'RWF 0' },
];

export const revenueTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [5000, 8000, 10000, 12000, 15000, 17000, 18000], borderColor: '#0891b2', backgroundColor: '#0891b2' }],
};

export const collectionsByType = {
  labels: ['UCO', 'Glass', 'Paper/Cardboard'],
  datasets: [{ data: [200, 80, 0] }],
};

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', won: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    winning: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300', pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    collecting: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200', outbid: 'bg-orange-100 dark:bg-yellow-700/30 text-yellow-700 dark:text-yellow-700', lost: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    maintenance: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};
