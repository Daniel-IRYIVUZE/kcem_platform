import { AnimatePresence, motion } from 'framer-motion';
import { Star, MapPin, Heart, Eye, Grid, List, Package, Building, DollarSign, Clock, Leaf, Droplets, Share2, X } from 'lucide-react';

interface Listing {
  id: number;
  businessName: string;
  rating: number;
  reviews: number;
  material: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  distance: number;
  posted: string;
  images: string[];
  status: string;
  views: number;
  tags: string[];
}

interface MaterialType {
  id: string;
  name: string;
  icon: any;
}

interface StatusOption {
  id: string;
  label: string;
  color: string;
}

interface MarketplaceListingsSectionProps {
  currentListings: Listing[];
  filteredCount: number;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onListingSelect: (listing: Listing) => void;
  savedListings: number[];
  onToggleSave: (id: number) => void;
  onShareListing: (listing: Listing) => void;
  materialTypes: MaterialType[];
  statusOptions: StatusOption[];
  selectedFilters: {
    materials: string[];
    status: string;
  };
  searchQuery: string;
  onMaterialToggle: (materialId: string) => void;
  onStatusClear: () => void;
  onSearchClear: () => void;
  onClearFilters: () => void;
}

const MarketplaceListingsSection = ({
  currentListings,
  filteredCount,
  view,
  onViewChange,
  onListingSelect,
  savedListings,
  onToggleSave,
  onShareListing,
  materialTypes,
  statusOptions,
  selectedFilters,
  searchQuery,
  onMaterialToggle,
  onStatusClear,
  onSearchClear,
  onClearFilters
}: MarketplaceListingsSectionProps) => {
  return (
    <section className="py-6">
      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Available Listings</h2>
            <p className="text-gray-600 text-sm mt-1">Browse and make offers on available materials</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => onViewChange('grid')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${
                  view === 'grid' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid size={16} />
                Grid
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${
                  view === 'list' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </div>

        {(selectedFilters.materials.length > 0 || selectedFilters.status !== 'all' || searchQuery) && (
          <div className="mb-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-cyan-700">Active filters:</span>

              {selectedFilters.materials.map(materialId => {
                const material = materialTypes.find(m => m.id === materialId);
                return (
                  <span key={materialId} className="inline-flex items-center gap-1 px-2 py-1 bg-white text-cyan-600 rounded text-xs font-medium border border-cyan-200">
                    {material?.icon}
                    {material?.name}
                    <button
                      onClick={() => onMaterialToggle(materialId)}
                      className="ml-1 hover:text-cyan-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}

              {selectedFilters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-cyan-600 rounded text-xs font-medium border border-cyan-200">
                  Status: {statusOptions.find(s => s.id === selectedFilters.status)?.label}
                  <button
                    onClick={onStatusClear}
                    className="ml-1 hover:text-cyan-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-cyan-600 rounded text-xs font-medium border border-cyan-200">
                  Search: "{searchQuery}"
                  <button
                    onClick={onSearchClear}
                    className="ml-1 hover:text-cyan-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={onClearFilters}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium ml-auto"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {filteredCount > 0 ? (
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentListings.map(listing => (
                    <GridListingCard
                      key={listing.id}
                      listing={listing}
                      savedListings={savedListings}
                      onViewDetails={() => onListingSelect(listing)}
                      onToggleSave={() => onToggleSave(listing.id)}
                      onShare={() => onShareListing(listing)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentListings.map(listing => (
                    <ListListingCard
                      key={listing.id}
                      listing={listing}
                      savedListings={savedListings}
                      onViewDetails={() => onListingSelect(listing)}
                      onToggleSave={() => onToggleSave(listing.id)}
                      onShare={() => onShareListing(listing)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl border border-gray-200"
            >
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-700 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <button
                onClick={onClearFilters}
                className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const GridListingCard = ({ listing, savedListings, onViewDetails, onToggleSave, onShare }: any) => {
  const materialMap: Record<string, { icon: React.ReactNode; color: string }> = {
    'uco': { icon: <Droplets size={12} />, color: 'bg-amber-500' },
    'glass': { icon: <Package size={12} />, color: 'bg-cyan-500' },
    'paper': { icon: <Leaf size={12} />, color: 'bg-cyan-500' },
    'plastic': { icon: <Package size={12} />, color: 'bg-cyan-500' },
    'metal': { icon: <Package size={12} />, color: 'bg-gray-500' },
    'organic': { icon: <Leaf size={12} />, color: 'bg-green-500' }
  };
  const material = materialMap[listing.material] || { icon: <Package size={12} />, color: 'bg-gray-500' };

  const statusColor = listing.status === 'available' ? 'bg-green-100 text-green-800' :
                     listing.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                     'bg-cyan-100 text-cyan-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 ${material.color}`}>
            {material.icon}
            <span>{listing.material.toUpperCase()}</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
            {listing.status === 'available' ? 'Available' :
             listing.status === 'reserved' ? 'Reserved' : 'Collected'}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={onToggleSave}
            className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors ${
              savedListings.includes(listing.id)
                ? 'bg-rose-500/90 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart size={14} className={savedListings.includes(listing.id) ? 'fill-white' : ''} />
          </button>
          <button
            onClick={onShare}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-colors flex items-center justify-center"
          >
            <Share2 size={14} />
          </button>
        </div>

        <div className="absolute top-14 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-700">{listing.rating}</span>
        </div>

        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <MapPin size={10} />
            <span>{listing.distance} km</span>
          </div>
        </div>

        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <Eye size={10} />
            <span>{listing.views}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Building size={12} className="text-gray-400" />
          <span className="text-xs text-gray-500 truncate">{listing.businessName}</span>
        </div>

        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">
          {listing.title}
        </h3>

        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Quantity</div>
            <div className="flex items-center gap-1">
              <Package size={12} className="text-gray-400" />
              <span className="font-bold text-gray-900 text-sm">{listing.quantity} {listing.unit}</span>
            </div>
          </div>
          <div className="bg-cyan-50 p-2 rounded-lg">
            <div className="text-xs text-cyan-600 mb-1">Price</div>
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-cyan-500" />
              <span className="font-bold text-cyan-600 text-sm">RWF {listing.pricePerUnit}/{listing.unit === 'kg' ? 'kg' : 'L'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {listing.tags.slice(0, 2).map((tag: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {listing.tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{listing.tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={10} />
            <span>{listing.posted}</span>
          </div>

          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-1"
          >
            <Eye size={12} />
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ListListingCard = ({ listing, savedListings, onViewDetails, onToggleSave, onShare }: any) => {
  const materialMap: Record<string, { icon: React.ReactNode; color: string }> = {
    'uco': { icon: <Droplets size={12} />, color: 'bg-amber-500' },
    'glass': { icon: <Package size={12} />, color: 'bg-cyan-500' },
    'paper': { icon: <Leaf size={12} />, color: 'bg-cyan-500' },
    'plastic': { icon: <Package size={12} />, color: 'bg-cyan-500' },
    'metal': { icon: <Package size={12} />, color: 'bg-gray-500' },
    'organic': { icon: <Leaf size={12} />, color: 'bg-green-500' }
  };
  const material = materialMap[listing.material] || { icon: <Package size={12} />, color: 'bg-gray-500' };

  const statusColor = listing.status === 'available' ? 'bg-green-100 text-green-800' :
                     listing.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                     'bg-cyan-100 text-cyan-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <div className={`px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 ${material.color}`}>
              {material.icon}
              <span>{listing.material.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                  {listing.status === 'available' ? 'Available' : 'Reserved'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>{listing.rating} ({listing.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Eye size={10} />
                  <span>{listing.views} views</span>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{listing.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Building size={12} className="text-gray-400" />
                <span className="text-sm text-gray-600">{listing.businessName}</span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Quantity</div>
                  <div className="flex items-center gap-1">
                    <Package size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{listing.quantity} {listing.unit}</span>
                  </div>
                </div>
                <div className="bg-cyan-50 p-2 rounded-lg">
                  <div className="text-xs text-cyan-600 mb-1">Price</div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-cyan-500" />
                    <span className="font-bold text-cyan-600">RWF {listing.pricePerUnit}/{listing.unit === 'kg' ? 'kg' : 'L'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Distance</div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{listing.distance} km</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Posted</div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{listing.posted}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {listing.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {listing.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{listing.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:w-48">
              <button
                onClick={onViewDetails}
                className="w-full py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                View Details
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onToggleSave}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    savedListings.includes(listing.id)
                      ? 'bg-rose-50 border border-rose-200 text-rose-600'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart size={14} className={savedListings.includes(listing.id) ? 'fill-rose-500' : ''} />
                  {savedListings.includes(listing.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={onShare}
                  className="py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>

              {listing.status === 'available' && (
                <button className="w-full py-2 border-2 border-cyan-600 text-cyan-600 text-sm font-medium rounded-lg hover:bg-cyan-50 transition-colors flex items-center justify-center gap-1">
                  <DollarSign size={14} />
                  Make Offer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceListingsSection;
