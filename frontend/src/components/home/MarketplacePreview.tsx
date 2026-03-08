// components/home/MarketplacePreview.tsx
import { useEffect, useState } from 'react';
import { MapPin, Eye, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI, type Bid } from '../../services/api';


const MarketplacePreview = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalVolume: 0,
    activeRecyclers: 0,
    avgPrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        
        // Fetch all listings from backend
        const allListings = await listingsAPI.list();
        const openListings = allListings
          .filter(l => String(l.status).toLowerCase() === 'open')
          .slice(0, 4);

        // Fetch bids for each listing
        const imageMap: Record<string, string> = {
          'uco': 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400',
          'UCO': 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400',
          'glass': 'https://images.unsplash.com/photo-1527965498000-2d5b54c4e28c?w=400',
          'Glass': 'https://images.unsplash.com/photo-1527965498000-2d5b54c4e28c?w=400',
          'paper': 'https://images.unsplash.com/photo-1607582278229-2f688c009b02?w=400',
          'Paper/Cardboard': 'https://images.unsplash.com/photo-1607582278229-2f688c009b02?w=400',
          'plastic': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
          'Plastic': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
          'mixed': 'https://images.unsplash.com/photo-1527090526205-beaac8dc3a62?w=400',
          'Mixed': 'https://images.unsplash.com/photo-1527090526205-beaac8dc3a62?w=400',
        };

        const processedListings = await Promise.all(
          openListings.map(async (listing) => {
            try {
              const bids = await listingsAPI.getBids(listing.id);
              const topBid = [...bids].sort((a, b) => b.amount - a.amount)[0];
              
              const expiresAt = listing.expires_at ? new Date(listing.expires_at).getTime() : Date.now();
              const minutesLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 60000));
              const timeLeft = minutesLeft > 0 ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m` : 'Expired';
              const typeKey = listing.waste_type?.toLowerCase() || 'mixed';
              const imageKey = Object.keys(imageMap).find(k => k.toLowerCase() === typeKey) || 'Mixed';

              return {
                id: listing.id,
                hotel: listing.hotel_name || 'Unknown Hotel',
                type: listing.waste_type,
                volume: `${Math.round(listing.volume ?? 0).toLocaleString()} ${listing.unit ?? 'kg'}`,
                location: listing.location || listing.address || 'Kigali',
                distance: '2.3 km',
                timeLeft,
                image: imageMap[imageKey] || imageMap['Mixed'],
                bidCount: bids.length,
                currentBid: `RWF ${Math.round(topBid?.amount || listing.min_bid || 0).toLocaleString()}`,
                minBid: listing.min_bid,
                _id: listing.id,
              };
            } catch {
              // If bids fetch fails, return listing without bids
              const expiresAt = listing.expires_at ? new Date(listing.expires_at).getTime() : Date.now();
              const minutesLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 60000));
              const timeLeft = minutesLeft > 0 ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m` : 'Expired';
              const typeKey = listing.waste_type?.toLowerCase() || 'mixed';
              const imageKey = Object.keys(imageMap).find(k => k.toLowerCase() === typeKey) || 'Mixed';

              return {
                id: listing.id,
                hotel: listing.hotel_name || 'Unknown Hotel',
                type: listing.waste_type,
                volume: `${Math.round(listing.volume ?? 0).toLocaleString()} ${listing.unit ?? 'kg'}`,
                location: listing.location || listing.address || 'Kigali',
                distance: '2.3 km',
                timeLeft,
                image: imageMap[imageKey] || imageMap['Mixed'],
                bidCount: 0,
                currentBid: `RWF ${Math.round(listing.min_bid || 0).toLocaleString()}`,
                minBid: listing.min_bid,
                _id: listing.id,
              };
            }
          })
        );

        setListings(processedListings);

        // Calculate stats from all listings
        const totalActive = allListings.filter(l => String(l.status).toLowerCase() === 'open').length;
        const totalVolumeKg = allListings.reduce((s, l) => s + (l.volume || 0), 0);
        const totalVolume = Math.round(totalVolumeKg / 1000);
        
        // Count unique recyclers from all bids
        const allBids: Bid[] = [];
        for (const listing of allListings) {
          try {
            const bids = await listingsAPI.getBids(listing.id);
            allBids.push(...bids);
          } catch {
            // Skip if bid fetch fails
          }
        }
        const activeRecyclers = new Set(allBids.map(b => b.recycler_id)).size;
        const avgPrice = Math.round(allListings.reduce((s, l) => s + (l.min_bid || 0), 0) / Math.max(allListings.length, 1));

        setStats({
          totalActive,
          totalVolume,
          activeRecyclers,
          avgPrice,
        });
      } catch (err) {
        console.error('Failed to load marketplace preview:', err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Live <span className="text-cyan-600">Marketplace</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              Active waste listings from hotels near you
            </p>
          </div>
          
          <Link
            to="/marketplace"
            className="hidden lg:flex items-center text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400 group"
          >
            View all listings
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Listings Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading listings...</p>
            </div>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.type}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
                />
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {listing.timeLeft} left
                </div>
                <div className="absolute bottom-3 left-3 bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {listing.bidCount} bids
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{listing.hotel}</h3>
                  <span className="text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 px-2 py-1 rounded-full">
                    Open
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{listing.type}</p>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  {listing.location}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{listing.volume}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Min Bid</p>
                    <p className="font-bold text-cyan-600">{listing.currentBid}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => navigate('/marketplace')} className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors">
                    Bid Now
                  </button>
                  <button onClick={() => navigate('/marketplace')} className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No active listings available</p>
            </div>
          )}
        </div>

        {/* Mobile View All Link */}
        <div className="text-center mt-8 lg:hidden">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400 group"
          >
            View all listings
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Quick Stats - Real Data */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{stats.totalActive}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Listings</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{stats.totalVolume}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tons Available</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{stats.activeRecyclers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Recyclers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{(stats.avgPrice / 1000).toFixed(0)}K</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Min Bid</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;