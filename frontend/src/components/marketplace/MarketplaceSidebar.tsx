// components/marketplace/MarketplaceSidebar.tsx
import { Sliders } from 'lucide-react';

interface MarketplaceSidebarProps {
  filters: any;
  setFilters: (filters: any) => void;
  listings: any[];
  isMobile?: boolean;
  onClose?: () => void;
}

// All known DB waste-type categories displayed in the sidebar
const ALL_WASTE_TYPES = [
  { id: 'Metal',     label: 'Metal Scraps' },
  { id: 'Cardboard', label: 'Cardboard / Paper' },
  { id: 'UCO',       label: 'Used Cooking Oil' },
  { id: 'Glass',     label: 'Glass Bottles' },
  { id: 'Organic',   label: 'Organic Waste' },
  { id: 'Plastic',   label: 'Plastic' },
  { id: 'Mixed',     label: 'Mixed Recyclables' },
];

const KIGALI_DISTRICTS = ['Nyarugenge', 'Gasabo', 'Kicukiro'];

const MarketplaceSidebar = ({ filters, setFilters, listings, isMobile, onClose }: MarketplaceSidebarProps) => {
  // Show all known types; count against listings prop so badges reflect current data
  const wasteTypes = ALL_WASTE_TYPES.map(t => ({
    ...t,
    count: listings.filter(l => l.category === t.id || l.type === t.id).length,
  }));

  // Derive unique districts from listing addresses; fall back to the three main districts
  const locationSet = new Set<string>(KIGALI_DISTRICTS);
  listings.forEach(l => {
    if (typeof l.location === 'string') {
      KIGALI_DISTRICTS.forEach(d => { if (l.location.includes(d)) locationSet.add(d); });
    }
  });
  const locations = Array.from(locationSet).sort();

  const handleWasteTypeChange = (type: string) => {
    const newTypes = filters.wasteTypes.includes(type)
      ? filters.wasteTypes.filter((t: string) => t !== type)
      : [...filters.wasteTypes, type];
    setFilters({ ...filters, wasteTypes: newTypes });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, distance: parseInt(e.target.value) });
  };

  const handleVolumeChange = (type: 'min' | 'max', value: number) => {
    setFilters({ ...filters, [`${type}Volume`]: value });
  };

  const handleRatingChange = (rating: number) => {
    setFilters({ ...filters, businessRating: rating });
  };

  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sortBy: sort });
  };

  const clearFilters = () => {
    setFilters({
      wasteTypes: [],
      location: '',
      distance: 10,
      minVolume: 0,
      maxVolume: 1000,
      businessRating: 0,
      timeRemaining: '',
      sortBy: 'newest'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sliders className="w-5 h-5 text-cyan-600 mr-2" />
          <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
        >
          Clear all
        </button>
      </div>

      {/* Sort By */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h4>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="newest">Newest First</option>
          <option value="ending-soon">Ending Soon</option>
          <option value="nearest">Nearest</option>
          <option value="highest-volume">Highest Volume</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
        </select>
      </div>

      {/* Waste Type */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Waste Type</h4>
        <div className="space-y-2">
          {wasteTypes.map((type) => (
            <label key={type.id} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.wasteTypes.includes(type.id)}
                  onChange={() => handleWasteTypeChange(type.id)}
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300 dark:border-gray-600 focus:ring-cyan-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">({type.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Location</h4>
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Districts</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Distance */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Distance (km)</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="20"
            value={filters.distance}
            onChange={handleDistanceChange}
            className="w-full accent-cyan-600"
          />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Within {filters.distance} km</span>
          </div>
        </div>
      </div>

      {/* Volume Range */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Volume (kg)</h4>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={filters.minVolume}
            onChange={(e) => handleVolumeChange('min', parseInt(e.target.value))}
            placeholder="Min"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="number"
            value={filters.maxVolume}
            onChange={(e) => handleVolumeChange('max', parseInt(e.target.value))}
            placeholder="Max"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Business Rating */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Business Rating</h4>
        <div className="flex items-center space-x-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filters.businessRating === rating
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {rating}+ ★
            </button>
          ))}
        </div>
      </div>

      {/* Time Remaining */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Time Remaining</h4>
        <select
          value={filters.timeRemaining}
          onChange={(e) => setFilters({ ...filters, timeRemaining: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Any time</option>
          <option value="1h">Last hour</option>
          <option value="3h">Last 3 hours</option>
          <option value="6h">Last 6 hours</option>
          <option value="12h">Last 12 hours</option>
          <option value="24h">Last 24 hours</option>
        </select>
      </div>

      {/* Apply Filters Button (for mobile) */}
      {isMobile && (
        <button
          type="button"
          onClick={() => onClose?.()}
          className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
};

export default MarketplaceSidebar;