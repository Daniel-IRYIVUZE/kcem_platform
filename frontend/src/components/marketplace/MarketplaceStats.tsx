// components/marketplace/MarketplaceStats.tsx
import { Package, Factory, TrendingUp, Clock } from 'lucide-react';

interface MarketplaceStatsProps {
  listings: any[];
}

const MarketplaceStats = ({ listings }: MarketplaceStatsProps) => {
  const totalVolume = listings.reduce((acc, curr) => acc + curr.volume, 0);
  const uniqueBusinesses = new Set(listings.map((l: any) => l.business || l.hotel_name)).size;
  const activeBids = listings.reduce((acc, curr) => acc + curr.bidCount, 0);

  return (
    <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Active Listings</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{listings.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Active Businesses</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{uniqueBusinesses}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total Volume</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{Math.round(totalVolume).toLocaleString()} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-yellow-700/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-700" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Active Bids</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{activeBids}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStats;