import { useState, useEffect } from 'react';
import { 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Star, 
  Search, 
  DollarSign, 
  Package, 
  Heart,
  X,
  Check,
  Clock,
  Leaf,
  Droplets,
  Building,
  Home,
  Calendar,
  Scale,
  MessageCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Tag,
  Eye,
  ShoppingBag,
  Share2
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MarketplacePage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    materials: [] as string[],
    distance: 50,
    priceRange: { min: 0, max: 5000 },
    sortBy: 'newest',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [quickOffer, setQuickOffer] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [imageIndex, setImageIndex] = useState(0);
  const [savedListings, setSavedListings] = useState<number[]>([]);
  const navigate = useNavigate();

  const materialTypes = [
    { id: 'uco', name: 'Used Cooking Oil', icon: <Droplets size={16} />, color: 'amber', description: 'For biodiesel production' },
    { id: 'glass', name: 'Glass Bottles', icon: <Package size={16} />, color: 'cyan', description: 'Recyclable containers' },
    { id: 'paper', name: 'Paper & Cardboard', icon: <Leaf size={16} />, color: 'cyan', description: 'Packaging materials' },
    { id: 'plastic', name: 'Plastic Containers', icon: <Package size={16} />, color: 'cyan', description: 'PET and other plastics' },
    { id: 'metal', name: 'Metal Cans', icon: <Package size={16} />, color: 'gray', description: 'Aluminum and steel' },
    { id: 'organic', name: 'Organic Waste', icon: <Leaf size={16} />, color: 'green', description: 'Compost materials' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First', icon: <Clock size={14} /> },
    { id: 'price_low', label: 'Price: Low to High', icon: <DollarSign size={14} /> },
    { id: 'price_high', label: 'Price: High to Low', icon: <DollarSign size={14} /> },
    { id: 'distance', label: 'Nearest First', icon: <MapPin size={14} /> },
    { id: 'quantity', label: 'Largest Quantity', icon: <Package size={14} /> },
    { id: 'rating', label: 'Highest Rated', icon: <Star size={14} /> }
  ];

  const statusOptions = [
    { id: 'all', label: 'All Status', color: 'gray' },
    { id: 'available', label: 'Available', color: 'green' },
    { id: 'reserved', label: 'Reserved', color: 'amber' },
    { id: 'collected', label: 'Collected', color: 'cyan' }
  ];

  const listings = [
    {
      id: 1,
      businessName: 'Serena Hotel Kigali',
      rating: 4.8,
      reviews: 42,
      material: 'uco',
      title: 'Premium Used Cooking Oil',
      description: 'High-quality UCO filtered weekly, ideal for biodiesel production. Collected from our main kitchen and filtered through 3-stage filtration system.',
      detailedDescription: 'This premium used cooking oil is collected daily from our professional kitchen facilities. We implement a strict 3-stage filtration process to ensure purity and quality. The oil is stored in food-grade containers and maintained at optimal temperature. Perfect for biodiesel production or industrial applications.',
      quantity: 500,
      unit: 'liters',
      pricePerUnit: 750,
      location: 'KN 3 Ave, Kigali',
      distance: 1.2,
      posted: '2 hours ago',
      postedDate: '2024-02-10 09:30',
      images: [
        'https://www.cookers.com.au/uploads/Used_Cooking_Oil_Image_ac8436bc79.webp', // Waste/oil collection
        'https://www.oliveoilandbeyond.com/v/vspfiles/assets/images/iStock-514730493.jpg', // Oil processing
        'https://media.istockphoto.com/id/1325836067/photo/used-oil-bottles.jpg?s=612x612&w=0&k=20&c=dm4WGdpr6zoujl2EoehJeH0Mnrfr5YqMNjoTC8xiKZg=' // Sorted waste
      ],
      tags: ['Weekly Collection', 'Filtered', 'Biodiesel Ready', '3-Stage Filtration', 'Food Grade'],
      contact: {
        phone: '+250 788 123 456',
        email: 'waste@serena.rw',
        person: 'John Gasana',
        title: 'Sustainability Manager'
      },
      pickupSchedule: 'Monday-Friday, 9AM-5PM',
      qualityRating: 'A+',
      co2Savings: 1200,
      status: 'available',
      views: 156,
      offers: 8,
      minOrder: 50,
      packaging: 'Food-grade plastic containers',
      storage: 'Temperature controlled',
      certifications: ['ISO 14001', 'HACCP'],
      businessType: '5-Star Hotel',
      yearsInOperation: 15,
      ratingBreakdown: {
        quality: 4.9,
        reliability: 4.7,
        communication: 4.8,
        timeliness: 4.6
      }
    },
    {
      id: 2,
      businessName: 'Hotel des Mille Collines',
      rating: 4.6,
      reviews: 38,
      material: 'glass',
      title: 'Clear Glass Bottles Collection',
      description: 'Sorted by color, clean and ready for recycling. Collected from our bars and restaurants, washed and sanitized.',
      detailedDescription: 'Our glass bottle collection program ensures proper sorting by color (clear, green, brown). All bottles are washed, sanitized, and inspected before being made available. We collect from 3 bars and 2 restaurants daily, ensuring consistent supply. Packaging includes protective wrapping to prevent breakage during transport.',
      quantity: 200,
      unit: 'kg',
      pricePerUnit: 150,
      location: 'KN 4 Ave, Kigali',
      distance: 0.5,
      posted: '5 hours ago',
      postedDate: '2024-02-10 06:45',
      images: [
        'https://recyclinginside.com/wp-content/uploads/2021/11/Harsco_LCL_Waste_Glass.jpeg', // Glass bottles
        'https://meyer-corp.eu/wp-content/uploads/2026/02/sorting-glass-1024x606.webp', // Sorted glass
        'https://cdn.shopify.com/s/files/1/0724/0725/3308/files/Glass_Containers.webp' // Recycling facility
      ],
      tags: ['Color Sorted', 'Clean', 'Bulk Available', 'Washed', 'Sanitized'],
      contact: {
        phone: '+250 788 234 567',
        email: 'recycling@millecollines.rw',
        person: 'Marie Uwase',
        title: 'Environmental Officer'
      },
      pickupSchedule: 'Daily, 10AM-4PM',
      qualityRating: 'A',
      co2Savings: 800,
      status: 'available',
      views: 89,
      offers: 5,
      minOrder: 20,
      packaging: 'Cardboard boxes with dividers',
      storage: 'Dry, secure storage',
      certifications: ['Green Hotel Certification'],
      businessType: '4-Star Hotel',
      yearsInOperation: 12,
      ratingBreakdown: {
        quality: 4.7,
        reliability: 4.5,
        communication: 4.6,
        timeliness: 4.4
      }
    },
    {
      id: 3,
      businessName: 'Radisson Blu Hotel',
      rating: 4.9,
      reviews: 56,
      material: 'paper',
      title: 'Corrugated Cardboard Boxes',
      description: 'Flattened and bundled, perfect for packaging. Collected from deliveries and storage areas, kept dry and clean.',
      detailedDescription: 'We generate significant cardboard waste from deliveries and packaging. All cardboard is flattened, bundled, and kept in dry storage to maintain quality. Our staff is trained in proper waste segregation. We can provide certificates of origin for all materials. Regular collections ensure fresh supply.',
      quantity: 800,
      unit: 'kg',
      pricePerUnit: 50,
      location: 'KG 7 Ave, Kigali',
      distance: 2.8,
      posted: '1 day ago',
      postedDate: '2024-02-09 14:20',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf5MgVto6CLIqQFdY4hP9mMGkiMr7AH-kMXg&s', // Paper/cardboard bales
        'https://www.wastepaperbrokers.com/wp-content/uploads/2022/03/Sorted-Residential-Papers-waste.jpg', // Sorted waste
        'https://www.packaging-gateway.com/wp-content/uploads/sites/16/2017/09/3-image-22.jpg' // Recycling center
      ],
      tags: ['Flattened', 'Bundled', 'Weekly', 'Dry Storage', 'Clean'],
      contact: {
        phone: '+250 788 345 678',
        email: 'sustainability@radisson.rw',
        person: 'David Nkusi',
        title: 'Facilities Manager'
      },
      pickupSchedule: 'Wednesday & Friday, 8AM-12PM',
      qualityRating: 'A+',
      co2Savings: 1500,
      status: 'reserved',
      views: 234,
      offers: 12,
      minOrder: 100,
      packaging: 'Plastic wrapped bundles',
      storage: 'Covered dry area',
      certifications: ['ISO 14001', 'LEED Certified'],
      businessType: '5-Star Hotel',
      yearsInOperation: 8,
      ratingBreakdown: {
        quality: 4.9,
        reliability: 4.8,
        communication: 4.9,
        timeliness: 4.7
      }
    },
    {
      id: 4,
      businessName: 'Marriott Hotel',
      rating: 4.7,
      reviews: 45,
      material: 'plastic',
      title: 'PET Bottles Collection',
      description: 'Sorted PET bottles, washed and ready for processing. Collected from guest rooms and restaurants.',
      detailedDescription: 'Our PET bottle collection system covers all guest rooms and restaurant areas. Bottles are sorted by type (PET #1), washed, and crushed for efficient storage. We maintain detailed records of collection volumes. Available for pickup twice weekly with flexible scheduling options.',
      quantity: 150,
      unit: 'kg',
      pricePerUnit: 120,
      location: 'KG 5 Ave, Kigali',
      distance: 3.2,
      posted: '2 days ago',
      postedDate: '2024-02-08 11:15',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrWSxHUoTB4_K9BPKPrAymA2fX5cllIuMPiA&s',
        'https://img.yfisher.com/m0/1753692000813-38dbb6fd5266d01621f58871de2a9d0a34fa358c/jpg70-t3-scale100.webp',
        'https://corporate.dow.com/content/dam/images/public-images/corporate/seek-together/mr-green-africa-960x500.jpg'
      ],
      tags: ['PET Only', 'Washed', 'Sorted', 'Sanitized', 'Crushed'],
      contact: {
        phone: '+250 788 456 789',
        email: 'environment@marriott.rw',
        person: 'Sarah Mukamana',
        title: 'Green Team Lead'
      },
      pickupSchedule: 'Monday-Thursday, 9AM-3PM',
      qualityRating: 'A',
      co2Savings: 600,
      status: 'available',
      views: 167,
      offers: 7,
      minOrder: 25,
      packaging: 'Bulk bags',
      storage: 'Designated recycling area',
      certifications: ['Marriott Green Program'],
      businessType: '5-Star Hotel',
      yearsInOperation: 10,
      ratingBreakdown: {
        quality: 4.8,
        reliability: 4.6,
        communication: 4.7,
        timeliness: 4.5
      }
    },
    {
      id: 5,
      businessName: 'Kigali Convention Center',
      rating: 4.8,
      reviews: 32,
      material: 'metal',
      title: 'Aluminum Cans Bulk',
      description: 'Crushed aluminum cans from events and restaurants. Clean and ready for smelting.',
      detailedDescription: 'As a major events venue, we generate significant aluminum waste from beverage cans. All cans are collected separately, crushed, and stored in designated containers. We follow strict hygiene protocols. Available after major events or on weekly basis. Can provide volume estimates for planning.',
      quantity: 300,
      unit: 'kg',
      pricePerUnit: 180,
      location: 'KG 2 Ave, Kigali',
      distance: 4.1,
      posted: '3 days ago',
      postedDate: '2024-02-07 16:40',
      images: [
        'https://b2486448.smushcdn.com/2486448/wp-content/uploads/2023/08/Scrap-metal-recycling.jpg?lossy=2&strip=1&webp=1',
        'https://scx2.b-cdn.net/gfx/news/2022/theres-money-in-trash.jpg',
        'https://th-thumbnailer.cdn-si-edu.com/c6PY7rBR-hvBQJBVO95YyCcjTUE=/fit-in/1072x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/ba/aa/baaac2c9-36bc-43eb-a8ac-07e6475f1f9c/04.jpg'
      ],
      tags: ['Aluminum', 'Crushed', 'Event Waste', 'Clean', 'High Volume'],
      contact: {
        phone: '+250 788 567 890',
        email: 'waste@kcc.rw',
        person: 'James Habimana',
        title: 'Operations Manager'
      },
      pickupSchedule: 'After Events, by appointment',
      qualityRating: 'A',
      co2Savings: 1000,
      status: 'available',
      views: 198,
      offers: 9,
      minOrder: 50,
      packaging: 'Metal containers',
      storage: 'Secure outdoor storage',
      certifications: ['Event Sustainability Certified'],
      businessType: 'Convention Center',
      yearsInOperation: 6,
      ratingBreakdown: {
        quality: 4.7,
        reliability: 4.8,
        communication: 4.6,
        timeliness: 4.7
      }
    },
    {
      id: 6,
      businessName: 'Ubumwe Grande Hotel',
      rating: 4.5,
      reviews: 28,
      material: 'organic',
      title: 'Food Waste Compost Ready',
      description: 'Separated food waste from kitchen operations. Ideal for composting operations.',
      detailedDescription: 'Our food waste is carefully separated from other waste streams. We maintain separate bins for vegetable waste, fruit waste, and cooked food waste. All waste is collected daily and stored in sealed containers to prevent contamination. Perfect for composting operations or biogas production.',
      quantity: 400,
      unit: 'kg',
      pricePerUnit: 30,
      location: 'KK 15 Ave, Kigali',
      distance: 5.3,
      posted: '4 days ago',
      postedDate: '2024-02-06 08:20',
      images: [
        'https://www.expadd.org/wp-content/uploads/2022/10/TOF-001.jpg',
        'https://www.fao.org/images/faonearestlibraries/actionareas/female-workers-sorting-the-waste-into-different-categories.jpg?sfvrsn=ac5ef81f_5',
        'https://www.urbanfarms.co.za/wp-content/uploads/elementor/thumbs/farm_offload_2-scaled-p552j0kekwpxch05bg9m363uzd1af9c5hx9cloygeg.jpg'
      ],
      tags: ['Food Waste', 'Separated', 'Compost', 'Daily', 'Organic'],
      contact: {
        phone: '+250 788 678 901',
        email: 'green@ubumwe.rw',
        person: 'Grace Iradukunda',
        title: 'Kitchen Manager'
      },
      pickupSchedule: 'Daily, 6AM-10AM',
      qualityRating: 'B+',
      co2Savings: 300,
      status: 'available',
      views: 123,
      offers: 4,
      minOrder: 50,
      packaging: 'Sealed compostable bags',
      storage: 'Refrigerated storage',
      certifications: ['Organic Waste Certified'],
      businessType: '4-Star Hotel',
      yearsInOperation: 7,
      ratingBreakdown: {
        quality: 4.4,
        reliability: 4.5,
        communication: 4.3,
        timeliness: 4.6
      }
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

  const handleClearFilters = () => {
    setSelectedFilters({
      materials: [],
      distance: 50,
      priceRange: { min: 0, max: 5000 },
      sortBy: 'newest',
      status: 'all'
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredListings = listings
    .filter(listing => {
      if (selectedFilters.materials.length > 0 && !selectedFilters.materials.includes(listing.material)) {
        return false;
      }
      if (listing.distance > selectedFilters.distance) {
        return false;
      }
      if (listing.pricePerUnit < selectedFilters.priceRange.min || listing.pricePerUnit > selectedFilters.priceRange.max) {
        return false;
      }
      if (selectedFilters.status !== 'all' && listing.status !== selectedFilters.status) {
        return false;
      }
      if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !listing.businessName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !listing.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
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
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleMakeOffer = (listingId: number, amount: string) => {
    if (amount.trim()) {
      const listing = listings.find(l => l.id === listingId);
      const offer = parseFloat(amount);
      const totalValue = offer * listing?.quantity!;
      
      // In a real app, this would be an API call
      alert(`✅ Offer of RWF ${offer.toLocaleString()} submitted for ${listing?.title}\nTotal Value: RWF ${totalValue.toLocaleString()}\nBusiness: ${listing?.businessName}`);
      setOfferAmount('');
      setQuickOffer(null);
    }
  };

  const toggleSaveListing = (listingId: number) => {
    setSavedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleShareListing = (listing: any) => {
    const shareText = `Check out this listing on EcoTrade  Marketplace: ${listing.title} - ${listing.businessName}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    if (filtersVisible || selectedListing || quickOffer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [filtersVisible, selectedListing, quickOffer]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-amber-100 text-amber-800';
      case 'collected': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-20 pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <button 
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 text-cyan-100 hover:text-white mb-3 text-sm transition-colors"
                >
                  <Home size={14} />
                  Back to Home
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">EcoTrade  Marketplace</h1>
                <p className="text-cyan-100 text-sm">Discover and trade recyclable materials across Kigali</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <ShoppingBag size={14} />
                  <span>{listings.length} active listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Stats Bar */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search materials, businesses, tags, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Stats and Controls */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                  <Package size={14} />
                  <span>{filteredListings.length} results</span>
                </div>
                
                <button
                  onClick={() => setFiltersVisible(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  <Filter size={14} />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-24">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>

                {/* Material Types */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 text-sm">Material Type</h4>
                  <div className="space-y-1.5">
                    {materialTypes.map(material => (
                      <button
                        key={material.id}
                        onClick={() => handleMaterialToggle(material.id)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors text-sm ${
                          selectedFilters.materials.includes(material.id)
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            selectedFilters.materials.includes(material.id)
                              ? 'bg-cyan-100 text-cyan-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {material.icon}
                          </div>
                          <div className="text-left">
                            <div className="text-gray-700 font-medium">{material.name}</div>
                            <div className="text-xs text-gray-500">{material.description}</div>
                          </div>
                        </div>
                        {selectedFilters.materials.includes(material.id) && (
                          <Check size={14} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 text-sm">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(status => (
                      <button
                        key={status.id}
                        onClick={() => setSelectedFilters(prev => ({ ...prev, status: status.id }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedFilters.status === status.id
                            ? `${getStatusColor(status.id)} border border-current`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 text-sm">Price Range (RWF)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.min}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.max}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 5000 }
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 text-sm">Sort By</h4>
                  <div className="space-y-1.5">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedFilters(prev => ({ ...prev, sortBy: option.id }))}
                        className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors text-sm ${
                          selectedFilters.sortBy === option.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {option.icon}
                          </div>
                          <span className="text-gray-700">{option.label}</span>
                        </div>
                        {selectedFilters.sortBy === option.id && (
                          <Check size={14} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Listings</h2>
                  <p className="text-gray-600 text-sm mt-1">Browse and make offers on available materials</p>
                </div>
                
                <div className="flex items-center gap-3">
                  
                  <div className="flex bg-gray-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setView('grid')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${
                        view === 'grid' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Grid size={16} />
                      Grid
                    </button>
                    <button
                      onClick={() => setView('list')}
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

              {/* Active Filters Display */}
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
                            onClick={() => handleMaterialToggle(materialId)}
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
                          onClick={() => setSelectedFilters(prev => ({ ...prev, status: 'all' }))}
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
                          onClick={() => setSearchQuery('')}
                          className="ml-1 hover:text-cyan-700"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium ml-auto"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Listings Display */}
              <AnimatePresence mode="wait">
                {filteredListings.length > 0 ? (
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
                            onViewDetails={() => setSelectedListing(listing)}
                            onToggleSave={() => toggleSaveListing(listing.id)}
                            onShare={() => handleShareListing(listing)}
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
                            onViewDetails={() => setSelectedListing(listing)}
                            onToggleSave={() => toggleSaveListing(listing.id)}
                            onShare={() => handleShareListing(listing)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-cyan-600 text-white'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
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
                      onClick={handleClearFilters}
                      className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {filtersVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setFiltersVisible(false)}
            />
            
            {/* Filters Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setFiltersVisible(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-5">
                {/* Material Types */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Material Type</h4>
                  <div className="space-y-1.5">
                    {materialTypes.map(material => (
                      <button
                        key={material.id}
                        onClick={() => handleMaterialToggle(material.id)}
                        className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors ${
                          selectedFilters.materials.includes(material.id)
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            selectedFilters.materials.includes(material.id)
                              ? 'bg-cyan-100 text-cyan-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {material.icon}
                          </div>
                          <div className="text-left">
                            <div className="text-gray-700 font-medium">{material.name}</div>
                            <div className="text-xs text-gray-500">{material.description}</div>
                          </div>
                        </div>
                        {selectedFilters.materials.includes(material.id) && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(status => (
                      <button
                        key={status.id}
                        onClick={() => setSelectedFilters(prev => ({ ...prev, status: status.id }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedFilters.status === status.id
                            ? `${getStatusColor(status.id)} border border-current`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Price Range (RWF)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.min}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none"
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.max}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 5000 }
                        }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                  <div className="space-y-1.5">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedFilters(prev => ({ ...prev, sortBy: option.id }))}
                        className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors ${
                          selectedFilters.sortBy === option.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span className="text-gray-700">{option.label}</span>
                        </div>
                        {selectedFilters.sortBy === option.id && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleClearFilters}
                      className="py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setFiltersVisible(false)}
                      className="py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listing Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setSelectedListing(null);
                setImageIndex(0);
              }}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setImageIndex(0);
                }}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="overflow-y-auto max-h-[90vh]">
                {/* Image Gallery */}
                <div className="relative h-64 sm:h-80 bg-gradient-to-r from-cyan-700 to-cyan-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Main Image */}
                  <img
                    src={selectedListing.images[imageIndex]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Navigation */}
                  {selectedListing.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImageIndex(prev => prev > 0 ? prev - 1 : selectedListing.images.length - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => setImageIndex(prev => prev < selectedListing.images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedListing.images.map((_: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => setImageIndex(index)}
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
                  
                  {/* Header Info */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">
                        {selectedListing.material.toUpperCase()}
                      </div>
                      <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium flex items-center gap-1">
                        <Star size={10} className="fill-white" />
                        {selectedListing.rating} ({selectedListing.reviews})
                      </div>
                      <div className={`px-2.5 py-1 backdrop-blur-sm rounded-lg text-xs font-medium ${getStatusColor(selectedListing.status)}`}>
                        {selectedListing.status === 'available' ? 'Available' : 
                         selectedListing.status === 'reserved' ? 'Reserved' : 'Collected'}
                      </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{selectedListing.title}</h2>
                    <p className="text-sm text-cyan-100">{selectedListing.businessName}</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Eye size={14} />
                            <span className="text-xs font-medium">Views</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedListing.views}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <DollarSign size={14} />
                            <span className="text-xs font-medium">Offers</span>
                          </div>
                          <div className="text-lg font-bold text-cyan-600">
                            {selectedListing.offers}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Clock size={14} />
                            <span className="text-xs font-medium">Posted</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedListing.posted}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <MapPin size={14} />
                            <span className="text-xs font-medium">Distance</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedListing.distance} km
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Package size={18} />
                          Description
                        </h3>
                        <p className="text-gray-600">{selectedListing.detailedDescription}</p>
                      </div>
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Scale size={16} />
                            <span className="text-sm font-medium">Quantity</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {selectedListing.quantity} {selectedListing.unit}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Min order: {selectedListing.minOrder} {selectedListing.unit}</div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <DollarSign size={16} />
                            <span className="text-sm font-medium">Price</span>
                          </div>
                          <div className="text-xl font-bold text-cyan-600">
                            RWF {selectedListing.pricePerUnit.toLocaleString()}/{selectedListing.unit === 'kg' ? 'kg' : 'L'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Total value: RWF {(selectedListing.quantity * selectedListing.pricePerUnit).toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Calendar size={16} />
                            <span className="text-sm font-medium">Pickup Schedule</span>
                          </div>
                          <div className="text-gray-900">
                            {selectedListing.pickupSchedule}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Building size={16} />
                            <span className="text-sm font-medium">Location</span>
                          </div>
                          <div className="text-gray-900">
                            {selectedListing.location}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {selectedListing.distance} km away
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-cyan-50 p-4 rounded-xl">
                          <h4 className="font-medium text-cyan-700 mb-2">Packaging & Storage</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Package size={12} />
                              <span>{selectedListing.packaging}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building size={12} />
                              <span>{selectedListing.storage}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-xl">
                          <h4 className="font-medium text-green-700 mb-2">Certifications</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedListing.certifications.map((cert: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-white/50 text-green-600 rounded text-xs">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Tag size={16} />
                          Tags & Features
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedListing.tags.map((tag: string, index: number) => (
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
                    
                    {/* Right Column - Contact & Actions */}
                    <div className="space-y-6">
                      {/* Contact Info */}
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="font-bold text-gray-900 mb-4">Contact Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                              <Building size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Business</div>
                              <div className="font-medium text-gray-900">{selectedListing.businessName}</div>
                              <div className="text-xs text-gray-500">{selectedListing.businessType} • {selectedListing.yearsInOperation} years</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                              <Phone size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Contact Person</div>
                              <div className="font-medium text-gray-900">{selectedListing.contact.person}</div>
                              <div className="text-xs text-gray-500">{selectedListing.contact.title}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                              <Phone size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Phone</div>
                              <div className="font-medium text-gray-900">{selectedListing.contact.phone}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                              <Mail size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Email</div>
                              <div className="font-medium text-gray-900">{selectedListing.contact.email}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {selectedListing.status === 'available' && (
                          <button
                            onClick={() => {
                              setQuickOffer(selectedListing.id);
                              setSelectedListing(null);
                              setImageIndex(0);
                            }}
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
                            onClick={() => toggleSaveListing(selectedListing.id)}
                            className={`py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                              savedListings.includes(selectedListing.id)
                                ? 'bg-rose-50 border-2 border-rose-200 text-rose-600'
                                : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Heart size={16} className={savedListings.includes(selectedListing.id) ? 'fill-rose-500' : ''} />
                            {savedListings.includes(selectedListing.id) ? 'Saved' : 'Save'}
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleShareListing(selectedListing)}
                          className="w-full py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Share2 size={16} />
                          Share Listing
                        </button>
                      </div>
                      
                      {/* Environmental Impact */}
                      <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl p-5 border border-green-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Leaf size={20} className="text-green-600" />
                          <h4 className="font-bold text-gray-900">Environmental Impact</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">CO₂ Savings</span>
                            <span className="font-bold text-green-700">{selectedListing.co2Savings} kg</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Quality Rating</span>
                            <span className="font-bold text-cyan-700">{selectedListing.qualityRating}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                              style={{ width: `${(selectedListing.rating / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Rating Breakdown */}
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="font-bold text-gray-900 mb-3">Rating Breakdown</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedListing.ratingBreakdown).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">{key}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-cyan-500"
                                    style={{ width: `${(value as number / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{value as number}</span>
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

      {/* Quick Offer Modal */}
      <AnimatePresence>
        {quickOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setQuickOffer(null)}
            />
            
            {/* Offer Form */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Make an Offer</h3>
                <button
                  onClick={() => setQuickOffer(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Amount per Unit (RWF)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Enter your offer amount"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                      autoFocus
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Listing: <span className="font-medium">{listings.find(l => l.id === quickOffer)?.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Current price: <span className="font-bold text-cyan-600">RWF {listings.find(l => l.id === quickOffer)?.pricePerUnit.toLocaleString()}/{listings.find(l => l.id === quickOffer)?.unit === 'kg' ? 'kg' : 'L'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Quantity: <span className="font-medium">{listings.find(l => l.id === quickOffer)?.quantity} {listings.find(l => l.id === quickOffer)?.unit}</span>
                  </div>
                  {offerAmount && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Total offer value: <span className="font-bold text-green-600">
                          RWF {(parseFloat(offerAmount) * (listings.find(l => l.id === quickOffer)?.quantity || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setQuickOffer(null)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleMakeOffer(quickOffer, offerAmount)}
                    disabled={!offerAmount || parseFloat(offerAmount) <= 0}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Offer
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 text-center pt-2">
                  Your offer will be sent to the business owner for review
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        {/* Badges */}
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
        
        {/* Action Buttons */}
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
        
        {/* Rating Badge */}
        <div className="absolute top-14 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-700">{listing.rating}</span>
        </div>
        
        {/* Distance Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <MapPin size={10} />
            <span>{listing.distance} km</span>
          </div>
        </div>
        
        {/* Views Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <Eye size={10} />
            <span>{listing.views}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business Info */}
        <div className="flex items-center gap-2 mb-2">
          <Building size={12} className="text-gray-400" />
          <span className="text-xs text-gray-500 truncate">{listing.businessName}</span>
        </div>
        
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">
          {listing.title}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
        
        {/* Stats */}
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
        
        {/* Tags */}
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
        
        {/* Footer */}
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
        {/* Image */}
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
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              {/* Header */}
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
              
              {/* Title and Business */}
              <h3 className="font-bold text-gray-900 text-lg mb-1">{listing.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Building size={12} className="text-gray-400" />
                <span className="text-sm text-gray-600">{listing.businessName}</span>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
              
              {/* Stats */}
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
              
              {/* Tags */}
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
            
            {/* Actions */}
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

export default MarketplacePage;