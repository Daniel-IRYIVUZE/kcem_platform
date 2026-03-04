// pages/MarketplacePage.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { getAll, update as dsUpdate, generateId } from '../../utils/dataStore';
import type { WasteListing, Bid } from '../../utils/dataStore';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import MarketplaceHero from '../../components/marketplace/MarketplaceHero';
import MarketplaceGrid from '../../components/marketplace/MarketplaceGrid';
import MarketplaceMap from '../../components/marketplace/MarketplaceMap';
import LiveBidActivity from '../../components/marketplace/LiveBidActivity';
import MarketplaceStats from '../../components/marketplace/MarketplaceStats';
import QuickBidModal from '../../components/marketplace/QuickBidModal';
import ListingDetailModal from '../../components/marketplace/ListingDetailModal';
import ViewToggle from '../../components/marketplace/ViewToggle';
import MarketplaceSidebar from '../../components/marketplace/MarketplaceSidebar';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const MarketplacePage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedListingForBid, setSelectedListingForBid] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filters, setFilters] = useState({
    wasteTypes: [] as string[],
    location: '',
    distance: 10,
    minVolume: 0,
    maxVolume: 1000,
    hotelRating: 0,
    timeRemaining: '',
    sortBy: 'newest'
  });
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── DataStore integration: load open listings from dataStore ──────────────
  const [dsListings, setDsListings] = useState<any[]>([]);
  const imageMap: Record<string, string> = {
    'UCO': 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400',
    'Glass': 'https://images.unsplash.com/photo-1527965498000-2d5b54c4e28c?w=400',
    'Paper/Cardboard': 'https://images.unsplash.com/photo-1607582278229-2f688c009b02?w=400',
    'Mixed': 'https://images.unsplash.com/photo-1527090526205-beaac8dc3a62?w=400',
  };
  const loadFromDataStore = useCallback(() => {
    const stored = getAll<WasteListing>('listings').filter(l => l.status === 'open');
    setDsListings(stored.map(l => {
      const topBid = [...l.bids].sort((a, b) => b.amount - a.amount)[0];
      const minutesLeft = Math.max(0, Math.floor((new Date(l.expiresAt).getTime() - Date.now()) / 60000));
      const timeLeft = minutesLeft > 0 ? `${Math.floor(minutesLeft/60)}h ${minutesLeft%60}m` : 'Open';
      return {
        id: l.id, _dsId: l.id,
        hotel: l.hotelName, hotelRating: 4.5, verified: true,
        type: l.wasteType, category: l.wasteType,
        volume: l.volume, unit: l.unit,
        location: l.location || 'Kigali',
        coordinates: { lat: -1.9441, lng: 30.0619 },
        distance: 3.0, timeLeft, timeLeftMinutes: minutesLeft,
        image: (l.photos && l.photos[0]) || imageMap[l.wasteType as string] || imageMap['Mixed'],
        bidCount: l.bids.length,
        currentBid: topBid?.amount || l.minBid,
        estimatedValue: Math.round(l.minBid * 1.2),
        quality: `Grade ${l.quality}`,
        description: l.specialInstructions || `${l.wasteType} \u2014 ${l.volume} ${l.unit}`,
        photos: l.photos?.length ? l.photos : [imageMap[l.wasteType as string] || imageMap['Mixed']],
        bids: l.bids.map(b => ({ recycler: b.recyclerName, amount: b.amount, time: new Date(b.createdAt).toLocaleDateString() })),
      };
    }));
  }, []);
  useEffect(() => {
    loadFromDataStore();
    window.addEventListener('ecotrade_data_change', loadFromDataStore);
    return () => window.removeEventListener('ecotrade_data_change', loadFromDataStore);
  }, [loadFromDataStore]);

  // Memoised so the array reference stays stable across renders
  const listings = useMemo(() => [
    {
      id: 1,
      hotel: 'Mille Collines Hotel',
      hotelRating: 4.8,
      verified: true,
      type: 'Used Cooking Oil',
      category: 'UCO',
      volume: 50,
      unit: 'kg',
      location: 'Nyarugenge',
      coordinates: { lat: -1.9441, lng: 30.0619 },
      distance: 2.3,
      timeLeft: '2h 15m',
      timeLeftMinutes: 135,
      image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400',
      bidCount: 5,
      currentBid: 15000,
      estimatedValue: 18000,
      quality: 'Grade A',
      description: 'Clean UCO from kitchen, stored in sealed containers',
      photos: ['https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400'],
      bids: [
        { recycler: 'GreenEnergy', amount: 15000, time: '15 min ago' },
        { recycler: 'EcoFuel Ltd', amount: 14500, time: '25 min ago' },
        { recycler: 'BioDiesel Rwanda', amount: 14200, time: '40 min ago' }
      ]
    },
    {
      id: 2,
      hotel: 'Marriott Kigali',
      hotelRating: 4.9,
      verified: true,
      type: 'Glass Bottles',
      category: 'Glass',
      volume: 120,
      unit: 'kg',
      location: 'Gasabo',
      coordinates: { lat: -1.9536, lng: 30.0928 },
      distance: 3.8,
      timeLeft: '4h 30m',
      timeLeftMinutes: 270,
      image: 'https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=400',
      bidCount: 3,
      currentBid: 8000,
      estimatedValue: 10000,
      quality: 'Grade B',
      description: 'Mixed glass bottles, clear and brown, needs sorting',
      photos: ['https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=400'],
      bids: [
        { recycler: 'Glass Recycling Ltd', amount: 8000, time: '10 min ago' },
        { recycler: 'EcoPlast', amount: 7500, time: '30 min ago' },
      ],
    },
    {
      id: 3,
      hotel: 'Serena Hotel',
      hotelRating: 4.7,
      verified: true,
      type: 'Cardboard',
      category: 'Paper',
      volume: 200,
      unit: 'kg',
      location: 'Kicukiro',
      coordinates: { lat: -1.9689, lng: 30.1037 },
      distance: 5.1,
      timeLeft: '1h 45m',
      timeLeftMinutes: 105,
      image: 'https://images.unsplash.com/photo-1581516169900-b13c8d4fb6b3?w=400',
      bidCount: 7,
      currentBid: 12000,
      estimatedValue: 15000,
      quality: 'Grade A',
      description: 'Clean, flattened cardboard boxes, ready for collection',
      photos: ['https://images.unsplash.com/photo-1581516169900-b13c8d4fb6b3?w=400'],
      bids: [
        { recycler: 'EcoPlast', amount: 12000, time: '5 min ago' },
        { recycler: 'PaperRecycle Ltd', amount: 11500, time: '20 min ago' },
      ],
    },
    {
      id: 4,
      hotel: 'Radisson Blu',
      hotelRating: 4.8,
      verified: true,
      type: 'Mixed Recyclables',
      category: 'Mixed',
      volume: 85,
      unit: 'kg',
      location: 'Nyarugenge',
      coordinates: { lat: -1.9445, lng: 30.0594 },
      distance: 1.7,
      timeLeft: '6h 20m',
      timeLeftMinutes: 380,
      image: 'https://images.unsplash.com/photo-1527090526205-beaac8dc3a62?w=400',
      bidCount: 2,
      currentBid: 6500,
      estimatedValue: 8000,
      quality: 'Grade C',
      description: 'Mixed recyclables including plastics and paper',
      photos: ['https://images.unsplash.com/photo-1527090526205-beaac8dc3a62?w=400'],
      bids: [
        { recycler: 'MixedRecycle RW', amount: 6500, time: '45 min ago' },
      ],
    },
    {
      id: 5,
      hotel: 'Kigali Marriott',
      hotelRating: 4.6,
      verified: true,
      type: 'Used Cooking Oil',
      category: 'UCO',
      volume: 75,
      unit: 'kg',
      location: 'Gasabo',
      coordinates: { lat: -1.9563, lng: 30.0885 },
      distance: 4.2,
      timeLeft: '3h 10m',
      timeLeftMinutes: 190,
      image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400',
      bidCount: 4,
      currentBid: 22000,
      estimatedValue: 26000,
      quality: 'Grade A',
      description: 'High-quality UCO from restaurant fryers',
      photos: ['https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400'],
      bids: [
        { recycler: 'BioDiesel Rwanda', amount: 22000, time: '8 min ago' },
        { recycler: 'GreenEnergy', amount: 21000, time: '22 min ago' },
      ],
    },
    {
      id: 6,
      hotel: 'Park Inn',
      hotelRating: 4.5,
      verified: false,
      type: 'Glass Bottles',
      category: 'Glass',
      volume: 60,
      unit: 'kg',
      location: 'Kicukiro',
      coordinates: { lat: -1.9712, lng: 30.1108 },
      distance: 6.3,
      timeLeft: '2h 45m',
      timeLeftMinutes: 165,
      image: 'https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=400',
      bidCount: 1,
      currentBid: 3500,
      estimatedValue: 4500,
      quality: 'Grade B',
      description: 'Green glass bottles from bar',
      photos: ['https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=400'],
      bids: [{ recycler: 'Glass Recycling Ltd', amount: 3500, time: '1h ago' }],
    },
  ], []);

  // Filter listings based on filters + search
  useEffect(() => {
    let filtered = [...listings, ...dsListings];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.type.toLowerCase().includes(q) ||
          l.hotel.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    // Filter by waste types
    if (filters.wasteTypes.length > 0) {
      filtered = filtered.filter(listing => 
        filters.wasteTypes.includes(listing.category)
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(listing => 
        listing.location === filters.location
      );
    }

    // Filter by distance
    filtered = filtered.filter(listing => 
      listing.distance <= filters.distance
    );

    // Filter by volume
    filtered = filtered.filter(listing => 
      listing.volume >= filters.minVolume && 
      listing.volume <= filters.maxVolume
    );

    // Filter by hotel rating
    if (filters.hotelRating > 0) {
      filtered = filtered.filter(listing => 
        listing.hotelRating >= filters.hotelRating
      );
    }

    // Filter by time remaining
    if (filters.timeRemaining) {
      const maxMinutes: Record<string, number> = { '1h': 60, '3h': 180, '6h': 360, '12h': 720, '24h': 1440 };
      const max = maxMinutes[filters.timeRemaining];
      if (max) filtered = filtered.filter((l) => l.timeLeftMinutes <= max);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'highest-volume':
        filtered.sort((a, b) => b.volume - a.volume);
        break;
      case 'nearest':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'ending-soon':
        filtered.sort((a, b) => a.timeLeftMinutes - b.timeLeftMinutes);
        break;
    }

    setFilteredListings(filtered);
  }, [filters, listings, dsListings, searchQuery]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const handleListingClick = (listing: any) => {
    setSelectedListing(listing);
  };

  const handleBidClick = (listing: any) => {
    setSelectedListingForBid(listing);
    setShowBidModal(true);
  };

  const handlePlaceBid = (amount: number) => {
    setShowBidModal(false);
    // Write bid to dataStore if listing is from dataStore
    if (selectedListingForBid?._dsId) {
      const stored = getAll<WasteListing>('listings').find(l => l.id === selectedListingForBid._dsId);
      if (stored) {
        const newBid: Bid = {
          id: generateId('BID'),
          listingId: stored.id,
          recyclerId: 'recycler-guest',
          recyclerName: 'Guest Recycler',
          amount,
          note: '',
          collectionPreference: 'flexible',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        dsUpdate<WasteListing>('listings', stored.id, { bids: [...stored.bids, newBid] });
      }
    }
    showToast(`Bid of RWF ${amount.toLocaleString()} placed on ${selectedListingForBid?.hotel}!`);
    setSelectedListingForBid(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      wasteTypes: [],
      location: '',
      distance: 20,
      minVolume: 0,
      maxVolume: 1000,
      hotelRating: 0,
      timeRemaining: '',
      sortBy: 'newest',
    });
  };

  const activeFilterCount =
    filters.wasteTypes.length +
    (filters.location ? 1 : 0) +
    (filters.hotelRating > 0 ? 1 : 0) +
    (filters.timeRemaining ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <MarketplaceHero searchQuery={searchQuery} onSearch={setSearchQuery} />
        
        {/* Stats Section */}
        <MarketplaceStats listings={listings} />

        <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden w-full mb-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md flex items-center justify-between"
          >
            <span className="font-semibold flex items-center gap-2">
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <span className="text-cyan-600">{filteredListings.length} listings</span>
          </button>

          <div className="flex gap-6">
            {/* Sidebar - Desktop Filters */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <MarketplaceSidebar
                filters={filters}
                setFilters={setFilters}
                listings={listings}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredListings.length}</span> of {listings.length} listings
                </p>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium"
                    >
                      Clear filters ({activeFilterCount})
                    </button>
                  )}
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                </div>
              </div>

              {/* Grid/Map View */}
              {viewMode === 'grid' ? (
                <MarketplaceGrid
                  listings={filteredListings}
                  onListingClick={handleListingClick}
                  onBidClick={handleBidClick}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <MarketplaceMap
                  listings={filteredListings}
                  onListingClick={handleListingClick}
                  center={{ lat: -1.9441, lng: 30.0619 }}
                />
              )}
            </div>

            {/* Live Bid Activity - Desktop */}
            <div className="hidden xl:block w-72 flex-shrink-0">
              <LiveBidActivity />
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl flex flex-col">
              <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <MarketplaceSidebar
                  filters={filters}
                  setFilters={setFilters}
                  listings={listings}
                  isMobile
                  onClose={() => setIsFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {selectedListing && (
          <ListingDetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onBid={() => {
              setSelectedListingForBid(selectedListing);
              setShowBidModal(true);
              setSelectedListing(null);
            }}
          />
        )}

        {showBidModal && selectedListingForBid && (
          <QuickBidModal
            listing={selectedListingForBid}
            onClose={() => {
              setShowBidModal(false);
              setSelectedListingForBid(null);
            }}
            onPlaceBid={handlePlaceBid}
          />
        )}
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium pointer-events-auto ${
              toast.type === 'success' ? 'bg-cyan-600' : 'bg-red-600'
            }`}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {toast.message}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default MarketplacePage;