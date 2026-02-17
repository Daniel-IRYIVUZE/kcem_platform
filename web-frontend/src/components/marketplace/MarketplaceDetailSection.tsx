import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MessageCircle, ChevronLeft, ChevronRight, Star, MapPin, Package, Eye, DollarSign, Calendar, Building, Tag, Leaf, Share2, Heart, Clock, Scale } from 'lucide-react';

interface Listing {
  id: number;
  businessName: string;
  rating: number;
  reviews: number;
  material: string;
  title: string;
  description: string;
  detailedDescription: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  distance: number;
  posted: string;
  postedDate: string;
  images: string[];
  status: string;
  tags: string[];
  views: number;
  offers: number;
  minOrder: number;
  pickupSchedule: string;
  packaging: string;
  storage: string;
  certifications: string[];
  businessType: string;
  yearsInOperation: number;
  qualityRating: string;
  co2Savings: number;
  ratingBreakdown: Record<string, number>;
  contact: {
    phone: string;
    email: string;
    person: string;
    title: string;
  };
}

interface MarketplaceDetailSectionProps {
  listing: Listing | null;
  imageIndex: number;
  onImagePrevClick: () => void;
  onImageNextClick: () => void;
  onImageSelect: (index: number) => void;
  onCloseClick: () => void;
  onQuickOfferClick: () => void;
  onShareClick: (listing: Listing) => void;
  savedListings: number[];
  onToggleSave: (id: number) => void;
  getStatusColor: (status: string) => string;
}

const MarketplaceDetailSection = ({
  listing,
  imageIndex,
  onImagePrevClick,
  onImageNextClick,
  onImageSelect,
  onCloseClick,
  onQuickOfferClick,
  onShareClick,
  savedListings,
  onToggleSave,
  getStatusColor
}: MarketplaceDetailSectionProps) => {
  return (
    <AnimatePresence>
      {listing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onCloseClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCloseClick}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="overflow-y-auto max-h-[90vh]">
              <div className="relative h-64 sm:h-80 bg-gradient-to-r from-cyan-700 to-cyan-600">
                <div className="absolute inset-0 bg-black/20"></div>

                <img
                  src={listing.images[imageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />

                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={onImagePrevClick}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={onImageNextClick}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {listing.images.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => onImageSelect(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            imageIndex === index
                              ? 'bg-white w-4'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">
                      {listing.material.toUpperCase()}
                    </div>
                    <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1">
                      <Star size={10} className="fill-white" />
                      {listing.rating} ({listing.reviews})
                    </div>
                    <div className={`px-2.5 py-1 backdrop-blur-sm rounded-lg text-xs font-medium ${getStatusColor(listing.status)}`}>
                      {listing.status === 'available' ? 'Available' :
                       listing.status === 'reserved' ? 'Reserved' : 'Collected'}
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{listing.title}</h2>
                  <p className="text-sm text-cyan-100">{listing.businessName}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Eye size={14} />
                          <span className="text-xs font-medium">Views</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {listing.views}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <DollarSign size={14} />
                          <span className="text-xs font-medium">Offers</span>
                        </div>
                        <div className="text-lg font-bold text-cyan-600">
                          {listing.offers}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Clock size={14} />
                          <span className="text-xs font-medium">Posted</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {listing.posted}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <MapPin size={14} />
                          <span className="text-xs font-medium">Distance</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {listing.distance} km
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Package size={18} />
                        Description
                      </h3>
                      <p className="text-gray-600">{listing.detailedDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Scale size={16} />
                          <span className="text-sm font-medium">Quantity</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {listing.quantity} {listing.unit}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Min order: {listing.minOrder} {listing.unit}</div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <DollarSign size={16} />
                          <span className="text-sm font-medium">Price</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-600">
                          RWF {listing.pricePerUnit.toLocaleString()}/{listing.unit === 'kg' ? 'kg' : 'L'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Total value: RWF {(listing.quantity * listing.pricePerUnit).toLocaleString()}</div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Calendar size={16} />
                          <span className="text-sm font-medium">Pickup Schedule</span>
                        </div>
                        <div className="text-gray-900">
                          {listing.pickupSchedule}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Building size={16} />
                          <span className="text-sm font-medium">Location</span>
                        </div>
                        <div className="text-gray-900">
                          {listing.location}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {listing.distance} km away
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-cyan-50 p-4 rounded-xl">
                        <h4 className="font-medium text-cyan-700 mb-2">Packaging & Storage</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Package size={12} />
                            <span>{listing.packaging}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building size={12} />
                            <span>{listing.storage}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-xl">
                        <h4 className="font-medium text-green-700 mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-1">
                          {listing.certifications.map((cert: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-white/50 text-green-600 rounded text-xs">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Tag size={16} />
                        Tags & Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="font-bold text-gray-900 mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                            <Building size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Business</div>
                            <div className="font-medium text-gray-900">{listing.businessName}</div>
                            <div className="text-xs text-gray-500">{listing.businessType} • {listing.yearsInOperation} years</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                            <Phone size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Contact Person</div>
                            <div className="font-medium text-gray-900">{listing.contact.person}</div>
                            <div className="text-xs text-gray-500">{listing.contact.title}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                            <Phone size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium text-gray-900">{listing.contact.phone}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                            <Mail size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="font-medium text-gray-900">{listing.contact.email}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {listing.status === 'available' && (
                        <button
                          onClick={onQuickOfferClick}
                          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <DollarSign size={18} />
                          Make an Offer
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button className="py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <MessageCircle size={16} />
                          Message
                        </button>
                        <button
                          onClick={() => onToggleSave(listing.id)}
                          className={`py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            savedListings.includes(listing.id)
                              ? 'bg-rose-50 border-2 border-rose-200 text-rose-600'
                              : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Heart size={16} className={savedListings.includes(listing.id) ? 'fill-rose-500' : ''} />
                          {savedListings.includes(listing.id) ? 'Saved' : 'Save'}
                        </button>
                      </div>

                      <button
                        onClick={() => onShareClick(listing)}
                        className="w-full py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 size={16} />
                        Share Listing
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Leaf size={20} className="text-green-600" />
                        <h4 className="font-bold text-gray-900">Environmental Impact</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">CO₂ Savings</span>
                          <span className="font-bold text-green-700">{listing.co2Savings} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Quality Rating</span>
                          <span className="font-bold text-cyan-700">{listing.qualityRating}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                            style={{ width: `${(listing.rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="font-bold text-gray-900 mb-3">Rating Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(listing.ratingBreakdown).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{key}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500"
                                  style={{ width: `${(value / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarketplaceDetailSection;
