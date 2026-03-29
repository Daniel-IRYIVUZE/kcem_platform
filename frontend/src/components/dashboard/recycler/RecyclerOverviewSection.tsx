import { Package, DollarSign, ShoppingCart, Leaf, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { bidsAPI, transactionsAPI, inventoryAPI } from '../../../services/api';

const RecyclerOverviewSection = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    activeBids: 0,
    totalSpent: 0,
    materialsProcessed: 0,
    savedAmount: 0,
  });

  useEffect(() => {
    Promise.all([
      bidsAPI.mine({ limit: 500 }).catch(() => []),
      transactionsAPI.mine({ limit: 500 }).catch(() => []),
      inventoryAPI.mine().catch(() => []),
    ]).then(([bids, transactions, inventory]) => {
      const activeBids = bids.filter((b: { status: string }) => b.status === 'active').length;
      const totalPurchases = transactions.filter((t: { status: string }) => t.status === 'completed').length;
      const totalSpent = transactions
        .filter((t: { status: string }) => t.status === 'completed')
        .reduce((s: number, t: { gross_amount?: number }) => s + (t.gross_amount || 0), 0);
      const materialsProcessed = (inventory as { quantity?: number; weight_kg?: number }[]).reduce(
        (s: number, i: { quantity?: number; weight_kg?: number }) => s + (i.weight_kg || i.quantity || 0),
        0
      );
      // Savings estimate: difference between gross and net amounts paid (platform fee saved via bulk)
      const savedAmount = transactions
        .filter((t: { status: string }) => t.status === 'completed')
        .reduce((s: number, t: { gross_amount?: number; net_amount?: number }) =>
          s + Math.max(0, (t.net_amount || 0) - (t.gross_amount || 0)), 0
        );
      setStats({ totalPurchases, activeBids, totalSpent, materialsProcessed, savedAmount });
    });
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Purchases</span>
          <ShoppingCart size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPurchases}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed transactions</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Bids</span>
          <CheckCircle size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.activeBids}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current negotiations</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Spent</span>
          <DollarSign size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Rwf {stats.totalSpent >= 1_000_000
            ? `${(stats.totalSpent / 1_000_000).toFixed(1)}M`
            : `${(stats.totalSpent / 1000).toFixed(0)}K`}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime investment</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Materials Processed</span>
          <Package size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {stats.materialsProcessed >= 1000
            ? `${(stats.materialsProcessed / 1000).toFixed(1)}K`
            : stats.materialsProcessed.toFixed(0)} kg
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In inventory</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Net Earnings</span>
          <Leaf size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Rwf {stats.savedAmount >= 1_000_000
            ? `${(stats.savedAmount / 1_000_000).toFixed(1)}M`
            : `${(stats.savedAmount / 1000).toFixed(0)}K`}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">From resale</p>
      </div>
    </section>
  );
};

export default RecyclerOverviewSection;
