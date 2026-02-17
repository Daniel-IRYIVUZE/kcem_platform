import { Package, DollarSign, TrendingUp, ShoppingCart, Leaf, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const RecyclerOverviewSection = () => {
  const [stats] = useState({
    totalPurchases: 156,
    activeBids: 8,
    totalSpent: 2500000,
    materialsProcessed: 15000,
    savedAmount: 450000
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Total Purchases</span>
          <ShoppingCart size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalPurchases}</div>
        <p className="text-xs text-gray-500 mt-1">All transactions</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Active Bids</span>
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeBids}</div>
        <p className="text-xs text-gray-500 mt-1">Current negotiations</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Total Spent</span>
          <DollarSign size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">Rwf {(stats.totalSpent / 1000000).toFixed(1)}M</div>
        <p className="text-xs text-gray-500 mt-1">Lifetime investment</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Materials Processed</span>
          <Package size={20} className="text-amber-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{(stats.materialsProcessed / 1000).toFixed(0)}K kg</div>
        <p className="text-xs text-gray-500 mt-1">Total processed</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Cost Savings</span>
          <Leaf size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">Rwf {(stats.savedAmount / 1000).toFixed(0)}K</div>
        <p className="text-xs text-gray-500 mt-1">Route optimization</p>
      </div>
    </section>
  );
};

export default RecyclerOverviewSection;
