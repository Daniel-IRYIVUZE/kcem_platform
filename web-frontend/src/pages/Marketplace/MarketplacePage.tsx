import { useState } from 'react';
import { 
  Filter, 
  Map as MapIcon, 
  Grid, 
  MapPin, 
  Star, 
  Search, 
  DollarSign, 
  Package, 
  Heart,
  Share2,
  Download,
  Bell,
  Sliders,
  X,
  Check,
  Save,
  Clock,
  Users,
  Truck,
  Leaf,
  Droplets,
  Building
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const MarketplacePage = () => {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    materials: [] as string[],
    distance: 50,
    priceRange: { min: 0, max: 5000 },
    quantity: 0,
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSearches, setSavedSearches] = useState([
    { id: 1, name: 'UCO Near Me', count: 12 },
    { id: 2, name: 'Glass Bottles Bulk', count: 8 },
    { id: 3, name: 'Weekly Cardboard', count: 5 }
  ]);
  const [activeSavedSearch, setActiveSavedSearch] = useState<number | null>(null);
  const [quickOffer, setQuickOffer] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState('');

  const materialTypes = [
    { id: 'uco', name: 'Used Cooking Oil', icon: <Droplets size={16} />, color: 'amber' },
    { id: 'glass', name: 'Glass Bottles', icon: <Package size={16} />, color: 'cyan' },
    { id: 'paper', name: 'Paper & Cardboard', icon: <Leaf size={16} />, color: 'cyan' },
    { id: 'plastic', name: 'Plastic Containers', icon: <Package size={16} />, color: 'cyan' },
    { id: 'metal', name: 'Metal Cans', icon: <Package size={16} />, color: 'slate' },
    { id: 'organic', name: 'Organic Waste', icon: <Leaf size={16} />, color: 'green' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
    { id: 'distance', label: 'Nearest First' },
    { id: 'quantity', label: 'Largest Quantity' },
    { id: 'rating', label: 'Highest Rated' }
  ];

  const listings = [
    {
      id: 1,
      businessName: 'Serena Hotel Kigali',
      rating: 4.8,
      reviews: 42,
      material: 'uco',
      title: 'Premium Used Cooking Oil',
      description: 'High-quality UCO filtered weekly, ideal for biodiesel production',
      quantity: 500,
      unit: 'liters',
      pricePerUnit: 750,
      location: 'KN 3 Ave, Kigali',
      distance: 1.2,
      coordinates: { lat: -1.950, lng: 30.058 },
      posted: '2 hours ago',
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80'],
      tags: ['Weekly Collection', 'Filtered', 'Biodiesel Ready']
    },
    {
      id: 2,
      businessName: 'Hotel des Mille Collines',
      rating: 4.6,
      reviews: 38,
      material: 'glass',
      title: 'Clear Glass Bottles',
      description: 'Sorted by color, clean and ready for recycling',
      quantity: 200,
      unit: 'kg',
      pricePerUnit: 150,
      location: 'KN 4 Ave, Kigali',
      distance: 0.5,
      coordinates: { lat: -1.952, lng: 30.060 },
      posted: '5 hours ago',
      images: ['https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80'],
      tags: ['Color Sorted', 'Clean', 'Bulk Available']
    },
    {
      id: 3,
      businessName: 'Radisson Blu Hotel',
      rating: 4.9,
      reviews: 56,
      material: 'paper',
      title: 'Corrugated Cardboard Boxes',
      description: 'Flattened and bundled, perfect for packaging',
      quantity: 800,
      unit: 'kg',
      pricePerUnit: 50,
      location: 'KG 7 Ave, Kigali',
      distance: 2.8,
      coordinates: { lat: -1.955, lng: 30.065 },
      posted: '1 day ago',
      images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80'],
      tags: ['Flattened', 'Bundled', 'Weekly']
    },
    {
      id: 4,
      businessName: 'Marriott Hotel',
      rating: 4.7,
      reviews: 45,
      material: 'plastic',
      title: 'PET Bottles Collection',
      description: 'Sorted PET bottles, washed and ready for processing',
      quantity: 150,
      unit: 'kg',
      pricePerUnit: 120,
      location: 'KG 5 Ave, Kigali',
      distance: 3.2,
      coordinates: { lat: -1.958, lng: 30.062 },
      posted: '2 days ago',
      images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80'],
      tags: ['PET Only', 'Washed', 'Sorted']
    },
    {
      id: 5,
      businessName: 'Kigali Convention Center',
      rating: 4.8,
      reviews: 32,
      material: 'metal',
      title: 'Aluminum Cans Bulk',
      description: 'Crushed aluminum cans from events and restaurants',
      quantity: 300,
      unit: 'kg',
      pricePerUnit: 180,
      location: 'KG 2 Ave, Kigali',
      distance: 4.1,
      coordinates: { lat: -1.962, lng: 30.055 },
      posted: '3 days ago',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80'],
      tags: ['Aluminum', 'Crushed', 'Event Waste']
    },
    {
      id: 6,
      businessName: 'Ubumwe Grande Hotel',
      rating: 4.5,
      reviews: 28,
      material: 'organic',
      title: 'Food Waste Compost Ready',
      description: 'Separated food waste from kitchen operations',
      quantity: 400,
      unit: 'kg',
      pricePerUnit: 30,
      location: 'KK 15 Ave, Kigali',
      distance: 5.3,
      coordinates: { lat: -1.965, lng: 30.070 },
      posted: '4 days ago',
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80'],
      tags: ['Food Waste', 'Separated', 'Compost']
    }
  ];

  const handleMaterialToggle = (materialId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      materials: prev.materials.includes(materialId)
        ? prev.materials.filter(id => id !== materialId)
        : [...prev.materials, materialId]
    }));
  };

  const handleSaveSearch = () => {
    const newSearch = {
      id: savedSearches.length + 1,
      name: `Search ${savedSearches.length + 1}`,
      count: filteredListings.length
    };
    setSavedSearches([...savedSearches, newSearch]);
  };

  const filteredListings = listings.filter(listing => {
    if (selectedFilters.materials.length > 0 && !selectedFilters.materials.includes(listing.material)) {
      return false;
    }
    if (listing.distance > selectedFilters.distance) {
      return false;
    }
    if (listing.pricePerUnit < selectedFilters.priceRange.min || listing.pricePerUnit > selectedFilters.priceRange.max) {
      return false;
    }
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !listing.businessName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (selectedFilters.sortBy) {
      case 'price_low':
        return a.pricePerUnit - b.pricePerUnit;
      case 'price_high':
        return b.pricePerUnit - a.pricePerUnit;
      case 'distance':
        return a.distance - b.distance;
      case 'quantity':
        return b.quantity - a.quantity;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const getMaterialColor = (materialId: string) => {
    const material = materialTypes.find(m => m.id === materialId);
    return material?.color || 'gray';
  };

  const getMaterialIcon = (materialId: string) => {
    const material = materialTypes.find(m => m.id === materialId);
    return material?.icon || <Package size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-cyan-900 via-cyan-900 to-cyan-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">KCEM Marketplace</h1>
                <p className="text-cyan-100">Discover and trade recyclable materials across Kigali</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Users size={16} />
                  <span>{listings.length} active listings</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Truck size={16} />
                  <span>Real-time updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search materials, businesses, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-sm text-slate-500">{filteredListings.length} results</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className={`lg:w-1/4 ${filtersVisible ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 sticky top-24">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sliders size={20} />
                    Filters
                  </h3>
                  <button
                    onClick={() => setFiltersVisible(false)}
                    className="lg:hidden text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Material Types */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-3">Material Type</h4>
                  <div className="space-y-2">
                    {materialTypes.map(material => (
                      <button
                        key={material.id}
                        onClick={() => handleMaterialToggle(material.id)}
                        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
                          selectedFilters.materials.includes(material.id)
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedFilters.materials.includes(material.id)
                              ? `bg-${material.color}-100 text-${material.color}-600`
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {material.icon}
                          </div>
                          <span className="text-sm text-slate-700">{material.name}</span>
                        </div>
                        {selectedFilters.materials.includes(material.id) && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Range */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-700">Distance</h4>
                    <span className="text-sm font-bold text-cyan-600">{selectedFilters.distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedFilters.distance}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, distance: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>0 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-3">Price Range (RWF)</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Min</label>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.min}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Max</label>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.max}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 5000 }
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-3">Sort By</h4>
                  <div className="space-y-2">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedFilters(prev => ({ ...prev, sortBy: option.id }))}
                        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
                          selectedFilters.sortBy === option.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <span className="text-sm text-slate-700">{option.label}</span>
                        {selectedFilters.sortBy === option.id && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saved Searches */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <Save size={16} />
                      Saved Searches
                    </h4>
                    <button
                      onClick={handleSaveSearch}
                      className="text-xs text-cyan-600 font-bold hover:text-cyan-700"
                    >
                      + Save Current
                    </button>
                  </div>
                  <div className="space-y-2">
                    {savedSearches.map(search => (
                      <button
                        key={search.id}
                        onClick={() => setActiveSavedSearch(search.id)}
                        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
                          activeSavedSearch === search.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Bell size={14} className="text-slate-400" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-slate-700">{search.name}</div>
                            <div className="text-xs text-slate-500">{search.count} listings</div>
                          </div>
                        </div>
                        {activeSavedSearch === search.id && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setSelectedFilters({
                    materials: [],
                    distance: 50,
                    priceRange: { min: 0, max: 5000 },
                    quantity: 0,
                    sortBy: 'newest'
                  })}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-slate-400 hover:text-slate-700 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-3/4">
              {/* Controls Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <button
                      onClick={() => setFiltersVisible(true)}
                      className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg font-medium hover:bg-cyan-100 transition-colors"
                    >
                      <Filter size={16} />
                      Show Filters
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                      <Filter size={16} />
                      <span>{selectedFilters.materials.length} materials selected</span>
                      <span>•</span>
                      <span>Within {selectedFilters.distance}km</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                        <Download size={16} />
                        Export
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setView('grid')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm ${
                          view === 'grid' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Grid size={18} />
                        Grid
                      </button>
                      <button
                        onClick={() => setView('map')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm ${
                          view === 'map' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <MapIcon size={18} />
                        Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listings Display */}
              <AnimatePresence mode="wait">
                {view === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredListings.map(listing => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        quickOffer={quickOffer}
                        setQuickOffer={setQuickOffer}
                        offerAmount={offerAmount}
                        setOfferAmount={setOfferAmount}
                        getMaterialColor={getMaterialColor}
                        getMaterialIcon={getMaterialIcon}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[600px] bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-2xl border-2 border-dashed border-cyan-200 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <MapIcon className="text-cyan-500 mb-4" size={48} />
                      <h3 className="text-xl font-bold text-cyan-700 mb-2">Interactive Map View</h3>
                      <p className="text-cyan-600 max-w-md text-center mb-6">
                        Visualize listings on a map with cluster markers and real-time location data
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                          <span className="text-sm text-slate-700">Available Listings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                          <span className="text-sm text-slate-700">Your Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-sm text-slate-700">Hot Deals</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">Map Features</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Real-time location tracking</li>
                        <li>• Cluster markers for dense areas</li>
                        <li>• Route optimization preview</li>
                        <li>• Distance calculation</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredListings.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto text-slate-300 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No listings found</h3>
                  <p className="text-slate-500 mb-6">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => setSelectedFilters({
                      materials: [],
                      distance: 50,
                      priceRange: { min: 0, max: 5000 },
                      quantity: 0,
                      sortBy: 'newest'
                    })}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

const ListingCard = ({ 
  listing, 
  quickOffer, 
  setQuickOffer, 
  offerAmount, 
  setOfferAmount,
  getMaterialColor,
  getMaterialIcon 
}: any) => {
  const handleMakeOffer = (id: number) => {
    setQuickOffer(quickOffer === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 ${
            getMaterialColor(listing.material) === 'amber' ? 'bg-amber-500' :
            getMaterialColor(listing.material) === 'cyan' ? 'bg-cyan-500' :
            getMaterialColor(listing.material) === 'cyan' ? 'bg-cyan-500' :
            getMaterialColor(listing.material) === 'cyan' ? 'bg-cyan-500' :
            'bg-slate-500'
          }`}>
            {getMaterialIcon(listing.material)}
            <span>{listing.material.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          {listing.rating} ({listing.reviews})
        </div>
        
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <MapPin size={14} />
            <span>{listing.distance} km away</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Building size={14} className="text-slate-400" />
            <span className="text-sm text-slate-500">{listing.businessName}</span>
          </div>
          <h3 className="font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{listing.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {listing.tags.map((tag: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Quantity</div>
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-400" />
              <span className="font-bold text-slate-900">{listing.quantity} {listing.unit}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Price</div>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-slate-400" />
              <span className="font-bold text-cyan-600">RWF {listing.pricePerUnit}/{listing.unit === 'kg' ? 'kg' : 'L'}</span>
            </div>
          </div>
        </div>

        {/* Time Posted */}
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{listing.posted}</span>
          </div>
          <button className="text-slate-400 hover:text-rose-500 transition-colors">
            <Heart size={16} />
          </button>
        </div>

        {/* Quick Offer or Make Offer Button */}
        {quickOffer === listing.id ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer (RWF)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
                Cancel
              </button>
              <button className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm">
                Submit Offer
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => handleMakeOffer(listing.id)}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <DollarSign size={16} />
            Make Offer
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MarketplacePage;