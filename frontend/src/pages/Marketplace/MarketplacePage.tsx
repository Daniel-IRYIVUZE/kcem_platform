import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle } from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import MarketplaceHero from '../../components/marketplace/MarketplaceHero';
import MarketplaceGrid from '../../components/marketplace/MarketplaceGrid';
import MarketplaceMap from '../../components/marketplace/MarketplaceMap';
import MarketplaceStats from '../../components/marketplace/MarketplaceStats';
import QuickBidModal from '../../components/marketplace/QuickBidModal';
import ListingDetailModal from '../../components/marketplace/ListingDetailModal';
import ViewToggle from '../../components/marketplace/ViewToggle';
import MarketplaceSidebar from '../../components/marketplace/MarketplaceSidebar';
import { listingsAPI, type WasteListing } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { syncFromAPI } from '../../utils/apiSync';
import { getAbsoluteImageUrl } from '../../utils/imageUrl';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ListingViewModel {
  id: number;
  business: string;
  businessRating: number;
  verified: boolean;
  type: string;
  category: string;
  volume: number;
  unit: string;
  location: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  timeLeft: string;
  timeLeftMinutes: number;
  image: string;
  bidCount: number;
  currentBid: number;
  estimatedValue: number;
  quality: string;
  description: string;
  photos: string[];
  bids: Array<{ recycler: string; amount: number; time: string }>;
}

const CATEGORY_MAP: Record<string, string> = {
  uco: 'UCO',
  used_cooking_oil: 'UCO',
  cooking_oil: 'UCO',
  glass: 'Glass',
  paper: 'Paper',
  cardboard: 'Cardboard',
  paper_cardboard: 'Cardboard',
  'paper/cardboard': 'Cardboard',
  plastic: 'Plastic',
  metal: 'Metal',
  organic: 'Organic',
  food: 'Organic',
  mixed: 'Mixed',
  electronic: 'Mixed',
  textile: 'Mixed',
  other: 'Mixed',
};

// High-quality Unsplash images per waste category
const IMAGE_MAP: Record<string, string> = {
  UCO: 'https://iamhomesteader.com/wp-content/uploads/2022/05/oil-1.jpg',
  Glass: 'https://www.roadrunnerwm.com/hubfs/Blog/Hero%20Images/RR-Blog-Why-Glass-Recycling-Going-Away.jpg',
  Paper: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTvZggnil69mXGV3c0uL-pnTkKhYdW_IOB1A&s',
  Cardboard: 'https://miro.medium.com/1*j9BnLsdm0LWdsDAcGU5tRA.jpeg',
  Plastic: 'https://www.azocleantech.com/images/Article_Images/ImageForArticle_913(1).jpg',
  Metal: 'https://business-waste.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/02/13150342/metal-header.jpg',
  Organic: 'https://www.bu.edu/sph/files/2024/02/composting_medium-size.jpg',
  Mixed: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ5nRlDSWJYKlPbc8vQzi4uFTd_STPRQAxgQ&s',
};

function getTimeLeft(expiresAt?: string): { text: string; minutes: number } {
  if (!expiresAt) return { text: 'Open', minutes: 999999 };
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(msLeft) || msLeft <= 0) return { text: 'Expired', minutes: 0 };
  const minutes = Math.floor(msLeft / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { text: `${hours}h ${mins}m`, minutes };
}

function toListingViewModel(listing: WasteListing): ListingViewModel {
  const category = CATEGORY_MAP[String(listing.waste_type || '').toLowerCase()] || 'Mixed';
  const { text: timeLeft, minutes: timeLeftMinutes } = getTimeLeft(listing.expires_at);

  // Use real coordinates from DB, fallback to Kigali centre per-hotel offset
  const lat = listing.latitude ?? (-1.9536 + (listing.hotel_id % 10 - 5) * 0.003);
  const lng = listing.longitude ?? (30.0928 + (listing.hotel_id % 7 - 3) * 0.003);

  const currentBid = Math.round(listing.highest_bid || listing.min_bid || 0);
  const minBid = Math.round(listing.min_bid || 0);
  // Convert relative image path to absolute URL
  const imageUrl = listing.image_url 
    ? getAbsoluteImageUrl(listing.image_url)
    : (IMAGE_MAP[category] || IMAGE_MAP.Mixed);


  return {
    id: listing.id,
    business: listing.hotel_name || 'Business',
    businessRating: 4.5,
    verified: true,
    type: listing.waste_type,
    category,
    volume: Math.round(listing.volume),
    unit: listing.unit || 'kg',
    location: listing.address || listing.location || 'Kigali, Rwanda',
    coordinates: { lat, lng },
    distance: 0,
    timeLeft,
    timeLeftMinutes,
    image: imageUrl,
    bidCount: listing.bid_count || 0,
    currentBid,
    estimatedValue: Math.round((currentBid || minBid) * 1.2),
    quality: 'Grade A',
    description: listing.notes || listing.description || `${listing.waste_type} — ${Math.round(listing.volume)} ${listing.unit || 'kg'}`,
    photos: [imageUrl],
    bids: [],
  };
}

const MarketplacePage = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedListing, setSelectedListing] = useState<ListingViewModel | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedListingForBid, setSelectedListingForBid] = useState<ListingViewModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [listings, setListings] = useState<ListingViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    wasteTypes: [] as string[],
    location: '',
    distance: 10,
    minVolume: 0,
    maxVolume: 100000,
    businessRating: 0,
    timeRemaining: '',
    sortBy: 'newest',
  });
  const [filteredListings, setFilteredListings] = useState<ListingViewModel[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listingsAPI.list({ limit: 200 });
      const mapped = response
        .filter((item) => String(item.status).toLowerCase() === 'open')
        .map(toListingViewModel);

      const withBids = await Promise.all(
        mapped.map(async (item) => {
          try {
            const bids = await listingsAPI.getBids(item.id);
            const maxBid = bids.length > 0 ? Math.round(Math.max(...bids.map((b) => b.amount))) : item.currentBid;
            return {
              ...item,
              bidCount: bids.length,
              currentBid: maxBid,
              estimatedValue: Math.round(maxBid * 1.2),
              bids: bids.slice(0, 5).map((b) => ({
                recycler: b.recycler_name || `Recycler #${b.recycler_id}`,
                amount: Math.round(b.amount),
                time: new Date(b.created_at).toLocaleString(),
              })),
            };
          } catch {
            return item;
          }
        })
      );

      setListings(withBids);
    } catch (error) {
      console.error(error);
      showToast('Failed to load marketplace listings from backend.', 'error');
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    let filtered = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.type.toLowerCase().includes(q) ||
          l.business.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (filters.wasteTypes.length > 0) {
      filtered = filtered.filter((listing) => filters.wasteTypes.includes(listing.category));
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(loc)
      );
    }

    filtered = filtered.filter((listing) => listing.distance <= filters.distance);

    filtered = filtered.filter(
      (listing) => listing.volume >= filters.minVolume && listing.volume <= filters.maxVolume
    );

    if (filters.businessRating > 0) {
      filtered = filtered.filter((listing) => listing.businessRating >= filters.businessRating);
    }

    if (filters.timeRemaining) {
      const maxMinutes: Record<string, number> = {
        '1h': 60,
        '3h': 180,
        '6h': 360,
        '12h': 720,
        '24h': 1440,
      };
      const max = maxMinutes[filters.timeRemaining];
      if (max) filtered = filtered.filter((l) => l.timeLeftMinutes <= max);
    }

    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
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
      default:
        break;
    }

    setFilteredListings(filtered);
  }, [filters, listings, searchQuery]);



  const handleListingClick = (listing: any) => {
    setSelectedListing(listing as ListingViewModel);
  };

  const handleBidClick = (listing: ListingViewModel) => {
    if (!user) {
      showToast('Please login to place a bid.', 'error');
      return;
    }
    setSelectedListingForBid(listing);
    setShowBidModal(true);
  };

  const handlePlaceBid = async (amount: number) => {
    if (!selectedListingForBid || !user) return;

    try {
      await listingsAPI.placeBid(selectedListingForBid.id, { amount });
      showToast(`Total bid price of RWF ${amount.toLocaleString()} placed successfully.`);
      
      // Reload marketplace listings
      await loadListings();
      
      // Sync data from backend to localStorage so dashboards update
      await syncFromAPI(user.role);
      
      // Trigger data change event so all dashboard listeners update
      window.dispatchEvent(new Event('ecotrade_data_change'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place bid.';
      if (message.toLowerCase().includes('already have an active bid')) {
        showToast('You already have an active bid on this listing. Increase your existing bid from My Bids.', 'error');
      } else {
        showToast(message, 'error');
      }
    } finally {
      setShowBidModal(false);
      setSelectedListingForBid(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      wasteTypes: [],
      location: '',
      distance: 20,
      minVolume: 0,
      maxVolume: 100000,
      businessRating: 0,
      timeRemaining: '',
      sortBy: 'newest',
    });
  };

  const activeFilterCount =
    filters.wasteTypes.length +
    (filters.location ? 1 : 0) +
    (filters.businessRating > 0 ? 1 : 0) +
    (filters.timeRemaining ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="pt-20 pb-12">
        <MarketplaceHero searchQuery={searchQuery} onSearch={setSearchQuery} />

        <MarketplaceStats listings={filteredListings} />

        <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
            <div className="hidden lg:block w-72 flex-shrink-0">
              <MarketplaceSidebar filters={filters} setFilters={setFilters} listings={listings} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Showing{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{filteredListings.length}</span> of{' '}
                  {listings.length} listings
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

              {isLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400">
                  Loading marketplace listings...
                </div>
              ) : viewMode === 'grid' ? (
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

            {/* <div className="hidden xl:block w-72 flex-shrink-0">
              <LiveBidActivity items={tickerItems.length > 0 ? tickerItems : undefined} />
            </div> */}
          </div>
        </div>

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

        {selectedListing && (
          <ListingDetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onBid={() => {
              if (!user) {
                showToast('Please login to place a bid.', 'error');
                return;
              }
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
