// pages/dashboard/RecyclerDashboard.tsx
import  { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Package, DollarSign, Truck, Users,
  MapPin, TrendingDown, Calendar, Star
} from 'lucide-react';
import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';

const RecyclerDashboard = () => {
  const [stats] = useState({
    totalSpend: 450000,
    materialsPurchased: 1250,
    activeDrivers: 3,
    routesOptimized: 18,
    upcomingCollections: 7,
    costPerKg: 360
  });

  const mockPurchases = [
    { id: 1, supplier: 'Kigali Hotel', material: 'UCO', quantity: 50, price: 25500, status: 'collected', date: '2024-02-10' },
    { id: 2, supplier: 'City Restaurant', material: 'Glass', quantity: 200, price: 18000, status: 'scheduled', date: '2024-02-11' },
    { id: 3, supplier: 'Hilltop Hotel', material: 'Paper', quantity: 80, price: 12000, status: 'pending', date: '2024-02-12' },
    { id: 4, supplier: 'Riverside Cafe', material: 'UCO', quantity: 35, price: 19000, status: 'completed', date: '2024-02-09' },
  ];

  const mockSuppliers = [
    { id: 1, name: 'Kigali Hotel', rating: 4.8, materials: ['UCO', 'Glass'], totalVolume: 250, reliability: 95 },
    { id: 2, name: 'City Restaurant', rating: 4.5, materials: ['UCO', 'Paper'], totalVolume: 180, reliability: 88 },
    { id: 3, name: 'Hilltop Hotel', rating: 4.2, materials: ['Glass', 'Plastic'], totalVolume: 320, reliability: 92 },
    { id: 4, name: 'Riverside Cafe', rating: 4.9, materials: ['UCO'], totalVolume: 120, reliability: 98 },
  ];

  const Overview = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          title="Total Spend"
          value={`RWF ${stats.totalSpend.toLocaleString()}`}
          icon={<DollarSign className="text-blue-500" size={24} />}
          change="+8.5%"
        />
        <StatCard 
          title="Materials Purchased"
          value={`${stats.materialsPurchased} kg`}
          icon={<Package className="text-cyan-500" size={24} />}
          change="+12.3%"
        />
        <StatCard 
          title="Cost Per Kg"
          value={`RWF ${stats.costPerKg}`}
          icon={<TrendingDown className="text-red-500" size={24} />}
          change="-5.2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DashboardWidget title="Recent Purchases" icon={<Package size={20} />}>
          <div className="overflow-x-auto">
            <DataTable
            columns={[
              { key: 'supplier', label: 'Supplier' },
              { key: 'material', label: 'Material' },
              { key: 'quantity', label: 'Quantity (kg)' },
              { key: 'price', label: 'Price (RWF)', render: (value) => value.toLocaleString() },
              { key: 'status', label: 'Status', render: (value) => (
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                  value === 'collected' ? 'bg-blue-100 text-blue-800' :
                  value === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {value}
                </span>
              )},
              { key: 'date', label: 'Date' },
              { key: 'action', label: 'Action', render: (_, row) => (
                row.status === 'pending' ? (
                  <button className="px-3 py-1 bg-cyan-600 text-white rounded text-sm">
                    Schedule
                  </button>
                ) : null
              )}
            ]}
            data={mockPurchases}
          />
          </div>
        </DashboardWidget>

        <DashboardWidget title="Top Suppliers" icon={<Users size={20} />}>
          <div className="overflow-x-auto">
          <DataTable
            columns={[
              { key: 'name', label: 'Supplier' },
              { key: 'rating', label: 'Rating', render: (value) => (
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="ml-1">{value}</span>
                </div>
              )},
              { key: 'materials', label: 'Materials', render: (value) => value.join(', ') },
              { key: 'totalVolume', label: 'Total Volume (kg)' },
              { key: 'reliability', label: 'Reliability', render: (value) => `${value}%` },
              { key: 'actions', label: 'Actions', render: () => (
                <button className="px-3 py-1 border border-gray-300 rounded text-sm">
                  View Details
                </button>
              )}
            ]}
            data={mockSuppliers}
          />
          </div>
        </DashboardWidget>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Upcoming Collections" icon={<Calendar size={20} />}>
          <div className="space-y-4">
            {[
              { time: '9:00 AM', supplier: 'Kigali Hotel', material: 'UCO (50kg)', driver: 'John D.', eta: '8:45 AM' },
              { time: '11:30 AM', supplier: 'City Restaurant', material: 'Glass (200kg)', driver: 'Mike T.', eta: '11:15 AM' },
              { time: '2:00 PM', supplier: 'Hilltop Hotel', material: 'Paper (80kg)', driver: 'Sarah K.', eta: '1:45 PM' },
              { time: '4:30 PM', supplier: 'Riverside Cafe', material: 'UCO (35kg)', driver: 'John D.', eta: '4:15 PM' },
            ].map((collection, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="font-medium">{collection.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{collection.supplier} • {collection.material}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Driver: {collection.driver}</p>
                  <p className="text-xs text-gray-500">ETA: {collection.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Route Optimization" icon={<MapPin size={20} />}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Today's Route</p>
                <p className="text-sm text-gray-600">4 stops, 18km total</p>
              </div>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg">
                Optimize Now
              </button>
            </div>
            <div className="space-y-3">
              {[
                { order: 1, location: 'Kigali Hotel', distance: '0km', eta: '9:00 AM' },
                { order: 2, location: 'City Restaurant', distance: '5km', eta: '9:30 AM' },
                { order: 3, location: 'Hilltop Hotel', distance: '8km', eta: '10:15 AM' },
                { order: 4, location: 'Riverside Cafe', distance: '5km', eta: '11:00 AM' },
              ].map((stop, idx) => (
                <div key={idx} className="flex items-center p-3 bg-white border rounded-lg">
                  <div className="w-8 h-8 bg-cyan-100 text-cyan-800 rounded-full flex items-center justify-center mr-3">
                    {stop.order}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{stop.location}</p>
                    <p className="text-sm text-gray-600">{stop.distance} • ETA: {stop.eta}</p>
                  </div>
                  <Truck className="text-gray-400" size={20} />
                </div>
              ))}
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );

  const Marketplace = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Marketplace</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search listings..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-auto text-sm sm:text-base"
            />
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
            <option>Filter by Material</option>
            <option>UCO</option>
            <option>Glass</option>
            <option>Paper</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
              <img src="/images/kCEM_Logo.png" alt="KCEM" className="w-16 h-16 opacity-50" />
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Used Cooking Oil</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Kigali Hotel</p>
                </div>
                <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs sm:text-sm">50kg</span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">High quality UCO available for biodiesel production</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg sm:text-2xl font-bold">RWF 25,500</p>
                  <p className="text-xs sm:text-sm text-gray-600">RWF 510/kg</p>
                </div>
                <button className="px-3 sm:px-4 py-1 sm:py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-xs sm:text-sm">
                  Make Offer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LogisticsManagement = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Logistics Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard title="Active Drivers" value={stats.activeDrivers} icon={<Truck className="text-cyan-500" size={24} />} change="+1" />
        <StatCard title="Routes Today" value="5" icon={<MapPin className="text-blue-500" size={24} />} change="On schedule" />
        <StatCard title="Avg Efficiency" value="94%" icon={<TrendingDown className="text-cyan-500" size={24} />} change="+3%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Active Routes" icon={<Truck size={20} />}>
          <div className="space-y-4">
            {[
              { driver: 'John D.', stops: 4, progress: 75, eta: '2:30 PM' },
              { driver: 'Mike T.', stops: 3, progress: 33, eta: '4:00 PM' },
              { driver: 'Sarah K.', stops: 5, progress: 60, eta: '3:15 PM' },
            ].map((route, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{route.driver}</p>
                    <p className="text-sm text-gray-600">{route.stops} stops • ETA: {route.eta}</p>
                  </div>
                  <button className="px-3 py-1 border rounded text-sm">Track</button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${route.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
        <DashboardWidget title="Assign New Route" icon={<MapPin size={20} />}>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Driver</label>
              <select className="w-full p-2 border rounded-lg">
                <option>John D.</option>
                <option>Mike T.</option>
                <option>Sarah K.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Collection Points</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {['Kigali Hotel', 'City Restaurant', 'Hilltop Hotel'].map((loc, idx) => (
                  <label key={idx} className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">{loc}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full p-3 bg-cyan-600 text-white rounded-lg">Assign Route</button>
          </form>
        </DashboardWidget>
      </div>
    </div>
  );

  const InventoryManagement = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Inventory Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Stock" value="1,250 kg" icon={<Package className="text-cyan-500" size={24} />} change="+120 kg" />
        <StatCard title="UCO Stock" value="450 kg" icon={<Package className="text-blue-500" size={24} />} change="+50 kg" />
        <StatCard title="Glass Stock" value="380 kg" icon={<Package className="text-purple-500" size={24} />} change="+30 kg" />
        <StatCard title="Paper Stock" value="420 kg" icon={<Package className="text-orange-500" size={24} />} change="+40 kg" />
      </div>
      <DashboardWidget title="Inventory Levels" icon={<Package size={20} />}>
        <div className="overflow-x-auto">
          <DataTable
          columns={[
            { key: 'material', label: 'Material' },
            { key: 'quantity', label: 'Quantity (kg)' },
            { key: 'location', label: 'Storage Location' },
            { key: 'quality', label: 'Quality' },
            { key: 'value', label: 'Est. Value (RWF)', render: (value) => value.toLocaleString() },
            { key: 'actions', label: 'Actions', render: () => (
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 bg-cyan-600 text-white rounded text-xs sm:text-sm whitespace-nowrap">Process</button>
                <button className="px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm whitespace-nowrap">Transfer</button>
              </div>
            )}
          ]}
          data={[
            { material: 'UCO', quantity: 450, location: 'Warehouse A', quality: 'Good', value: 229500 },
            { material: 'Glass', quantity: 380, location: 'Warehouse B', quality: 'Excellent', value: 342000 },
            { material: 'Paper', quantity: 420, location: 'Warehouse A', quality: 'Fair', value: 168000 },
          ]}
        />
        </div>
      </DashboardWidget>
    </div>
  );

  const FinancialDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Spend" value={`RWF ${stats.totalSpend.toLocaleString()}`} icon={<DollarSign className="text-blue-500" size={24} />} change="+8.5%" />
        <StatCard title="This Month" value="RWF 125K" icon={<TrendingDown className="text-cyan-500" size={24} />} change="+12%" />
        <StatCard title="Pending Payments" value="RWF 50K" icon={<Calendar className="text-yellow-500" size={24} />} change="3 invoices" />
        <StatCard title="Avg Cost/kg" value={`RWF ${stats.costPerKg}`} icon={<DollarSign className="text-purple-500" size={24} />} change="-5%" />
      </div>
      <DashboardWidget title="Recent Transactions" icon={<DollarSign size={20} />}>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'material', label: 'Material' },
            { key: 'quantity', label: 'Quantity (kg)' },
            { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
            { key: 'status', label: 'Status', render: (value) => (
              <span className={`px-2 py-1 rounded text-xs ${
                value === 'paid' ? 'bg-cyan-100 text-cyan-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{value}</span>
            )}
          ]}
          data={[
            { date: '2024-02-10', supplier: 'Kigali Hotel', material: 'UCO', quantity: 50, amount: 25500, status: 'paid' },
            { date: '2024-02-09', supplier: 'City Restaurant', material: 'Glass', quantity: 200, amount: 180000, status: 'pending' },
          ]}
        />
      </DashboardWidget>
    </div>
  );

  const SupplierNetwork = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Supplier Network</h2>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <input type="text" placeholder="Search suppliers..." className="px-4 py-2 border rounded-lg w-full sm:w-64 text-sm sm:text-base" />
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg w-full sm:w-auto text-sm sm:text-base">Add New Supplier</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {mockSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white p-4 sm:p-6 rounded-lg border hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                  <img src="/images/kCEM_Logo.png" alt={supplier.name} className="w-8 h-8 opacity-50" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{supplier.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="ml-1 text-sm">{supplier.rating}</span>
                    <span className="ml-2 text-sm text-gray-600">• {supplier.reliability}% reliable</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">Materials: {supplier.materials.join(', ')}</p>
              <p className="text-sm text-gray-600">Total Volume: {supplier.totalVolume} kg</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button className="flex-1 px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm">View Details</button>
              <button className="flex-1 px-2 sm:px-3 py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm">Contact</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Analytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Material Acquisition Trends" icon={<TrendingDown size={20} />}>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chart: Material acquisition over time</p>
          </div>
        </DashboardWidget>
        <DashboardWidget title="Cost Analysis" icon={<DollarSign size={20} />}>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chart: Cost per material type</p>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="overview" element={<Overview />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="logistics" element={<LogisticsManagement />} />
      <Route path="inventory" element={<InventoryManagement />} />
      <Route path="financial" element={<FinancialDashboard />} />
      <Route path="suppliers" element={<SupplierNetwork />} />
      <Route path="analytics" element={<Analytics />} />
    </Routes>
  );
};

export default RecyclerDashboard;