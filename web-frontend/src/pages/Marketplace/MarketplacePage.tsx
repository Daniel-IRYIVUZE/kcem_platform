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
  Building,
  Home,
  ExternalLink
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const materialTypes = [
    { id: 'uco', name: 'Used Cooking Oil', icon: <Droplets size={16} />, color: 'amber' },
    { id: 'glass', name: 'Glass Bottles', icon: <Package size={16} />, color: 'cyan' },
    { id: 'paper', name: 'Paper & Cardboard', icon: <Leaf size={16} />, color: 'cyan' },
    { id: 'plastic', name: 'Plastic Containers', icon: <Package size={16} />, color: 'cyan' },
    { id: 'metal', name: 'Metal Cans', icon: <Package size={16} />, color: 'gray' },
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
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400'],
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
      images: ['https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=400'],
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
      images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=400'],
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
      images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400'],
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
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400'],
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
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400'],
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

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewListing = (id: number) => {
    navigate(`/marketplace/listing/${id}`);
  };

  const handleExportListings = () => {
    // In production, this would generate and download a CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Title,Business,Price,Quantity"].join(",") + "\n"
      + filteredListings.map(l => `${l.id},${l.title},${l.businessName},${l.pricePerUnit},${l.quantity}${l.unit}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kcem_marketplace_listings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <div className="bg-cyan-700 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <button 
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 text-cyan-100 hover:text-white mb-2 text-sm"
                >
                  <Home size={14} />
                  Back to Home
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold">KCEM Marketplace</h1>
                <p className="text-cyan-100 text-sm">Discover and trade recyclable materials across Kigali</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Users size={14} />
                  <span>{listings.length} active listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search materials, businesses, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-sm text-gray-500">{filteredListings.length} results</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filters Sidebar */}
            <div className={`${filtersVisible ? 'block' : 'hidden lg:block'} lg:w-1/4`}>
              <div className="bg-white rounded-lg border border-gray-300 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sliders size={18} />
                    Filters
                  </h3>
                  <button
                    onClick={() => setFiltersVisible(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Material Types */}
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 text-sm">Material Type</h4>
                  <div className="space-y-1">
                    {materialTypes.map(material => (
                      <button
                        key={material.id}
                        onClick={() => handleMaterialToggle(material.id)}
                        className={`flex items-center justify-between w-full p-2 rounded transition-colors text-sm ${
                          selectedFilters.materials.includes(material.id)
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            selectedFilters.materials.includes(material.id)
                              ? 'bg-cyan-100 text-cyan-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {material.icon}
                          </div>
                          <span className="text-gray-700">{material.name}</span>
                        </div>
                        {selectedFilters.materials.includes(material.id) && (
                          <Check size={14} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-700 text-sm">Distance</h4>
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
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 text-sm">Price Range (RWF)</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={selectedFilters.priceRange.min}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-2 py-1.5 rounded border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={selectedFilters.priceRange.max}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 5000 }
                        }))}
                        className="w-full px-2 py-1.5 rounded border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 text-sm">Sort By</h4>
                  <div className="space-y-1">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedFilters(prev => ({ ...prev, sortBy: option.id }))}
                        className={`flex items-center justify-between w-full p-2 rounded transition-colors text-sm ${
                          selectedFilters.sortBy === option.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <span className="text-gray-700">{option.label}</span>
                        {selectedFilters.sortBy === option.id && (
                          <Check size={14} className="text-cyan-600" />
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
                  className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors font-medium text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-3/4">
              {/* Controls Bar */}
              <div className="bg-white rounded-lg border border-gray-300 p-3 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <button
                      onClick={() => setFiltersVisible(true)}
                      className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded font-medium hover:bg-cyan-100 transition-colors text-sm"
                    >
                      <Filter size={14} />
                      Show Filters
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                      <Filter size={14} />
                      <span>{selectedFilters.materials.length} materials selected</span>
                      <span>•</span>
                      <span>Within {selectedFilters.distance}km</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleExportListings}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Download size={14} />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                        <Share2 size={14} />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>
                    
                    <div className="flex bg-gray-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => setView('grid')}
                        className={`px-3 py-1.5 rounded flex items-center gap-1 font-medium text-sm ${
                          view === 'grid' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Grid size={14} />
                        <span className="hidden sm:inline">Grid</span>
                      </button>
                      <button
                        onClick={() => setView('map')}
                        className={`px-3 py-1.5 rounded flex items-center gap-1 font-medium text-sm ${
                          view === 'map' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <MapIcon size={14} />
                        <span className="hidden sm:inline">Map</span>
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
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
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
                        onViewListing={handleViewListing}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <MapIcon className="text-cyan-500 mb-3" size={32} />
                      <h3 className="text-lg font-bold text-cyan-700 mb-1">Interactive Map View</h3>
                      <p className="text-cyan-600 text-center mb-4 text-sm max-w-xs">
                        Visualize listings on a map with cluster markers and real-time location data
                      </p>
                      <div className="flex items-center gap-3 flex-wrap justify-center">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="text-xs text-gray-700">Available Listings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="text-xs text-gray-700">Hot Deals</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm p-3 rounded border border-gray-200 max-w-xs">
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">Map Features</h4>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        <li>• Real-time location tracking</li>
                        <li>• Cluster markers for dense areas</li>
                        <li>• Route optimization preview</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredListings.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-300 mb-3" size={32} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No listings found</h3>
                  <p className="text-gray-500 mb-4 text-sm">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => setSelectedFilters({
                      materials: [],
                      distance: 50,
                      priceRange: { min: 0, max: 5000 },
                      quantity: 0,
                      sortBy: 'newest'
                    })}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
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
  getMaterialIcon,
  onViewListing
}: any) => {
  const handleMakeOffer = (id: number) => {
    setQuickOffer(quickOffer === id ? null : id);
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount.trim()) {
      alert(`Offer of RWF ${offerAmount} submitted for ${listing.title}`);
      setOfferAmount('');
      setQuickOffer(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2">
          <div className={`px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 ${
            getMaterialColor(listing.material) === 'amber' ? 'bg-amber-500' :
            getMaterialColor(listing.material) === 'cyan' ? 'bg-cyan-500' :
            getMaterialColor(listing.material) === 'cyan' ? 'bg-cyan-500' :
            getMaterialColor(listing.material) === 'cyan' ? 'bg-cyan-500' :
            'bg-gray-500'
          }`}>
            {getMaterialIcon(listing.material)}
            <span>{listing.material.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-gray-700 flex items-center gap-0.5">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          {listing.rating} ({listing.reviews})
        </div>
        
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center gap-1 text-white text-xs">
            <MapPin size={10} />
            <span>{listing.distance} km away</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <Building size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{listing.businessName}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{listing.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {listing.tags.map((tag: string, index: number) => (
            <span key={index} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Quantity</div>
            <div className="flex items-center gap-1">
              <Package size={12} className="text-gray-400" />
              <span className="font-bold text-gray-900 text-sm">{listing.quantity} {listing.unit}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Price</div>
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-gray-400" />
              <span className="font-bold text-cyan-600 text-sm">RWF {listing.pricePerUnit}/{listing.unit === 'kg' ? 'kg' : 'L'}</span>
            </div>
          </div>
        </div>

        {/* Time Posted */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{listing.posted}</span>
          </div>
          <button className="text-gray-400 hover:text-rose-500 transition-colors">
            <Heart size={12} />
          </button>
        </div>

        {/* Quick Offer or Make Offer Button */}
        {quickOffer === listing.id ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <form onSubmit={handleSubmitOffer} className="space-y-2">
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter your offer (RWF)"
                  className="w-full pl-7 pr-2 py-1.5 rounded border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                />
              </div>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => setQuickOffer(null)}
                  className="flex-1 py-1.5 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-cyan-600 text-white rounded font-medium hover:bg-cyan-700 transition-colors text-xs"
                >
                  Submit Offer
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => onViewListing(listing.id)}
              className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200 transition-colors text-xs"
            >
              View Details
            </button>
            <button
              onClick={() => handleMakeOffer(listing.id)}
              className="flex-1 py-1.5 bg-cyan-600 text-white rounded font-medium hover:bg-cyan-700 transition-colors text-xs flex items-center justify-center gap-0.5"
            >
              <DollarSign size={12} />
              Make Offer
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MarketplacePage;