// pages/dashboard/BusinessDashboard.tsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Package, DollarSign, TrendingUp, Clock, 
  Leaf, CheckCircle, AlertCircle, Calendar,
  Download, Filter, Eye, Settings, Save, X, User, Mail, Phone, MapPin
} from 'lucide-react';

import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import ChartComponent from '../../components/dashboard/ChartComponent';

// Real Rwanda HORECA & business images
const AFRICAN_IMAGES = {
  business: [
    'https://qsvenolia.com/wp-content/uploads/2025/01/used-cooking-oil.jpg', // UCO/cooking oil waste
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7euyAkb89Gbe8Utr_O_9Gd5dkPjaOZZxugg&s', // Glass bottles from restaurants
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7EolrBK6coZtN7Jx5nLIupLGwepaT7LJM6g&s', // Paper/cardboard waste
    'https://www.newtimes.co.rw/uploads/imported_images/files/main/articles/2019/02/05/web-food-waste-getty.jpg', // Food waste sorting
    'https://abdas.org/wp-content/uploads/2020/08/Rwanda-turns-plastic-into-construction-material.jpg', // Plastic bottles from business
    'https://www.ktpress.rw/wp-content/uploads/2023/06/Single-Use-Plastics-2-1.jpg'  // Glass waste collection
  ]
};

const ImageWithFallback = ({ src, alt, className }: { src?: string; alt: string; className: string }) => {
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-green-100 to-cyan-100 flex items-center justify-center`}>
        <Leaf className="text-green-600 opacity-30" size={40} />
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

const SimpleBarChart = ({ data }: { data: number[] }) => (
  <svg viewBox="0 0 400 200" className="w-full h-48 mt-4">
    {data.map((value, idx) => (
      <rect 
        key={idx}
        x={idx * 80 + 20} 
        y={200 - value} 
        width="60" 
        height={value} 
        fill="#10b981" 
        opacity="0.8"
        rx="4"
      />
    ))}
  </svg>
);

const BusinessDashboard = () => {
  const [stats] = useState({
    totalListings: 45,
    activeListings: 12,
    totalRevenue: 450000,
    pendingPickups: 3,
    wasteReduction: 2500
  });

  const [businessProfile, setBusinessProfile] = useState({
    name: 'Kigali Grand Hotel',
    email: 'info@kigalihotel.com',
    phone: '+250-788-123-456',
    address: 'KN 4 Ave, Kigali',
    businessType: 'Hotel',
    verified: true,
    autoListing: true,
    notifyPickup: true,
    monthlyReports: true,
    minListingAmount: 5000
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const mockListings = [
    { id: 1, material: 'UCO', quantity: '50kg', price: 25000, status: 'active', date: '2024-02-10', buyer: 'Green Recyclers' },
    { id: 2, material: 'Glass', quantity: '200kg', price: 30000, status: 'pending', date: '2024-02-10', buyer: null },
    { id: 3, material: 'Paper', quantity: '80kg', price: 12000, status: 'sold', date: '2024-02-09', buyer: 'Plastic Solutions' },
    { id: 4, material: 'Plastic', quantity: '150kg', price: 45000, status: 'active', date: '2024-02-09', buyer: null },
    { id: 5, material: 'Metal', quantity: '120kg', price: 60000, status: 'expired', date: '2024-02-08', buyer: null },
  ];

  const mockTransactions = [
    { id: 1, date: '2024-02-09', material: 'UCO', quantity: '45kg', amount: 22500, buyer: 'Green Recyclers', status: 'completed' },
    { id: 2, date: '2024-02-08', material: 'Glass', quantity: '180kg', amount: 27000, buyer: 'Plastic Solutions', status: 'completed' },
    { id: 3, date: '2024-02-07', material: 'Paper', quantity: '75kg', amount: 11250, buyer: 'Green Recyclers', status: 'pending' },
  ];

  const handleSaveSettings = () => {
    alert('Business settings saved successfully!');
    setShowSettingsModal(false);
  };

  const handleViewListing = (listing: any) => {
    setSelectedListing(listing);
    setShowListingModal(true);
  };

  const [filterVisible, setFilterVisible] = useState(false);

  const handleFilterListings = () => {
    setFilterVisible(!filterVisible);
  };

  const handleCreateNewListing = () => {
    alert('New listing form opened.');
  };

  const handleExportTransactions = () => {
    const csvContent = "Material,Quantity,Amount,Buyer,Status,Date\n" + 
      mockTransactions.map(t => `${t.material},${t.quantity},RWF ${t.amount},${t.buyer},${t.status},${t.date}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    a.click();
  };

  const handleAction = (message: string) => {
    alert(message);
  };

  const SettingsModal = ({ isOpen, onClose }: any) => {
    const [settings, setSettings] = useState(businessProfile);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="text-green-600" size={28} />
              <h3 className="text-2xl font-bold">Business Settings</h3>
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
                  Business Name
                </label>
                <input 
                  type="text" 
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
                <select 
                  value={settings.businessType}
                  onChange={(e) => setSettings({...settings, businessType: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Hotel</option>
                  <option>Restaurant</option>
                  <option>Cafe</option>
                  <option>Catering</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Business Address
              </label>
              <textarea 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Listing Amount (RWF)</label>
              <input 
                type="number" 
                value={settings.minListingAmount}
                onChange={(e) => setSettings({...settings, minListingAmount: parseInt(e.target.value)})}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                {[
                  { key: 'autoListing', label: 'Auto-list materials when threshold reached' },
                  { key: 'notifyPickup', label: 'Notify when pickup is scheduled' },
                  { key: 'monthlyReports', label: 'Receive monthly sustainability reports' }
                ].map((pref) => (
                  <label key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <span className="text-sm font-medium">{pref.label}</span>
                    <input 
                      type="checkbox" 
                      checked={settings[pref.key as keyof typeof settings] as boolean}
                      onChange={(e) => setSettings({...settings, [pref.key]: e.target.checked})}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
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
            <button onClick={() => { setBusinessProfile(settings); handleSaveSettings(); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-cyan-600 flex items-center justify-center space-x-2">
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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.business[Math.floor(Math.random() * AFRICAN_IMAGES.business.length)]} 
              alt={listing.material} 
              className="w-full h-64 object-cover"
            />
            <button onClick={onClose} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-green-600">{listing.material}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                listing.status === 'active' ? 'bg-green-100 text-green-800' :
                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                listing.status === 'sold' ? 'bg-cyan-100 text-cyan-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {listing.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-green-50 to-cyan-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="text-lg font-bold text-cyan-600">{listing.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-bold text-green-600">RWF {listing.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Listed</p>
                <p className="text-lg font-bold">{listing.date}</p>
              </div>
            </div>

            {listing.buyer && (
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-sm font-semibold text-cyan-800">Buyer: {listing.buyer}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Material Details</p>
              <p className="text-gray-700">High quality {listing.material.toLowerCase()} waste from our operations. Ready for pickup and processing.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => alert('Edit listing')} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
                Edit Listing
              </button>
              <button onClick={() => alert('Delete listing')} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition">
                Delete
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
          title="Total Listings"
          value={stats.totalListings}
          icon={<Package className="text-green-500" size={24} />}
          change="+8 this month"
        />
        <StatCard 
          title="Active Listings"
          value={stats.activeListings}
          icon={<TrendingUp className="text-cyan-500" size={24} />}
          change="12 active"
        />
        <StatCard 
          title="Total Revenue"
          value={`RWF ${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="text-cyan-500" size={24} />}
          change="+15%"
        />
        <StatCard 
          title="Pending Pickups"
          value={stats.pendingPickups}
          icon={<Clock className="text-yellow-500" size={24} />}
          change="3 scheduled"
        />
        <StatCard 
          title="Waste Reduction"
          value={`${stats.wasteReduction}kg`}
          icon={<Leaf className="text-green-600" size={24} />}
          change="+420kg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Active Listings" icon={<Package size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.business[0]} 
              alt="Business operations" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <DataTable
              columns={[
                { key: 'material', label: 'Material' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'price', label: 'Price (RWF)', render: (value) => value.toLocaleString() },
                { key: 'status', label: 'Status', render: (value) => (
                  <span className={`px-2 py-1 rounded text-xs ${
                    value === 'active' ? 'bg-green-100 text-green-800' :
                    value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    value === 'sold' ? 'bg-cyan-100 text-cyan-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{value}</span>
                )},
                { key: 'actions', label: 'Actions', render: (_, row) => (
                  <button onClick={() => handleViewListing(row)} className="text-cyan-600 hover:text-cyan-800">
                    <Eye size={16} />
                  </button>
                )}
              ]}
              data={mockListings.filter(l => l.status === 'active' || l.status === 'pending')}
            />
          </div>
        </DashboardWidget>

        <DashboardWidget title="Revenue Overview" icon={<DollarSign size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.business[1]} 
              alt="Revenue analytics" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <SimpleBarChart data={[120, 150, 180, 160, 200]} />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">RWF 450K</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">RWF 90K</p>
                <p className="text-xs text-gray-600">This Month</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">+15%</p>
                <p className="text-xs text-gray-600">Growth</p>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <DashboardWidget title="Recent Transactions" icon={<CheckCircle size={20} />}>
        <div className="space-y-4">
          <ImageWithFallback 
            src={AFRICAN_IMAGES.business[4]} 
            alt="Transaction history" 
            className="w-full h-32 rounded-lg object-cover"
          />
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'material', label: 'Material' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
              { key: 'buyer', label: 'Buyer' },
              { key: 'status', label: 'Status', render: (value) => (
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{value}</span>
              )}
            ]}
            data={mockTransactions}
          />
        </div>
      </DashboardWidget>

      <ListingModal listing={selectedListing} isOpen={showListingModal} onClose={() => setShowListingModal(false)} />
    </div>
  );

  const MyListings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <div className="flex gap-3">
          <button onClick={handleFilterListings} className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button onClick={handleCreateNewListing} className="px-4 py-2 bg-green-600 text-white rounded-lg">
            + New Listing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.totalListings} icon={<Package className="text-gray-500" size={24} />} change="" />
        <StatCard title="Active" value={stats.activeListings} icon={<TrendingUp className="text-green-500" size={24} />} change="" />
        <StatCard title="Sold" value="28" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Expired" value="5" icon={<AlertCircle className="text-red-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'price', label: 'Price (RWF)', render: (value) => value.toLocaleString() },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'active' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              value === 'sold' ? 'bg-cyan-100 text-cyan-800' :
              'bg-gray-100 text-gray-800'
            }`}>{value}</span>
          )},
          { key: 'date', label: 'Date' },
          { key: 'actions', label: 'Actions', render: (_, row) => (
            <button onClick={() => handleViewListing(row)} className="text-cyan-600 hover:text-cyan-800">
              <Eye size={16} />
            </button>
          )}
        ]}
        data={mockListings}
      />

      <ListingModal listing={selectedListing} isOpen={showListingModal} onClose={() => setShowListingModal(false)} />
    </div>
  );

  const Transactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button onClick={handleExportTransactions} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="RWF 450K" icon={<DollarSign className="text-green-500" size={24} />} change="+15%" />
        <StatCard title="This Month" value="RWF 90K" icon={<Calendar className="text-cyan-500" size={24} />} change="+8%" />
        <StatCard title="Completed" value="42" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Pending" value="3" icon={<Clock className="text-yellow-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'date', label: 'Date' },
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
          { key: 'buyer', label: 'Buyer' },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>{value}</span>
          )}
        ]}
        data={mockTransactions}
      />
    </div>
  );

  const Analytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Business Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Revenue Trend" icon={<TrendingUp size={20} />}>
          <ChartComponent type="line" data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [75000, 85000, 95000, 88000, 102000, 90000],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            }]
          }} />
        </DashboardWidget>

        <DashboardWidget title="Material Distribution" icon={<Package size={20} />}>
          <ChartComponent type="bar" data={{
            labels: ['UCO', 'Glass', 'Paper', 'Plastic', 'Metal'],
            datasets: [{
              data: [450, 320, 280, 380, 150],
              backgroundColor: '#10b981',
            }]
          }} />
        </DashboardWidget>
      </div>
    </div>
  );

  const Marketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Marketplace</h2>
        <button onClick={() => handleAction('Marketplace filter applied.')} className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Listings" value={stats.activeListings} icon={<Package className="text-green-500" size={24} />} change="" />
        <StatCard title="Pending Orders" value="6" icon={<Clock className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Avg. Price" value="RWF 28K" icon={<DollarSign className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Views" value="1.2K" icon={<Eye className="text-cyan-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'price', label: 'Price (RWF)', render: (value) => value.toLocaleString() },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'active' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>{value}</span>
          )},
          { key: 'date', label: 'Date' },
        ]}
        data={mockListings}
      />
    </div>
  );

  const Financial = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Dashboard</h2>
        <button onClick={() => handleAction('Financial report exported.')} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={`RWF ${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-green-500" size={24} />} change="+15%" />
        <StatCard title="Pending Payouts" value="RWF 60K" icon={<Clock className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Completed" value="42" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Avg. Order" value="RWF 22K" icon={<TrendingUp className="text-cyan-500" size={24} />} change="" />
      </div>

      <DataTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'material', label: 'Material' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
          { key: 'buyer', label: 'Buyer' },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>{value}</span>
          )}
        ]}
        data={mockTransactions}
      />
    </div>
  );

  const SchedulePickups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedule & Pickups</h2>
        <button onClick={() => handleAction('Pickup scheduling opened.')} className="px-4 py-2 bg-green-600 text-white rounded-lg">+ New Pickup</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Scheduled" value="3" icon={<Calendar className="text-green-500" size={24} />} change="" />
        <StatCard title="In Progress" value="1" icon={<Clock className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Completed" value="18" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Cancelled" value="0" icon={<AlertCircle className="text-red-500" size={24} />} change="" />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">Upcoming Pickups</h3>
        <div className="space-y-3">
          {[
            { id: 1, date: '2024-02-12', time: '10:00 AM', material: 'UCO (50kg)', status: 'scheduled' },
            { id: 2, date: '2024-02-13', time: '02:30 PM', material: 'Glass (200kg)', status: 'scheduled' },
            { id: 3, date: '2024-02-14', time: '09:00 AM', material: 'Plastic (150kg)', status: 'in-progress' },
          ].map((pickup) => (
            <div key={pickup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{pickup.material}</p>
                <p className="text-sm text-gray-600">{pickup.date} • {pickup.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                pickup.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>{pickup.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const GreenScore = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Green Score</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Score" value="82" icon={<Leaf className="text-green-600" size={24} />} change="+4" />
        <StatCard title="CO₂ Saved" value="1.2t" icon={<Leaf className="text-emerald-500" size={24} />} change="+0.3t" />
        <StatCard title="Waste Reduced" value="2,500kg" icon={<Package className="text-cyan-500" size={24} />} change="+320kg" />
        <StatCard title="Rank" value="Top 10%" icon={<TrendingUp className="text-cyan-500" size={24} />} change="" />
      </div>

      <DashboardWidget title="Monthly Sustainability" icon={<Leaf size={20} />}>
        <ChartComponent type="line" data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: [60, 65, 70, 74, 78, 82],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }]
        }} />
      </DashboardWidget>
    </div>
  );

  const Reports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <button onClick={() => handleAction('Reports downloaded.')} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Download All</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        {[
          { title: 'Monthly Sustainability Report', date: 'Feb 2024', status: 'ready' },
          { title: 'Revenue Summary', date: 'Feb 2024', status: 'ready' },
          { title: 'Pickup Efficiency', date: 'Jan 2024', status: 'ready' },
        ].map((report, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">{report.title}</p>
              <p className="text-sm text-gray-600">{report.date}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">{report.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const BusinessSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Profile</h2>
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Settings size={20} />
          <span>Edit Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Business Information</h3>
          <ImageWithFallback 
            src={AFRICAN_IMAGES.business[1]} 
            alt="Business profile" 
            className="w-full h-48 rounded-lg object-cover mb-4"
          />
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Business Name</span>
              <span className="font-semibold">{businessProfile.name}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold">{businessProfile.businessType}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold">{businessProfile.email}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold">{businessProfile.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold">{businessProfile.address}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Settings & Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Verified Account</span>
              <span className={`px-3 py-1 rounded-full text-sm ${businessProfile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {businessProfile.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Auto-listing</span>
              <span className={`px-3 py-1 rounded-full text-sm ${businessProfile.autoListing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {businessProfile.autoListing ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Pickup Notifications</span>
              <span className={`px-3 py-1 rounded-full text-sm ${businessProfile.notifyPickup ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {businessProfile.notifyPickup ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Monthly Reports</span>
              <span className={`px-3 py-1 rounded-full text-sm ${businessProfile.monthlyReports ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {businessProfile.monthlyReports ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Min Listing Amount</span>
              <span className="font-semibold">RWF {businessProfile.minListingAmount.toLocaleString()}</span>
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
      <Route path="listings" element={<MyListings />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="financial" element={<Financial />} />
      <Route path="schedule" element={<SchedulePickups />} />
      <Route path="greenscore" element={<GreenScore />} />
      <Route path="reports" element={<Reports />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<BusinessSettings />} />
    </Routes>
  );
};

export default BusinessDashboard;