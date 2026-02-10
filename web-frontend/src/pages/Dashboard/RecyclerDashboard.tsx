// pages/dashboard/RecyclerDashboard.tsx
import  { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Package, DollarSign, TrendingUp, ShoppingCart, 
  Leaf, CheckCircle, Clock, Search, AlertCircle,
  Download, Filter, Eye, Settings, Save, X, User, Mail, Phone, MapPin, Star, Calendar
} from 'lucide-react';

import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import ChartComponent from '../../components/dashboard/ChartComponent';

// Real Rwanda recycling facility images
const AFRICAN_IMAGES = {
  recycler: [
    'https://images.unsplash.com/photo-1532996122724-8f3c58d4d0df?w=500&h=300&fit=crop', // Recycling center
    'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500&h=300&fit=crop', // Waste sorting
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop', // Green materials
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop', // Processing
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop', // Environment
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'  // Community
  ]
};

const ImageWithFallback = ({ src, alt, className }: { src?: string; alt: string; className: string }) => {
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-cyan-100 to-cyan-100 flex items-center justify-center`}>
        <Leaf className="text-cyan-600 opacity-30" size={40} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

const RecyclerDashboard = () => {
  const [stats] = useState({
    totalPurchases: 156,
    activeBids: 8,
    totalSpent: 2500000,
    materialsProcessed: 15000,
    savedAmount: 450000
  });

  const [recyclerProfile, setRecyclerProfile] = useState({
    name: 'Green Recyclers Rwanda',
    email: 'info@greenrecyclers.rw',
    phone: '+250-788-234-567',
    address: 'KG 15 Ave, Kigali Industrial Park',
    facilityType: 'Multi-Material',
    capacity: '500 tons/month',
    certifications: ['ISO 14001', 'Rwanda Environment Authority'],
    autoNotify: true,
    priceAlerts: true,
    monthlyReports: true,
    preferredMaterials: ['UCO', 'Plastic', 'Glass']
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const mockMarketplace = [
    { id: 1, seller: 'Kigali Hotel', material: 'UCO', quantity: '50kg', price: 25000, location: 'Kigali', quality: 'High', date: '2024-02-10' },
    { id: 2, seller: 'City Restaurant', material: 'Glass', quantity: '200kg', price: 30000, location: 'Kigali', quality: 'Medium', date: '2024-02-10' },
    { id: 3, seller: 'Hilltop Hotel', material: 'Paper', quantity: '80kg', price: 12000, location: 'Musanze', quality: 'High', date: '2024-02-09' },
    { id: 4, seller: 'Riverside Cafe', material: 'Plastic', quantity: '150kg', price: 45000, location: 'Gisenyi', quality: 'Medium', date: '2024-02-09' },
  ];

  const mockPurchases = [
    { id: 1, date: '2024-02-09', seller: 'Kigali Hotel', material: 'UCO', quantity: '45kg', amount: 22500, status: 'completed', driver: 'John Driver' },
    { id: 2, date: '2024-02-08', seller: 'City Restaurant', material: 'Glass', quantity: '180kg', amount: 27000, status: 'in-transit', driver: 'Mary Driver' },
    { id: 3, date: '2024-02-07', seller: 'Hilltop Hotel', material: 'Paper', quantity: '75kg', amount: 11250, status: 'scheduled', driver: 'John Driver' },
  ];

  const handleSaveSettings = () => {
    alert('Recycler settings saved successfully!');
    setShowSettingsModal(false);
  };

  const handleViewListing = (listing: any) => {
    setSelectedListing(listing);
    setShowListingModal(true);
  };

  const handlePlaceBid = (listing: any) => {
    alert(`Bid placed for ${listing.quantity} of ${listing.material} from ${listing.seller}`);
  };

  const [filterVisible, setFilterVisible] = useState(false);

  const handleFilterPurchases = () => {
    setFilterVisible(!filterVisible);
  };

  const handleExportPurchases = () => {
    const purchases = mockPurchases || [];
    const csvContent = "Seller,Material,Quantity,Price,Status\n" + 
      purchases.map((l: any) => `${l.seller},${l.material},${l.quantity},RWF ${l.price},${l.status}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchases_export.csv';
    a.click();
  };

  const handleAction = (message: string) => {
    alert(message);
  };

  const SettingsModal = ({ isOpen, onClose }: any) => {
    const [settings, setSettings] = useState(recyclerProfile);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="text-cyan-600" size={28} />
              <h3 className="text-2xl font-bold">Recycler Settings</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Facility Name
                </label>
                <input 
                  type="text" 
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Facility Type</label>
                <select 
                  value={settings.facilityType}
                  onChange={(e) => setSettings({...settings, facilityType: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option>Multi-Material</option>
                  <option>Plastic Only</option>
                  <option>Glass Only</option>
                  <option>Metal Only</option>
                  <option>Organic/UCO</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Facility Address
              </label>
              <textarea 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Capacity</label>
                <input 
                  type="text" 
                  value={settings.capacity}
                  onChange={(e) => setSettings({...settings, capacity: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Materials</label>
                <div className="flex flex-wrap gap-2">
                  {['UCO', 'Plastic', 'Glass', 'Paper', 'Metal'].map((mat) => (
                    <label key={mat} className="flex items-center space-x-1">
                      <input 
                        type="checkbox" 
                        checked={settings.preferredMaterials.includes(mat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({...settings, preferredMaterials: [...settings.preferredMaterials, mat]});
                          } else {
                            setSettings({...settings, preferredMaterials: settings.preferredMaterials.filter(m => m !== mat)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{mat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                {([
                  { key: 'autoNotify', label: 'Notify when preferred materials are listed' },
                  { key: 'priceAlerts', label: 'Alert when prices drop below threshold' },
                  { key: 'monthlyReports', label: 'Receive monthly sustainability reports' }
                ]).map((pref) => (
                  <label key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <span className="text-sm font-medium">{pref.label}</span>
                    <input 
                      type="checkbox" 
                      checked={settings[pref.key as keyof typeof settings] as boolean}
                      onChange={(e) => setSettings({...settings, [pref.key]: e.target.checked})}
                      className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => { setRecyclerProfile(settings); handleSaveSettings(); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-600 flex items-center justify-center space-x-2">
              <Save size={20} />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ListingModal = ({ listing, isOpen, onClose }: any) => {
    if (!isOpen || !listing) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Material Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.recycler[1]} 
              alt="Material preview" 
              className="w-full h-48 rounded-lg object-cover"
            />

            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="text-lg font-bold text-cyan-600">{listing.seller}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Material</p>
                <p className="text-lg font-bold text-cyan-600">{listing.material}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="text-lg font-bold">{listing.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-bold">RWF {listing.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-bold">{listing.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quality</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < (listing.quality === 'High' ? 5 : 3) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <h4 className="font-semibold text-cyan-900 mb-2">Material Description</h4>
              <p className="text-sm text-cyan-800">
                Quality {listing.quality.toLowerCase()} {listing.material} available for immediate pickup. 
                Verified by platform. Location: {listing.location}.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { handlePlaceBid(listing); onClose(); }} className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold">
                Place Bid
              </button>
              <button onClick={() => { alert('Purchase request sent'); onClose(); }} className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Overview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard 
          title="Total Purchases"
          value={stats.totalPurchases}
          icon={<ShoppingCart className="text-cyan-500" size={24} />}
          change="+12 this month"
        />
        <StatCard 
          title="Active Bids"
          value={stats.activeBids}
          icon={<TrendingUp className="text-cyan-500" size={24} />}
          change="8 pending"
        />
        <StatCard 
          title="Total Spent"
          value={`RWF ${(stats.totalSpent / 1000)}K`}
          icon={<DollarSign className="text-purple-500" size={24} />}
          change="+15%"
        />
        <StatCard 
          title="Materials Processed"
          value={`${stats.materialsProcessed}kg`}
          icon={<Package className="text-green-500" size={24} />}
          change="+2500kg"
        />
        <StatCard 
          title="Saved Amount"
          value={`RWF ${(stats.savedAmount / 1000)}K`}
          icon={<Leaf className="text-green-600" size={24} />}
          change="vs market price"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Available Materials" icon={<Package size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.recycler[0]} 
              alt="Available materials" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <div className="flex items-center space-x-2 mb-3">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search materials..." 
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button className="px-3 py-2 bg-cyan-600 text-white rounded-lg">
                <Filter size={16} />
              </button>
            </div>
            <DataTable
              columns={[
                { key: 'material', label: 'Material' },
                { key: 'quantity', label: 'Qty' },
                { key: 'price', label: 'Price', render: (value) => `RWF ${value.toLocaleString()}` },
                { key: 'seller', label: 'Seller' },
                { key: 'actions', label: '', render: (_, row) => (
                  <button onClick={() => handleViewListing(row)} className="text-cyan-600 hover:text-cyan-800 text-sm font-medium">
                    View
                  </button>
                )}
              ]}
              data={mockMarketplace.slice(0, 4)}
            />
          </div>
        </DashboardWidget>

        <DashboardWidget title="Recent Purchases" icon={<CheckCircle size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.recycler[3]} 
              alt="Purchase history" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <DataTable
              columns={[
                { key: 'material', label: 'Material' },
                { key: 'quantity', label: 'Qty' },
                { key: 'amount', label: 'Amount', render: (value) => `RWF ${value.toLocaleString()}` },
                { key: 'status', label: 'Status', render: (value) => (
                  <span className={`px-2 py-1 rounded text-xs ${
                    value === 'completed' ? 'bg-green-100 text-green-800' :
                    value === 'in-transit' ? 'bg-cyan-100 text-cyan-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{value}</span>
                )}
              ]}
              data={mockPurchases}
            />
          </div>
        </DashboardWidget>
      </div>

      <ListingModal listing={selectedListing} isOpen={showListingModal} onClose={() => setShowListingModal(false)} />
    </div>
  );

  const Marketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Material Marketplace</h2>
        <div className="flex gap-3">
          <button onClick={handleFilterPurchases} className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button onClick={handleExportPurchases} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available" value="45" icon={<Package className="text-cyan-500" size={24} />} change="" />
        <StatCard title="My Bids" value={stats.activeBids} icon={<TrendingUp className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Watchlist" value="12" icon={<Eye className="text-purple-500" size={24} />} change="" />
        <StatCard title="Saved" value="RWF 450K" icon={<DollarSign className="text-green-500" size={24} />} change="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMarketplace.map((listing) => (
          <div key={listing.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewListing(listing)}>
            <ImageWithFallback 
              src={AFRICAN_IMAGES.recycler[Math.floor(Math.random() * AFRICAN_IMAGES.recycler.length)]} 
              alt={listing.material} 
              className="w-full h-32 rounded-lg object-cover mb-3"
            />
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{listing.material}</h3>
                <p className="text-sm text-gray-600">{listing.seller}</p>
              </div>
              <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs font-semibold">
                {listing.quality}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold">{listing.quantity}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{listing.location}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-2xl font-bold text-cyan-600">RWF {listing.price.toLocaleString()}</span>
              <button onClick={(e) => { e.stopPropagation(); handlePlaceBid(listing); }} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-semibold">
                Bid Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <ListingModal listing={selectedListing} isOpen={showListingModal} onClose={() => setShowListingModal(false)} />
    </div>
  );

  const MyPurchases = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase History</h2>
        <button onClick={() => handleAction('Purchase history exported.')} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Purchases" value={stats.totalPurchases} icon={<ShoppingCart className="text-cyan-500" size={24} />} change="+12%" />
        <StatCard title="This Month" value="12" icon={<Calendar className="text-cyan-500" size={24} />} change="+8%" />
        <StatCard title="Completed" value="142" icon={<CheckCircle className="text-green-500" size={24} />} change="" />
        <StatCard title="In Transit" value="14" icon={<Clock className="text-yellow-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'date', label: 'Date' },
          { key: 'seller', label: 'Seller' },
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
          { key: 'driver', label: 'Driver' },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'completed' ? 'bg-green-100 text-green-800' :
              value === 'in-transit' ? 'bg-cyan-100 text-cyan-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>{value}</span>
          )}
        ]}
        data={mockPurchases}
      />
    </div>
  );

  const Analytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Procurement Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Spending Trend" icon={<TrendingUp size={20} />}>
          <ChartComponent type="line" data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [350000, 420000, 480000, 450000, 520000, 500000],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }]
          }} />
        </DashboardWidget>

        <DashboardWidget title="Material Distribution" icon={<Package size={20} />}>
          <ChartComponent type="bar" data={{
            labels: ['UCO', 'Plastic', 'Glass', 'Paper', 'Metal'],
            datasets: [{
              data: [550, 420, 380, 280, 220],
              backgroundColor: '#3b82f6',
            }]
          }} />
        </DashboardWidget>
      </div>
    </div>
  );

  const Logistics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Logistics Management</h2>
        <button onClick={() => handleAction('Driver assignment opened.')} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Assign Driver</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="In Transit" value="8" icon={<Clock className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Scheduled" value="5" icon={<Calendar className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Completed" value="142" icon={<CheckCircle className="text-green-500" size={24} />} change="" />
        <StatCard title="Avg. ETA" value="45 min" icon={<MapPin className="text-cyan-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'seller', label: 'Seller' },
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'driver', label: 'Driver' },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'completed' ? 'bg-green-100 text-green-800' :
              value === 'in-transit' ? 'bg-cyan-100 text-cyan-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>{value}</span>
          )}
        ]}
        data={mockPurchases}
      />
    </div>
  );

  const Inventory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stock" value="1,420kg" icon={<Package className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Low Stock" value="3" icon={<AlertCircle className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Inbound" value="620kg" icon={<TrendingUp className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Processed" value="780kg" icon={<CheckCircle className="text-green-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'quality', label: 'Quality' },
          { key: 'location', label: 'Location' },
        ]}
        data={mockMarketplace}
      />
    </div>
  );

  const Financial = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Dashboard</h2>
        <button onClick={() => handleAction('Financial report exported.')} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Spent" value={`RWF ${stats.totalSpent.toLocaleString()}`} icon={<DollarSign className="text-cyan-500" size={24} />} change="+10%" />
        <StatCard title="Saved" value={`RWF ${stats.savedAmount.toLocaleString()}`} icon={<TrendingUp className="text-green-500" size={24} />} change="" />
        <StatCard title="Active Bids" value={stats.activeBids} icon={<Package className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Invoices" value="24" icon={<CheckCircle className="text-purple-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'seller', label: 'Seller' },
          { key: 'material', label: 'Material' },
          { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'completed' ? 'bg-green-100 text-green-800' :
              value === 'in-transit' ? 'bg-cyan-100 text-cyan-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>{value}</span>
          )}
        ]}
        data={mockPurchases}
      />
    </div>
  );

  const SupplierNetwork = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Supplier Network</h2>
        <button onClick={() => handleAction('Supplier invite sent.')} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Invite Supplier</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Suppliers" value="18" icon={<User className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Top Rated" value="6" icon={<Star className="text-yellow-500" size={24} />} change="" />
        <StatCard title="New This Month" value="3" icon={<CheckCircle className="text-green-500" size={24} />} change="" />
        <StatCard title="Regions" value="4" icon={<MapPin className="text-cyan-500" size={24} />} change="" />
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-3">
        {Array.from(new Set(mockPurchases.map(p => p.seller))).map((seller) => (
          <div key={seller} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">{seller}</p>
              <p className="text-sm text-gray-600">Preferred materials: UCO, Glass</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">Active</span>
          </div>
        ))}
      </div>
    </div>
  );

  const RecyclerSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Facility Profile</h2>
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          <Settings size={20} />
          <span>Edit Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Facility Information</h3>
          <ImageWithFallback 
            src={AFRICAN_IMAGES.recycler[0]} 
            alt="Facility" 
            className="w-full h-48 rounded-lg object-cover mb-4"
          />
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Facility Name</span>
              <span className="font-semibold">{recyclerProfile.name}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold">{recyclerProfile.facilityType}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Capacity</span>
              <span className="font-semibold">{recyclerProfile.capacity}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold">{recyclerProfile.email}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold">{recyclerProfile.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold text-right">{recyclerProfile.address}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Certifications</h3>
            <div className="space-y-2">
              {recyclerProfile.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Preferred Materials</h3>
            <div className="flex flex-wrap gap-2">
              {recyclerProfile.preferredMaterials.map((mat, idx) => (
                <span key={idx} className="px-3 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold">
                  {mat}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Material Alerts</span>
                <span className={`px-2 py-1 rounded text-xs ${recyclerProfile.autoNotify ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {recyclerProfile.autoNotify ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Price Alerts</span>
                <span className={`px-2 py-1 rounded text-xs ${recyclerProfile.priceAlerts ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {recyclerProfile.priceAlerts ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Reports</span>
                <span className={`px-2 py-1 rounded text-xs ${recyclerProfile.monthlyReports ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {recyclerProfile.monthlyReports ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );

  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="overview" element={<Overview />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="purchases" element={<MyPurchases />} />
      <Route path="logistics" element={<Logistics />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="financial" element={<Financial />} />
      <Route path="suppliers" element={<SupplierNetwork />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<RecyclerSettings />} />
    </Routes>
  );
};

export default RecyclerDashboard;