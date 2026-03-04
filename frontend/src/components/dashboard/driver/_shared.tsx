// components/dashboard/driver/_shared.tsx

export const driverProfile = {
  name: 'Jean Pierre Habimana',
  company: 'EcoTrade Rwanda',
  vehicle: 'Toyota Hilux',
  plate: 'RAC 123 A',
  capacity: '1,500 kg',
  phone: '+250 780 162 164',
  rating: 4.9,
  totalTrips: 187,
  completedToday: 3,
  remainingToday: 2,
  totalEarnings: 750000,
  monthlyEarnings: 85000,
};

export const todaysStops = [
  { id: 1, hotel: 'Serena Hotel Kigali', address: 'KN 3 Ave, Nyarugenge', type: 'UCO', quantity: '500 L', time: '09:00 AM', status: 'completed', contact: '+250 780 162 164', notes: 'Loading dock B' },
  { id: 2, hotel: 'Marriott Hotel Kigali', address: 'KG 511 St, Kacyiru', type: 'Organic Waste', quantity: '450 kg', time: '10:30 AM', status: 'completed', contact: '+250 780 162 164', notes: 'Service entrance' },
  { id: 3, hotel: 'Radisson Blu Kigali', address: 'KN 67 St, Kiyovu', type: 'Paper/Cardboard', quantity: '200 kg', time: '12:00 PM', status: 'completed', contact: '+250 780 162 164', notes: 'Ask for Jean' },
  { id: 4, hotel: 'Hotel Mille Collines', address: 'KG 2 Ave, Kigali', type: 'UCO', quantity: '300 L', time: '02:00 PM', status: 'in_progress', contact: '+250 780 162 164', notes: 'Main kitchen entrance' },
  { id: 5, hotel: 'Lemigo Hotel', address: 'KG 7 Ave, Kimihurura', type: 'Glass', quantity: '180 kg', time: '03:30 PM', status: 'pending', contact: '+250 780 162 164', notes: 'Basement storage' },
];

export const assignments = [
  { id: 'RT-001', date: '2026-02-26', route: 'KG-01', stops: 3, totalWeight: '580 kg', estimatedTime: '4h 00m', status: 'in_progress', earnings: 'RWF 12,500' },
  { id: 'RT-002', date: '2026-02-27', route: 'KG-03', stops: 2, totalWeight: '380 kg', estimatedTime: '2h 30m', status: 'scheduled', earnings: 'RWF 8,500' },
  { id: 'RT-003', date: '2026-02-28', route: 'KG-01', stops: 3, totalWeight: '650 kg', estimatedTime: '4h 30m', status: 'scheduled', earnings: 'RWF 14,000' },
  { id: 'RT-004', date: '2026-03-01', route: 'KG-05', stops: 2, totalWeight: '280 kg', estimatedTime: '2h 00m', status: 'scheduled', earnings: 'RWF 7,500' },
  { id: 'RT-005', date: '2026-03-02', route: 'KG-02', stops: 3, totalWeight: '500 kg', estimatedTime: '3h 30m', status: 'scheduled', earnings: 'RWF 11,000' },
];

export const completedJobs = [
  { id: 'RT-100', date: '2026-02-25', route: 'KG-02', stops: 3, totalWeight: '493 kg', duration: '3h 45m', earnings: 'RWF 13,000', rating: 4.9, issues: 'None' },
  { id: 'RT-099', date: '2026-02-24', route: 'KG-01', stops: 2, totalWeight: '296 kg', duration: '2h 30m', earnings: 'RWF 9,000', rating: 4.8, issues: 'None' },
  { id: 'RT-098', date: '2026-02-23', route: 'KG-03', stops: 3, totalWeight: '548 kg', duration: '4h 00m', earnings: 'RWF 15,000', rating: 4.7, issues: 'Traffic delay' },
  { id: 'RT-097', date: '2026-02-22', route: 'KG-01', stops: 2, totalWeight: '393 kg', duration: '3h 00m', earnings: 'RWF 10,000', rating: 5.0, issues: 'None' },
  { id: 'RT-096', date: '2026-02-21', route: 'KG-05', stops: 2, totalWeight: '258 kg', duration: '2h 15m', earnings: 'RWF 8,000', rating: 4.8, issues: 'None' },
  { id: 'RT-095', date: '2026-02-20', route: 'KG-02', stops: 3, totalWeight: '450 kg', duration: '3h 30m', earnings: 'RWF 12,000', rating: 4.6, issues: 'Late start' },
  { id: 'RT-094', date: '2026-02-19', route: 'KG-01', stops: 2, totalWeight: '295 kg', duration: '2h 00m', earnings: 'RWF 9,500', rating: 4.9, issues: 'None' },
  { id: 'RT-093', date: '2026-02-18', route: 'KG-03', stops: 3, totalWeight: '530 kg', duration: '3h 45m', earnings: 'RWF 14,000', rating: 4.7, issues: 'None' },
];

export const earningsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{ data: [12000, 9000, 15000, 5000, 10000, 11000, 0], borderColor: '#0891b2', backgroundColor: '#0891b2' }],
};

export const monthlyEarnings = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [55000, 58000, 62000, 67000, 72000, 78000, 85000], borderColor: '#7c3aed', backgroundColor: '#7c3aed' }],
};

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', scheduled: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};
