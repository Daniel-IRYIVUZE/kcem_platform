import { Truck, CheckCircle, Map, DollarSign, Clock, Navigation } from 'lucide-react';
import { useState } from 'react';

const DriverOverviewSection = () => {
  const [stats] = useState({
    totalDeliveries: 287,
    completedToday: 12,
    activeRoutes: 3,
    earningsToday: 125000,
    averageDeliveryTime: 22,
    distanceTraveled: 1245
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Total Deliveries</span>
          <Truck size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalDeliveries}</div>
        <p className="text-xs text-gray-500 mt-1">Lifetime total</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Completed Today</span>
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completedToday}</div>
        <p className="text-xs text-gray-500 mt-1">Successful deliveries</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Active Routes</span>
          <Map size={20} className="text-amber-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeRoutes}</div>
        <p className="text-xs text-gray-500 mt-1">On road now</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Today's Earnings</span>
          <DollarSign size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">Rwf {(stats.earningsToday / 1000).toFixed(0)}K</div>
        <p className="text-xs text-gray-500 mt-1">Today's commission</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Avg Delivery Time</span>
          <Clock size={20} className="text-blue-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averageDeliveryTime} min</div>
        <p className="text-xs text-gray-500 mt-1">Average per delivery</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Distance Today</span>
          <Navigation size={20} className="text-purple-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.distanceTraveled} km</div>
        <p className="text-xs text-gray-500 mt-1">Total travelled</p>
      </div>
    </section>
  );
};

export default DriverOverviewSection;
