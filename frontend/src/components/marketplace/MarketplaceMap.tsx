// components/marketplace/MarketplaceMap.tsx
import { MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';

interface MarketplaceMapProps {
  listings: any[];
  onListingClick: (listing: any) => void;
  center: { lat: number; lng: number };
}

const MarketplaceMap = ({ listings, onListingClick, center }: MarketplaceMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  // This would be replaced with actual Leaflet map
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-[600px] bg-gray-100 dark:bg-gray-800">
        {/* Map Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Sample Markers */}
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              top: `${50 + (listing.coordinates.lat - center.lat) * 100}%`,
              left: `${50 + (listing.coordinates.lng - center.lng) * 100}%`
            }}
            onClick={() => {
              setSelectedMarker(listing);
              onListingClick(listing);
            }}
          >
            <MapPin
              className={`w-8 h-8 ${
                selectedMarker?.id === listing.id
                  ? 'text-cyan-600 fill-cyan-600'
                  : 'text-cyan-600 fill-cyan-600/70'
              }`}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <p className="font-semibold text-sm">{listing.hotel}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{listing.type} • {listing.volume}kg</p>
              <p className="text-xs font-bold text-cyan-600">RWF {listing.currentBid.toLocaleString()}</p>
            </div>
          </div>
        ))}

        {/* Center Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
            <Navigation className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold mb-2">Map Legend</p>
          <div className="space-y-1">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-cyan-600 mr-1" />
              <span className="text-xs">Waste Listings</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-xs">Your Location</span>
            </div>
          </div>
        </div>

        {/* Cluster Info */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{listings.length} listings in view</p>
        </div>
      </div>

      {/* Map Footer */}
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Kigali, Rwanda
          </span>
          <button className="text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400">
            View Full Screen
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceMap;