import { CheckCircle, Clock, Truck } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const RecyclerPurchasesSection = () => {
  const [purchases] = useState([
    { id: 1, date: '2026-02-19', seller: 'Park Inn by Radisson', material: 'UCO', quantity: '100L', amount: 13000, status: 'completed', driver: 'Emmanuel Mugisha' },
    { id: 2, date: '2026-02-23', seller: 'Mille Collines Hotel', material: 'UCO', quantity: '150L', amount: 22500, status: 'completed', driver: 'Jean Pierre Habimana' },
    { id: 3, date: '2026-02-25', seller: 'Serena Hotel Kigali', material: 'Glass', quantity: '150kg', amount: 11500, status: 'in-transit', driver: 'Jean Pierre Habimana' },
  ]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} className="text-cyan-600" />;
      case 'in-transit': return <Truck size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'scheduled': return <Clock size={16} className="text-amber-600 dark:text-amber-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400';
      case 'in-transit': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'scheduled': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Purchases</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Seller</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Material</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Driver</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <motion.tr key={purchase.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{purchase.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{purchase.seller}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{purchase.material}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{purchase.quantity}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Rwf {(purchase.amount ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(purchase.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(purchase.status)}`}>
                      {purchase.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{purchase.driver}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecyclerPurchasesSection;
