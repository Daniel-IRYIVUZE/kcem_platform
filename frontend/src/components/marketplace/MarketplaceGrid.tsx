// components/marketplace/MarketplaceGrid.tsx
import { MapPin, Clock, Eye, Heart, CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';

interface MarketplaceGridProps {
  listings: any[];
  onListingClick: (listing: any) => void;
  onBidClick: (listing: any) => void;
  onClearFilters: () => void;
}

const MarketplaceGrid = ({ listings, onListingClick, onBidClick, onClearFilters }: MarketplaceGridProps) => {
  const [savedListings, setSavedListings] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSavedListings(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const getTimeColor = (timeLeft: string) => {
    if (timeLeft.includes('1h') || timeLeft.includes('45m')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    if (timeLeft.includes('2h')) return 'text-yellow-700 bg-orange-50';
    return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20';
  };

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl">
        <p className="text-gray-500 dark:text-gray-400">No listings match your filters.</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden cursor-pointer flex flex-col"
          onClick={() => onListingClick(listing)}
        >
          {/* Image */}
          <div className="relative h-40 overflow-hidden flex-shrink-0">
            <img
              src={listing.image}
              alt={listing.type}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
            />
            
            {/* Save Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSave(listing.id);
              }}
              className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:bg-gray-900 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  savedListings.includes(listing.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </button>

            {/* Time Left */}
            <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getTimeColor(listing.timeLeft)}`}>
              <Clock className="w-3 h-3 inline mr-1" />
              {listing.timeLeft}
            </div>

            {/* Bid Count */}
            <div className="absolute top-3 left-3 bg-cyan-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              {listing.bidCount} bids
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            {/* Business Info */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1 min-w-0">{listing.business}</h3>
              {listing.verified && (
                <span className="text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            {/* Rating + Type row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(listing.businessRating)
                        ? 'fill-yellow-700 text-yellow-700'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{listing.businessRating}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                listing.quality === 'Grade A' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' :
                listing.quality === 'Grade B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>{listing.quality}</span>
            </div>

            {/* Waste Type */}
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{listing.type}</p>

            {/* Location & Distance */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{listing.location} • {listing.distance} km</span>
            </div>

            {/* Volume & Current Bid */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Volume</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(listing.volume).toLocaleString()} {listing.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500">Current Bid</p>
                <p className="text-sm font-bold text-cyan-600">RWF {Math.round(listing.currentBid).toLocaleString()}</p>
              </div>
            </div>

            {/* Actions — pushed to bottom */}
            <div className="flex gap-2 mt-auto pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBidClick(listing);
                }}
                className="flex-1 bg-cyan-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-cyan-700 transition-colors"
              >
                Place Bid
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onListingClick(listing);
                }}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors flex-shrink-0"
                title="View details"
              >
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceGrid;