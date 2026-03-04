// components/marketplace/MarketplaceFilters.tsx
// Note: Primary marketplace filtering is handled by MarketplaceSidebar component
// This component provides a compact filter bar for quick filtering

import { Search, SlidersHorizontal } from 'lucide-react';

interface MarketplaceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

const MarketplaceFilters = ({ searchQuery, onSearchChange, onOpenFilters, activeFilterCount }: MarketplaceFiltersProps) => {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search listings by hotel, waste type, or location..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-900"
        />
      </div>

      {/* Filter Toggle Button */}
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors relative"
      >
        <SlidersHorizontal size={18} />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-600 text-white text-xs rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default MarketplaceFilters;
