// Shared mock data and utilities for the individual/user dashboard
export const userProfile = {
  name: 'Marie Uwimana',
  email: 'individual@ecotrade.rw',
  location: 'Kicukiro, Kigali',
  memberSince: '2024-05-20',
  greenScore: 74,
  totalRecycled: 85,
  co2Saved: 110,
  totalSpent: 125000,
  ordersCompleted: 8,
};

export const marketplaceListings = [
  { id: 'ML-001', seller: 'EcoShop Kigali', item: 'Recycled Paper Notebooks (5-pack)', category: 'Stationery', price: 'RWF 3,500', rating: 4.7, inStock: true },
  { id: 'ML-002', seller: 'Green Living Rwanda', item: 'Bamboo Toothbrush Set', category: 'Personal Care', price: 'RWF 2,800', rating: 4.9, inStock: true },
  { id: 'ML-003', seller: 'Rwanda Recycling Co', item: 'Compost Bin (20L)', category: 'Garden', price: 'RWF 15,000', rating: 4.5, inStock: true },
  { id: 'ML-004', seller: 'EcoShop Kigali', item: 'Recycled Glass Vases', category: 'Home Decor', price: 'RWF 8,500', rating: 4.6, inStock: true },
  { id: 'ML-005', seller: 'CleanTech Store', item: 'Biodegradable Trash Bags (50-pack)', category: 'Household', price: 'RWF 4,200', rating: 4.4, inStock: false },
  { id: 'ML-006', seller: 'Green Living Rwanda', item: 'Reusable Shopping Bags (3-pack)', category: 'Lifestyle', price: 'RWF 5,500', rating: 4.8, inStock: true },
  { id: 'ML-007', seller: 'EcoShop Kigali', item: 'Solar-Powered Phone Charger', category: 'Electronics', price: 'RWF 25,000', rating: 4.3, inStock: true },
  { id: 'ML-008', seller: 'Rwanda Recycling Co', item: 'Recycled Plastic Planter Set', category: 'Garden', price: 'RWF 12,000', rating: 4.5, inStock: true },
];

export const userOrders = [
  { id: 'ORD-001', date: '2024-07-03', items: 'Bamboo Toothbrush Set', seller: 'Green Living Rwanda', amount: 'RWF 2,800', status: 'delivered', tracking: 'KG-12345' },
  { id: 'ORD-002', date: '2024-07-01', items: 'Recycled Paper Notebooks', seller: 'EcoShop Kigali', amount: 'RWF 3,500', status: 'delivered', tracking: 'KG-12344' },
  { id: 'ORD-003', date: '2024-06-28', items: 'Compost Bin (20L)', seller: 'Rwanda Recycling Co', amount: 'RWF 15,000', status: 'delivered', tracking: 'KG-12343' },
  { id: 'ORD-004', date: '2024-06-25', items: 'Reusable Shopping Bags', seller: 'Green Living Rwanda', amount: 'RWF 5,500', status: 'delivered', tracking: 'KG-12342' },
  { id: 'ORD-005', date: '2024-07-04', items: 'Solar Phone Charger', seller: 'EcoShop Kigali', amount: 'RWF 25,000', status: 'in_transit', tracking: 'KG-12346' },
  { id: 'ORD-006', date: '2024-07-05', items: 'Recycled Glass Vases', seller: 'EcoShop Kigali', amount: 'RWF 8,500', status: 'processing', tracking: '—' },
  { id: 'ORD-007', date: '2024-06-20', items: 'Biodegradable Bags', seller: 'CleanTech Store', amount: 'RWF 4,200', status: 'delivered', tracking: 'KG-12341' },
  { id: 'ORD-008', date: '2024-06-15', items: 'Recycled Planter Set', seller: 'Rwanda Recycling Co', amount: 'RWF 12,000', status: 'delivered', tracking: 'KG-12340' },
];

export const recyclingHistory = [
  { id: 1, date: '2024-07-04', type: 'Plastic', weight: '5 kg', points: 50, location: 'Kicukiro Collection Point' },
  { id: 2, date: '2024-07-01', type: 'Paper/Cardboard', weight: '8 kg', points: 40, location: 'Kicukiro Collection Point' },
  { id: 3, date: '2024-06-28', type: 'Glass', weight: '3 kg', points: 45, location: 'Gasabo Eco-Center' },
  { id: 4, date: '2024-06-25', type: 'Organic Waste', weight: '12 kg', points: 36, location: 'Kicukiro Collection Point' },
  { id: 5, date: '2024-06-20', type: 'Plastic', weight: '7 kg', points: 70, location: 'Kicukiro Collection Point' },
  { id: 6, date: '2024-06-15', type: 'Metal', weight: '2 kg', points: 60, location: 'Gasabo Eco-Center' },
];

export const impactTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [5, 12, 20, 35, 52, 72, 85], borderColor: '#059669', backgroundColor: '#059669' }],
};

export const spendingTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [0, 0, 12000, 8500, 20500, 49200, 34800], borderColor: '#0891b2', backgroundColor: '#0891b2' }],
};

export const wasteByType = {
  labels: ['Plastic', 'Paper/Cardboard', 'Glass', 'Organic', 'Metal'],
  datasets: [{ data: [35, 25, 15, 18, 7] }],
};

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', in_transit: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};
