import { Package, DollarSign, ShoppingCart, Leaf, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const RecyclerOverviewSection = () => {
  const [stats] = useState({
    totalPurchases: 2,
    activeBids: 3,
    totalSpent: 49500,
    materialsProcessed: 375,
    savedAmount: 15000
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Purchases</span>
          <ShoppingCart size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPurchases}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All transactions</p>
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
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Rwf {(stats.totalSpent / 1000000).toFixed(1)}M</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime investment</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Materials Processed</span>
          <Package size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{(stats.materialsProcessed / 1000).toFixed(0)}K kg</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total processed</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Cost Savings</span>
          <Leaf size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Rwf {(stats.savedAmount / 1000).toFixed(0)}K</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Route optimization</p>
      </div>
    </section>
  );
};

export default RecyclerOverviewSection;
