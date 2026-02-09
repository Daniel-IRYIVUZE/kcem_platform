// pages/dashboard/BusinessDashboard.tsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Package, DollarSign, Truck, Leaf, TrendingUp, 
  PlusCircle, Edit, Trash2, Eye, Clock
} from 'lucide-react';
import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';

const BusinessDashboard = () => {
  const [stats] = useState({
    greenScore: 85,
    totalRevenue: 150000,
    wasteDiverted: 1250,
    activeListings: 3,
    co2Saved: 4200,
  });

  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const mockListings = [
    { id: 1, material: 'UCO', quantity: 50, quality: 'Good', price: 25000, status: 'active', date: '2024-02-10' },
    { id: 2, material: 'Glass', quantity: 200, quality: 'Fair', price: 18000, status: 'reserved', date: '2024-02-09' },
    { id: 3, material: 'Paper', quantity: 80, quality: 'Good', price: 12000, status: 'completed', date: '2024-02-08' },
    { id: 4, material: 'UCO', quantity: 35, quality: 'Excellent', price: 19000, status: 'draft', date: '2024-02-10' },
  ];

  const mockOffers = [
    { id: 1, recycler: 'Green Recyclers', material: 'UCO', quantity: 50, price: 25500, status: 'pending' },
    { id: 2, recycler: 'Plastic Solutions', material: 'Glass', quantity: 200, price: 17500, status: 'accepted' },
    { id: 3, recycler: 'Eco Waste', material: 'Paper', quantity: 80, price: 12500, status: 'rejected' },
  ];

  const Overview = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Green Score"
          value={stats.greenScore}
          icon={<Leaf className="text-cyan-500" size={24} />}
          change="+2%"
        />
        <StatCard 
          title="Total Revenue"
          value={`RWF ${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="text-blue-500" size={24} />}
          change="+5%"
        />
        <StatCard 
          title="Waste Diverted"
          value={`${stats.wasteDiverted} kg`}
          icon={<Package className="text-purple-500" size={24} />}
          change="+1.5%"
        />
        <StatCard 
          title="Active Listings"
          value={stats.activeListings}
          icon={<Package className="text-orange-500" size={24} />}
          change="0%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget 
          title="Active Listings" 
          icon={<Package size={20} />}
          action={
            <button className="text-cyan-600 hover:text-cyan-800 flex items-center space-x-1">
              <PlusCircle size={16} />
              <span>New Listing</span>
            </button>
          }
        >
          <div className="overflow-x-auto">
            <DataTable
              columns={[
              { key: 'material', label: 'Material' },
              { key: 'quantity', label: 'Quantity (kg)' },
              { key: 'quality', label: 'Quality' },
              { key: 'price', label: 'Price (RWF)', render: (value) => value.toLocaleString() },
              { key: 'status', label: 'Status', render: (value) => (
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'active' ? 'bg-cyan-100 text-cyan-800' :
                  value === 'reserved' ? 'bg-blue-100 text-blue-800' :
                  value === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {value}
                </span>
              )},
              { key: 'actions', label: 'Actions', render: (_, row) => (
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedListing(row); setShowListingModal(true); }} className="text-blue-600 hover:text-blue-800">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => { setSelectedListing(row); setShowListingModal(true); }} className="text-cyan-600 hover:text-cyan-800">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            ]}
            data={mockListings}
          />
          </div>
        </DashboardWidget>

        <DashboardWidget title="Recent Offers" icon={<DollarSign size={20} />}>
          <div className="overflow-x-auto">
          <DataTable
            columns={[
              { key: 'recycler', label: 'Recycler' },
              { key: 'material', label: 'Material' },
              { key: 'quantity', label: 'Quantity (kg)' },
              { key: 'price', label: 'Offer (RWF)', render: (value) => value.toLocaleString() },
              { key: 'status', label: 'Status', render: (value) => (
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'accepted' ? 'bg-cyan-100 text-cyan-800' :
                  value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {value}
                </span>
              )},
              { key: 'actions', label: 'Action', render: (_, row) => (
                row.status === 'pending' ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <button className="px-2 sm:px-3 py-1 bg-cyan-600 text-white rounded text-xs sm:text-sm whitespace-nowrap">
                      Accept
                    </button>
                    <button className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded text-xs sm:text-sm whitespace-nowrap">
                      Reject
                    </button>
                  </div>
                ) : null
              )}
            ]}
            data={mockOffers}
          />
          </div>
        </DashboardWidget>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardWidget title="Upcoming Pickups" icon={<Truck size={20} />}>
          <div className="space-y-4">
            {[
              { time: '10:00 AM', material: 'Glass (200kg)', recycler: 'Plastic Solutions' },
              { time: '2:30 PM', material: 'UCO (50kg)', recycler: 'Green Recyclers' },
              { time: '4:00 PM', material: 'Paper (80kg)', recycler: 'Eco Waste' },
            ].map((pickup, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="text-gray-400" size={16} />
                  <div>
                    <p className="font-medium">{pickup.time}</p>
                    <p className="text-sm text-gray-600">{pickup.material}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{pickup.recycler}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="CO₂ Savings" icon={<Leaf size={20} />}>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-cyan-600">{stats.co2Saved.toLocaleString()}</div>
            <p className="text-gray-600 mt-2">kg of CO₂ saved</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Equivalent to planting {Math.round(stats.co2Saved/21)} trees</p>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Quick Actions" icon={<TrendingUp size={20} />}>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full p-2 sm:p-3 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <PlusCircle size={18} />
              <span>Create New Listing</span>
            </button>
            <button className="w-full p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <DollarSign size={18} />
              <span>View Wallet</span>
            </button>
            <button className="w-full p-2 sm:p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <Edit size={18} />
              <span>Update Profile</span>
            </button>
            <button className="w-full p-2 sm:p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <Package size={18} />
              <span>Browse Marketplace</span>
            </button>
          </div>
        </DashboardWidget>
      </div>

      {/* Listing Details Modal */}
      {showListingModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowListingModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 sm:p-8 rounded-t-2xl text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Listing Details</h2>
                  <p className="text-cyan-100">Material ID: #{selectedListing.id}</p>
                </div>
                <button 
                  onClick={() => setShowListingModal(false)} 
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                >
                  ✕
                </button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <Package className="mx-auto mb-2" size={20} />
                  <div className="text-xl font-bold">{selectedListing.quantity}kg</div>
                  <div className="text-xs text-cyan-100">Quantity</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <DollarSign className="mx-auto mb-2" size={20} />
                  <div className="text-xl font-bold">{selectedListing.price.toLocaleString()}</div>
                  <div className="text-xs text-cyan-100">Price (RWF)</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <Leaf className="mx-auto mb-2" size={20} />
                  <div className="text-xl font-bold">{selectedListing.quality}</div>
                  <div className="text-xs text-cyan-100">Quality</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Material Photos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="w-full h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <img src="/images/kCEM_Logo.png" alt="Material" className="w-12 h-12 opacity-50" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type</label>
                  <input 
                    type="text" 
                    value={selectedListing.material}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select className="w-full p-3 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                    <option value="draft">📝 Draft</option>
                    <option value="active" selected={selectedListing.status === 'active'}>✅ Active</option>
                    <option value="reserved" selected={selectedListing.status === 'reserved'}>🔒 Reserved</option>
                    <option value="completed" selected={selectedListing.status === 'completed'}>✔️ Completed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  placeholder="Describe the material condition, storage, and any special notes..."
                ></textarea>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Pickup Location</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter address"
                />
              </div>

              {/* Offers Section */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">📬 Recent Offers ({mockOffers.length})</h3>
                <div className="space-y-2">
                  {mockOffers.slice(0, 2).map((offer) => (
                    <div key={offer.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{offer.recycler}</div>
                        <div className="text-sm text-gray-600">{offer.quantity}kg • RWF {offer.price.toLocaleString()}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        offer.status === 'accepted' ? 'bg-cyan-100 text-cyan-800' :
                        offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setShowListingModal(false)} 
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 text-sm sm:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CreateListing = () => {
    const [formData, setFormData] = useState({
      material: '',
      quantity: '',
      quality: 'good',
      location: '',
      description: ''
    });

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Create New Listing</h2>
        <form className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.material}
              onChange={(e) => setFormData({...formData, material: e.target.value})}
            >
              <option value="">Select material</option>
              <option value="uco">Used Cooking Oil (UCO)</option>
              <option value="glass">Glass Bottles</option>
              <option value="paper">Paper & Cardboard</option>
              <option value="plastic">Plastic Containers</option>
              <option value="metal">Metal Cans</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
            <input 
              type="number" 
              className="w-full p-3 border border-gray-300 rounded-lg" 
              placeholder="e.g., 50"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {['Excellent', 'Good', 'Fair'].map((quality) => (
                <label key={quality} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="quality" 
                    value={quality.toLowerCase()}
                    checked={formData.quality === quality.toLowerCase()}
                    onChange={(e) => setFormData({...formData, quality: e.target.value})}
                  />
                  <span>{quality}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg" 
              rows={4}
              placeholder="Describe the waste material, storage conditions, etc."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
              <div className="w-full h-48 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                <img src="/images/kCEM_Logo.png" alt="KCEM" className="w-16 h-16 opacity-50" />
              </div>
              <Package className="mx-auto text-gray-400" size={48} />
              <p className="mt-2 text-sm sm:text-base">Drag & drop photos or click to browse</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Maximum 5 photos, 5MB each</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg" 
              placeholder="Enter address or use current location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
            <button type="button" className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base">
              Save as Draft
            </button>
            <button type="submit" className="px-4 sm:px-6 py-2 sm:py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm sm:text-base">
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    );
  };

  const MarketplaceView = () => (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-bold">Browse Marketplace</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
              <img src="/images/kCEM_Logo.png" alt="KCEM" className="w-16 h-16 opacity-50" />
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Recycling Service Available</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Professional recycling pickup and processing</p>
              <div className="flex justify-between items-center">
                <span className="text-cyan-600 font-bold text-sm sm:text-base">RWF 15,000</span>
                <button className="px-3 sm:px-4 py-1 sm:py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm">Contact</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FinancialDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Financial Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Revenue" value="RWF 150K" icon={<DollarSign className="text-cyan-500" size={24} />} change="+5%" />
        <StatCard title="Pending Payments" value="RWF 25K" icon={<Clock className="text-yellow-500" size={24} />} change="3 pending" />
        <StatCard title="This Month" value="RWF 45K" icon={<TrendingUp className="text-blue-500" size={24} />} change="+12%" />
        <StatCard title="Wallet Balance" value="RWF 80K" icon={<DollarSign className="text-purple-500" size={24} />} change="" />
      </div>
      <DashboardWidget title="Transaction History" icon={<DollarSign size={20} />}>
        <div className="overflow-x-auto">
          <DataTable
            columns={[
            { key: 'date', label: 'Date' },
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
            { key: 'status', label: 'Status', render: (value) => (
              <span className={`px-2 py-1 rounded text-xs ${
                value === 'completed' ? 'bg-cyan-100 text-cyan-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{value}</span>
            )}
          ]}
          data={[
            { date: '2024-02-10', description: 'UCO Sale to Green Recyclers', amount: 25500, status: 'completed' },
            { date: '2024-02-09', description: 'Glass Sale to Eco Waste', amount: 18000, status: 'completed' },
            { date: '2024-02-08', description: 'Paper Sale pending', amount: 12000, status: 'pending' },
          ]}
        />
        </div>
      </DashboardWidget>
    </div>
  );

  const SchedulePickups = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Schedule & Pickups</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Upcoming Pickups" icon={<Truck size={20} />}>
          <div className="space-y-4">
            {[
              { time: '10:00 AM', recycler: 'Green Recyclers', material: 'UCO (50kg)', status: 'confirmed' },
              { time: '2:30 PM', recycler: 'Eco Waste', material: 'Glass (200kg)', status: 'pending' },
            ].map((pickup, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{pickup.time}</p>
                    <p className="text-sm text-gray-600">{pickup.recycler}</p>
                    <p className="text-sm text-gray-500">{pickup.material}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    pickup.status === 'confirmed' ? 'bg-cyan-100 text-cyan-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{pickup.status}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-3">
                  <button className="flex-1 px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm">Reschedule</button>
                  <button className="flex-1 px-2 sm:px-3 py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm">Contact</button>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
        <DashboardWidget title="Schedule New Pickup" icon={<PlusCircle size={20} />}>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Listing</label>
              <select className="w-full p-2 border rounded-lg">
                <option>UCO - 50kg</option>
                <option>Glass - 200kg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Date</label>
              <input type="date" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Slot</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Morning (8AM - 12PM)</option>
                <option>Afternoon (12PM - 4PM)</option>
                <option>Evening (4PM - 8PM)</option>
              </select>
            </div>
            <button type="submit" className="w-full p-3 bg-cyan-600 text-white rounded-lg">Schedule Pickup</button>
          </form>
        </DashboardWidget>
      </div>
    </div>
  );

  const GreenScoreDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Green Score Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg border">
          <div className="text-center mb-6">
            <div className="inline-block p-8 bg-cyan-50 rounded-full">
              <div className="text-6xl font-bold text-cyan-600">{stats.greenScore}</div>
            </div>
            <p className="text-xl font-medium mt-4">Your Green Score</p>
            <p className="text-gray-600">Top 15% of businesses</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Waste Diverted</span>
                <span className="text-sm text-gray-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Quality Rating</span>
                <span className="text-sm text-gray-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Consistency</span>
                <span className="text-sm text-gray-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-bold mb-4">Impact Summary</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">CO₂ Saved</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.co2Saved} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Waste Diverted</p>
              <p className="text-2xl font-bold">{stats.wasteDiverted} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trees Equivalent</p>
              <p className="text-2xl font-bold">{Math.round(stats.co2Saved/21)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Reports = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          { title: 'Monthly Summary', description: 'Complete overview of this month', icon: <Package size={24} /> },
          { title: 'Financial Report', description: 'Revenue and transactions', icon: <DollarSign size={24} /> },
          { title: 'Environmental Impact', description: 'CO₂ savings and waste metrics', icon: <Leaf size={24} /> },
        ].map((report, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="text-cyan-600 mb-4">{report.icon}</div>
            <h3 className="font-bold mb-2">{report.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button className="w-full px-4 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50">
              Generate Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="overview" element={<Overview />} />
      <Route path="listings" element={<Overview />} />
      <Route path="listings/new" element={<CreateListing />} />
      <Route path="marketplace" element={<MarketplaceView />} />
      <Route path="financial" element={<FinancialDashboard />} />
      <Route path="schedule" element={<SchedulePickups />} />
      <Route path="greenscore" element={<GreenScoreDashboard />} />
      <Route path="reports" element={<Reports />} />
    </Routes>
  );
};

export default BusinessDashboard;