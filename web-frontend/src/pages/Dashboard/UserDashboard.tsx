import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Leaf, DollarSign, Package, TrendingUp, 
  Award, CheckCircle, Clock, Eye,
  Download, Filter, Settings, Save, X, User, Mail, Phone, MapPin, Camera
} from 'lucide-react';

import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import ChartComponent from '../../components/dashboard/ChartComponent';

// Real Rwanda User/household recycling images
const AFRICAN_IMAGES = {
  User: [
    'https://images.unsplash.com/photo-1532996122724-8f3c58d4d0df?w=500&h=300&fit=crop', // Recycling
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop', // Household items
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop', // Green living
    'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500&h=300&fit=crop', // Waste sorting
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop', // Community
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop'  // Environment
  ]
};

const ImageWithFallback = ({ src, alt, className }: { src?: string; alt: string; className: string }) => {
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center`}>
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

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalEarnings: 125000,
    itemsSold: 24,
    carbonSaved: 450,
    activeListings: 3,
    impactPoints: 890
  });

  useEffect(() => {
    // Simulate fetching new stats
    const fetchStats = () => {
      // Example of updating stats
      setStats(prevStats => ({
        ...prevStats,
        totalEarnings: prevStats.totalEarnings + 1000 // Example increment
      }));
    };

    fetchStats();
  }, []);

  const [userProfile, setUserProfile] = useState({
    name: 'Sarah Uwase',
    email: 'sarah.uwase@email.com',
    phone: '+250-788-456-789',
    address: 'KN 12 Ave, Kigali',
    memberSince: '2024-01-15',
    verified: true,
    receiveNotifications: true,
    priceAlerts: true,
    sustainabilityTips: true,
    preferredCategories: ['Plastic', 'Glass', 'Paper']
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const mockListings = [
    { id: 1, material: 'Plastic Bottles', quantity: '50pcs', price: 5000, status: 'active', date: '2024-02-10', views: 12 },
    { id: 2, material: 'Glass Bottles', quantity: '30pcs', price: 4500, status: 'pending', date: '2024-02-09', views: 8 },
    { id: 3, material: 'Paper/Cardboard', quantity: '15kg', price: 7500, status: 'sold', date: '2024-02-08', views: 15 },
    { id: 4, material: 'Metal Cans', quantity: '20pcs', price: 3000, status: 'active', date: '2024-02-07', views: 6 },
  ];

  const mockTransactions = [
    { id: 1, date: '2024-02-08', material: 'Plastic', quantity: '45pcs', amount: 4500, buyer: 'Green Recyclers', status: 'completed' },
    { id: 2, date: '2024-02-05', material: 'Glass', quantity: '25pcs', amount: 3750, buyer: 'Plastic Solutions', status: 'completed' },
    { id: 3, date: '2024-02-02', material: 'Paper', quantity: '12kg', amount: 6000, buyer: 'Green Recyclers', status: 'pending' },
  ];

  const handleSaveSettings = () => {
    alert('Profile settings saved successfully!');
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

  const handleExportEarnings = () => {
    const csvContent = "Material,Quantity,Amount,Buyer,Status\n" + 
      mockTransactions.map(t => `${t.material},${t.quantity},RWF ${t.amount},${t.buyer},${t.status}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings_export.csv';
    a.click();
  };

  const handleAction = (message: string) => {
    alert(message);
  };

  const SettingsModal = ({ isOpen, onClose }: any) => {
    const [settings, setSettings] = useState(userProfile);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="text-green-600" size={28} />
              <h3 className="text-2xl font-bold">Profile Settings</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {settings.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button onClick={() => handleAction('Upload photo dialog opened.')} className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-green-500">
                  <Camera size={16} className="text-green-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Full Name
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                <input 
                  type="text" 
                  value={settings.memberSince}
                  disabled
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Home Address
              </label>
              <textarea 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Material Categories</label>
              <div className="flex flex-wrap gap-2">
                {['Plastic', 'Glass', 'Paper', 'Metal', 'Electronics', 'Textiles'].map((cat) => (
                  <label key={cat} className="flex items-center space-x-1">
                    <input 
                      type="checkbox" 
                      checked={settings.preferredCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({...settings, preferredCategories: [...settings.preferredCategories, cat]});
                        } else {
                          setSettings({...settings, preferredCategories: settings.preferredCategories.filter(c => c !== cat)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                {[
                  { key: 'receiveNotifications', label: 'Receive notifications when items sell' },
                  { key: 'priceAlerts', label: 'Alert when similar items are listed' },
                  { key: 'sustainabilityTips', label: 'Receive sustainability tips & insights' }
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
            <button onClick={() => { setUserProfile(settings); handleSaveSettings(); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 flex items-center justify-center space-x-2">
              <Save size={20} />
              <span>Save Changes</span>
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
            <h3 className="text-2xl font-bold">Listing Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.User[1]} 
              alt="Item preview" 
              className="w-full h-48 rounded-lg object-cover"
            />

            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Material</p>
                <p className="text-lg font-bold text-green-600">{listing.material}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="text-lg font-bold text-emerald-600">{listing.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-bold">RWF {listing.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="text-lg font-bold flex items-center">
                  <Eye size={16} className="mr-1" />
                  {listing.views}
                </p>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">Status: <span className={`px-2 py-1 rounded ${
                listing.status === 'active' ? 'bg-green-100 text-green-800' :
                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-cyan-100 text-cyan-800'
              }`}>{listing.status}</span></p>
              <p className="text-sm text-green-800 mt-2">Listed on: {listing.date}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { alert('Edit listing'); onClose(); }} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                Edit Listing
              </button>
              <button onClick={() => { alert('Delete listing'); onClose(); }} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
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
          title="Total Earnings"
          value={`RWF ${stats.totalEarnings.toLocaleString()}`}
          icon={<DollarSign className="text-green-500" size={24} />}
          change="+18% this month"
        />
        <StatCard 
          title="Items Sold"
          value={stats.itemsSold}
          icon={<Package className="text-emerald-500" size={24} />}
          change="+5 this week"
        />
        <StatCard 
          title="Carbon Saved"
          value={`${stats.carbonSaved}kg`}
          icon={<Leaf className="text-green-600" size={24} />}
          change="+120kg"
        />
        <StatCard 
          title="Active Listings"
          value={stats.activeListings}
          icon={<TrendingUp className="text-cyan-500" size={24} />}
          change="3 active"
        />
        <StatCard 
          title="Impact Points"
          value={stats.impactPoints}
          icon={<Award className="text-yellow-500" size={24} />}
          change="+95 points"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="My Active Listings" icon={<Package size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.User[0]} 
              alt="Active listings" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <DataTable
              columns={[
                { key: 'material', label: 'Material' },
                { key: 'quantity', label: 'Qty' },
                { key: 'price', label: 'Price', render: (value) => `RWF ${value.toLocaleString()}` },
                { key: 'views', label: 'Views', render: (value) => (
                  <span className="flex items-center">
                    <Eye size={14} className="mr-1" />
                    {value}
                  </span>
                )},
                { key: 'actions', label: '', render: (_, row) => (
                  <button onClick={() => handleViewListing(row)} className="text-green-600 hover:text-green-800 text-sm font-medium">
                    View
                  </button>
                )}
              ]}
              data={mockListings.filter(l => l.status === 'active' || l.status === 'pending')}
            />
          </div>
        </DashboardWidget>

        <DashboardWidget title="Environmental Impact" icon={<Leaf size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.User[2]} 
              alt="Environmental impact" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Leaf size={32} className="text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">{stats.carbonSaved}kg</p>
                <p className="text-sm text-gray-600">CO₂ Saved</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Package size={32} className="text-emerald-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-emerald-600">{stats.itemsSold}</p>
                <p className="text-sm text-gray-600">Items Recycled</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <Award size={32} className="text-cyan-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-cyan-600">{stats.impactPoints}</p>
                <p className="text-sm text-gray-600">Impact Points</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <TrendingUp size={32} className="text-yellow-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-yellow-600">Gold</p>
                <p className="text-sm text-gray-600">Badge Level</p>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <DashboardWidget title="Recent Transactions" icon={<CheckCircle size={20} />}>
        <div className="space-y-4">
          <ImageWithFallback 
            src={AFRICAN_IMAGES.User[4]} 
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
        <StatCard title="Total" value="24" icon={<Package className="text-gray-500" size={24} />} change="" />
        <StatCard title="Active" value={stats.activeListings} icon={<TrendingUp className="text-green-500" size={24} />} change="" />
        <StatCard title="Sold" value="18" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Pending" value="3" icon={<Clock className="text-yellow-500" size={24} />} change="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockListings.map((listing) => (
          <div key={listing.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewListing(listing)}>
            <ImageWithFallback 
              src={AFRICAN_IMAGES.User[Math.floor(Math.random() * AFRICAN_IMAGES.User.length)]} 
              alt={listing.material} 
              className="w-full h-32 rounded-lg object-cover mb-3"
            />
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{listing.material}</h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                listing.status === 'active' ? 'bg-green-100 text-green-800' :
                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-cyan-100 text-cyan-800'
              }`}>
                {listing.status}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold">{listing.quantity}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Views:</span>
              <span className="font-semibold flex items-center">
                <Eye size={14} className="mr-1" />
                {listing.views}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-2xl font-bold text-green-600">RWF {listing.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <ListingModal listing={selectedListing} isOpen={showListingModal} onClose={() => setShowListingModal(false)} />
    </div>
  );

  const Earnings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Earnings & Transactions</h2>
        <button onClick={handleExportEarnings} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Earnings" value={`RWF ${stats.totalEarnings.toLocaleString()}`} icon={<DollarSign className="text-green-500" size={24} />} change="+18%" />
        <StatCard title="This Month" value="RWF 35K" icon={<DollarSign className="text-emerald-500" size={24} />} change="+12%" />
        <StatCard title="Pending" value="RWF 6K" icon={<Clock className="text-yellow-500" size={24} />} change="1 pending" />
        <StatCard title="Completed" value="18" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Earnings Breakdown" icon={<DollarSign size={20} />}>
          <ChartComponent type="bar" data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [15000, 22000, 18000, 28000, 25000, 35000],
              backgroundColor: '#10b981',
            }]
          }} />
        </DashboardWidget>

        <DashboardWidget title="Materials Sold" icon={<Package size={20} />}>
          <ChartComponent type="bar" data={{
            labels: ['Plastic', 'Glass', 'Paper', 'Metal'],
            datasets: [{
              data: [45, 30, 25, 15],
              backgroundColor: '#10b981',
            }]
          }} />
        </DashboardWidget>
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

  const Impact = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Environmental Impact</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="CO₂ Saved" value={`${stats.carbonSaved}kg`} icon={<Leaf className="text-green-500" size={24} />} change="+120kg" />
        <StatCard title="Items Recycled" value={stats.itemsSold} icon={<Package className="text-emerald-500" size={24} />} change="+5" />
        <StatCard title="Impact Points" value={stats.impactPoints} icon={<Award className="text-yellow-500" size={24} />} change="+95" />
        <StatCard title="Badge Level" value="Gold" icon={<Award className="text-yellow-600" size={24} />} change="Level 3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Monthly Impact" icon={<Leaf size={20} />}>
          <ChartComponent type="line" data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [65, 95, 120, 145, 180, 210],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            }]
          }} />
        </DashboardWidget>

        <DashboardWidget title="Impact Achievements" icon={<Award size={20} />}>
          <div className="space-y-4">
            {[
              { title: 'First Sale', desc: 'Made your first sale', points: 50, achieved: true },
              { title: 'Carbon Hero', desc: 'Saved 500kg CO₂', points: 200, achieved: false },
              { title: 'Recycling Master', desc: 'Sold 50 items', points: 300, achieved: false },
              { title: 'Community Leader', desc: 'Referred 5 users', points: 150, achieved: true },
            ].map((achievement, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${achievement.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Award className={achievement.achieved ? 'text-green-600' : 'text-gray-400'} size={24} />
                    <div>
                      <p className="font-bold">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.desc}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${achievement.achieved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {achievement.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
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
        <StatCard title="Available" value="24" icon={<Package className="text-green-500" size={24} />} change="" />
        <StatCard title="Saved" value="6" icon={<Eye className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Avg. Price" value="RWF 4.5K" icon={<DollarSign className="text-emerald-500" size={24} />} change="" />
        <StatCard title="New Today" value="5" icon={<TrendingUp className="text-cyan-500" size={24} />} change="" />
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

  const Orders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
        <button onClick={() => handleAction('Orders exported.')} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
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
        <StatCard title="Total Earnings" value={`RWF ${stats.totalEarnings.toLocaleString()}`} icon={<DollarSign className="text-green-500" size={24} />} change="+18%" />
        <StatCard title="This Month" value="RWF 35K" icon={<DollarSign className="text-emerald-500" size={24} />} change="+12%" />
        <StatCard title="Pending" value="RWF 6K" icon={<Clock className="text-yellow-500" size={24} />} change="1 pending" />
        <StatCard title="Completed" value="18" icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
      </div>

      <DashboardWidget title="Monthly Earnings" icon={<DollarSign size={20} />}>
        <ChartComponent type="bar" data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: [15000, 22000, 18000, 28000, 25000, 35000],
            backgroundColor: '#10b981',
          }]
        }} />
      </DashboardWidget>
    </div>
  );

  const UserSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Settings size={20} />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Personal Information</h3>
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Full Name</span>
              <span className="font-semibold">{userProfile.name}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold">{userProfile.email}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold">{userProfile.phone}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold text-right">{userProfile.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since</span>
              <span className="font-semibold">{userProfile.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Verification Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${userProfile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {userProfile.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Badge Level</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  Gold Member
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Preferred Categories</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.preferredCategories.map((cat, idx) => (
                <span key={idx} className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sales Notifications</span>
                <span className={`px-2 py-1 rounded text-xs ${userProfile.receiveNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {userProfile.receiveNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Price Alerts</span>
                <span className={`px-2 py-1 rounded text-xs ${userProfile.priceAlerts ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {userProfile.priceAlerts ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sustainability Tips</span>
                <span className={`px-2 py-1 rounded text-xs ${userProfile.sustainabilityTips ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {userProfile.sustainabilityTips ? 'Enabled' : 'Disabled'}
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
      <Route path="listings" element={<MyListings />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="orders" element={<Orders />} />
      <Route path="financial" element={<Financial />} />
      <Route path="earnings" element={<Earnings />} />
      <Route path="impact" element={<Impact />} />
      <Route path="settings" element={<UserSettings />} />
    </Routes>
  );
};

export default UserDashboard;
