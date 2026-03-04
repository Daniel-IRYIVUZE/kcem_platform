// components/home/MarketplacePreview.tsx
import {  MapPin, Eye, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const listings = [
  {
    id: 1,
    hotel: 'Mille Collines Hotel',
    type: 'Used Cooking Oil',
    volume: '200 L',
    location: 'Nyarugenge',
    distance: '2.3 km',
    timeLeft: '18h 00m',
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400',
    bidCount: 0,
    currentBid: 'RWF 15,000'
  },
  {
    id: 2,
    hotel: 'Serena Hotel Kigali',
    type: 'Glass Bottles',
    volume: '150 kg',
    location: 'Kiyovu',
    distance: '3.1 km',
    timeLeft: '9h 00m',
    image: 'https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=400',
    bidCount: 0,
    currentBid: 'RWF 8,000'
  },
  {
    id: 3,
    hotel: 'Marriott Hotel Kigali',
    type: 'Paper/Cardboard',
    volume: '300 kg',
    location: 'Kimihurura',
    distance: '4.7 km',
    timeLeft: '12h 00m',
    image: 'https://images.unsplash.com/photo-1581516169900-b13c8d4fb6b3?w=400',
    bidCount: 0,
    currentBid: 'RWF 12,000'
  },
  {
    id: 4,
    hotel: 'Mille Collines Hotel',
    type: 'Glass Bottles',
    volume: '80 kg',
    location: 'Nyarugenge',
    distance: '2.3 km',
    timeLeft: 'Assigned',
    image: 'https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=400',
    bidCount: 1,
    currentBid: 'RWF 9,500'
  }
];

const MarketplacePreview = () => {
  const navigate = useNavigate();

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
          {listings.map((listing) => (
            <div
              key={listing.id}
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
                    Verified
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{listing.type}</p>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  {listing.location} • {listing.distance}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{listing.volume}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Bid</p>
                    <p className="font-bold text-cyan-600">{listing.currentBid}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => navigate('/marketplace')} className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors">
                    Place Bid
                  </button>
                  <button onClick={() => navigate('/marketplace')} className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">47</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Listings</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">3.2</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tons Available</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Recyclers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">350</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. UCO Price/kg</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;