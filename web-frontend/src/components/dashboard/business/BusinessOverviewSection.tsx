import { Package, DollarSign, Leaf, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const BusinessOverviewSection = () => {
  const [stats] = useState({
    totalListings: 45,
    activeListings: 12,
    totalRevenue: 450000,
    pendingPickups: 3,
    wasteReduction: 2500
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Total Listings</span>
          <Package size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalListings}</div>
        <p className="text-xs text-gray-500 mt-1">All time listings</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Active Now</span>
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeListings}</div>
        <p className="text-xs text-gray-500 mt-1">Available for pickup</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
          <DollarSign size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">Rwf {(stats.totalRevenue / 1000).toFixed(0)}K</div>
        <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Pending Pickups</span>
          <AlertCircle size={20} className="text-amber-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pendingPickups}</div>
        <p className="text-xs text-gray-500 mt-1">Waiting for pickup</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Waste Reduced</span>
          <Leaf size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.wasteReduction}kg</div>
        <p className="text-xs text-gray-500 mt-1">Diverted from landfill</p>
      </div>
    </section>
  );
};

export default BusinessOverviewSection;
