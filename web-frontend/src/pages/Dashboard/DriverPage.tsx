// pages/dashboard/DriverDashboard.tsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Package, DollarSign, Truck, MapPin, Clock, 
  CheckCircle, AlertCircle, Wifi, WifiOff, Battery,
  Navigation, Activity, TrendingUp, Calendar
} from 'lucide-react';
import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';

const DriverDashboard = () => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [CurrentRoute] = useState({
    stopsCompleted: 2,
    totalStops: 6,
    distanceTraveled: '12km',
    nextStopETA: '15 min',
    earningsToday: 35000,
    performanceRating: 4.7
  });

  const todaysSchedule = [
    { id: 1, time: '8:00 AM', location: 'Kigali Hotel', material: 'UCO (50kg)', status: 'completed' },
    { id: 2, time: '9:30 AM', location: 'City Restaurant', material: 'Glass (200kg)', status: 'completed' },
    { id: 3, time: '11:00 AM', location: 'Hilltop Hotel', material: 'Paper (80kg)', status: 'in-progress' },
    { id: 4, time: '1:00 PM', location: 'Riverside Cafe', material: 'UCO (35kg)', status: 'pending' },
    { id: 5, time: '2:30 PM', location: 'Downtown Hotel', material: 'Plastic (150kg)', status: 'pending' },
    { id: 6, time: '4:00 PM', location: 'Airport Restaurant', material: 'Glass (120kg)', status: 'pending' },
  ];

  const collectionHistory = [
    { id: 1, date: '2024-02-09', location: 'Kigali Hotel', material: 'UCO', weight: '45kg', rating: 5 },
    { id: 2, date: '2024-02-09', location: 'City Restaurant', material: 'Glass', weight: '180kg', rating: 4 },
    { id: 3, date: '2024-02-08', location: 'Hilltop Hotel', material: 'Paper', weight: '75kg', rating: 5 },
    { id: 4, date: '2024-02-08', location: 'Riverside Cafe', material: 'UCO', weight: '32kg', rating: 4 },
  ];

  const Overview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Connection Status Banner */}
      <div className={`p-3 sm:p-4 rounded-lg ${offlineMode ? 'bg-yellow-50 border border-yellow-200' : 'bg-cyan-50 border border-cyan-200'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {offlineMode ? <WifiOff className="text-yellow-600" size={24} /> : <Wifi className="text-cyan-600" size={24} />}
            <div>
              <p className="font-medium">{offlineMode ? 'Offline Mode' : 'Online & Connected'}</p>
              <p className="text-sm">{offlineMode ? '3 pending syncs' : 'All systems operational'}</p>
            </div>
          </div>
          <button 
            onClick={() => setOfflineMode(!offlineMode)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto ${offlineMode ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {offlineMode ? 'Go Online' : 'Go Offline'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Today's Earnings"
          value={`RWF ${CurrentRoute.earningsToday.toLocaleString()}`}
          icon={<DollarSign className="text-cyan-500" size={24} />}
          change="+12% from yesterday"
        />
        <StatCard 
          title="Stops Completed"
          value={`${CurrentRoute.stopsCompleted}/${CurrentRoute.totalStops}`}
          icon={<CheckCircle className="text-blue-500" size={24} />}
          change="2 remaining"
        />
        <StatCard 
          title="Distance Traveled"
          value={CurrentRoute.distanceTraveled}
          icon={<Navigation className="text-purple-500" size={24} />}
          change="18km remaining"
        />
        <StatCard 
          title="Performance"
          value={CurrentRoute.performanceRating}
          icon={<Star className="text-yellow-500" size={24} />}
          change="+0.2 this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Today's Schedule" icon={<Clock size={20} />}>
          <div className="space-y-4">
            {todaysSchedule.map((stop) => (
              <div key={stop.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  stop.status === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                  stop.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {stop.status === 'completed' ? <CheckCircle size={20} /> :
                   stop.status === 'in-progress' ? <Clock size={20} /> :
                   <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{stop.time}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      stop.status === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                      stop.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stop.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{stop.location}</p>
                  <p className="text-sm text-gray-500">{stop.material}</p>
                </div>
                {stop.status === 'in-progress' && (
                  <button className="ml-4 px-3 sm:px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm whitespace-nowrap">
                    Start Collection
                  </button>
                )}
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Collection Verification" icon={<Package size={20} />}>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Package size={48} className="text-gray-400" />
              </div>
              <p className="font-medium">Current Collection</p>
              <p className="text-gray-600">Hilltop Hotel • Paper (80kg)</p>
            </div>
            
            <div className="space-y-4">
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Package size={24} className="text-gray-600" />
                </div>
                <span>Take Verification Photo</span>
                <span className="text-sm text-gray-500">Required for collection</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-xl font-bold">80 kg</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Quality</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">Notes from recycler:</p>
                <p className="text-blue-900">Please ensure paper is dry and free from food contamination</p>
              </div>
              
              <button className="w-full p-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                Complete Collection
              </button>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <DashboardWidget title="Recent Collections" icon={<Truck size={20} />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Location</th>
                <th className="text-left py-3">Material</th>
                <th className="text-left py-3">Weight</th>
                <th className="text-left py-3">Rating</th>
                <th className="text-left py-3">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {collectionHistory.map((collection) => (
                <tr key={collection.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{collection.date}</td>
                  <td className="py-3">{collection.location}</td>
                  <td className="py-3">{collection.material}</td>
                  <td className="py-3">{collection.weight}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="ml-1">{collection.rating}</span>
                    </div>
                  </td>
                  <td className="py-3">RWF {Math.round(parseInt(collection.weight) * 350).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardWidget>
    </div>
  );

  const CurrentRouteView = () => (
    <div className="h-full flex flex-col space-y-4 sm:space-y-6">
      <div className="flex-1 bg-gray-200 rounded-lg mb-4 relative min-h-[300px] sm:min-h-[400px]">
        {/* This would be a map component */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Interactive Map View</p>
            <p className="text-sm text-gray-500">Showing optimized route with 6 stops</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-3 sm:p-4 bg-white border rounded-lg">
          <h3 className="font-bold mb-3">Route Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Distance</span>
              <span className="font-medium">30km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Time</span>
              <span className="font-medium">6 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fuel Estimate</span>
              <span className="font-medium">12 liters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-medium text-cyan-600">RWF 65,000</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-bold mb-3">Vehicle Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fuel Level</span>
              <div className="flex items-center">
                <Battery size={20} className="text-cyan-500 mr-2" />
                <span>85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Maintenance</span>
              <span className="text-cyan-600">Up to date</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Odometer</span>
              <span>45,280 km</span>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 bg-white border rounded-lg">
          <h3 className="font-bold mb-3 text-sm sm:text-base">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full p-2 sm:p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-xs sm:text-sm">
              Start Navigation
            </button>
            <button className="w-full p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
              Report Issue
            </button>
            <button className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">
              Emergency Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CollectionsHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Collections History</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Collections" value="245" icon={<Package className="text-cyan-500" size={24} />} change="+28 this month" />
        <StatCard title="This Week" value="18" icon={<CheckCircle className="text-blue-500" size={24} />} change="+3" />
        <StatCard title="Avg Rating" value="4.8" icon={<Star className="text-yellow-500" size={24} />} change="+0.2" />
        <StatCard title="Success Rate" value="98%" icon={<Activity className="text-cyan-500" size={24} />} change="+1%" />
      </div>
      <DashboardWidget title="Recent Collections" icon={<Package size={20} />}>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'location', label: 'Location' },
            { key: 'material', label: 'Material' },
            { key: 'weight', label: 'Weight' },
            { key: 'rating', label: 'Rating', render: (value: any) => (
              <div className="flex items-center">
                <Star className="text-yellow-400 fill-current" size={14} />
                <span className="ml-1">{value}</span>
              </div>
            )},
            { key: 'earnings', label: 'Earnings', render: (_: any, row: any) => `RWF ${(parseInt(row.weight) * 350).toLocaleString()}` }
          ]}
          data={collectionHistory}
        />
      </DashboardWidget>
    </div>
  );

  const EarningsDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Earnings Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Today's Earnings" value={`RWF ${CurrentRoute.earningsToday.toLocaleString()}`} icon={<DollarSign className="text-cyan-500" size={24} />} change="+12%" />
        <StatCard title="This Week" value="RWF 185K" icon={<TrendingUp className="text-blue-500" size={24} />} change="+8%" />
        <StatCard title="This Month" value="RWF 650K" icon={<DollarSign className="text-purple-500" size={24} />} change="+15%" />
        <StatCard title="Pending" value="RWF 50K" icon={<Clock className="text-yellow-500" size={24} />} change="2 days" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Earnings Breakdown" icon={<DollarSign size={20} />}>
          <div className="space-y-4">
            {[
              { category: 'Collections', amount: 450000, percentage: 69 },
              { category: 'Bonuses', amount: 120000, percentage: 18 },
              { category: 'Tips', amount: 80000, percentage: 13 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-cyan-600">RWF {item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
        <DashboardWidget title="Payment History" icon={<Calendar size={20} />}>
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'description', label: 'Description' },
              { key: 'amount', label: 'Amount', render: (value: any) => `RWF ${value.toLocaleString()}` },
              { key: 'status', label: 'Status', render: (value: any) => (
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'paid' ? 'bg-cyan-100 text-cyan-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{value}</span>
              )}
            ]}
            data={[
              { date: '2024-02-08', description: 'Weekly payout', amount: 185000, status: 'paid' },
              { date: '2024-02-01', description: 'Weekly payout', amount: 165000, status: 'paid' },
              { date: '2024-01-25', description: 'Weekly payout', amount: 178000, status: 'paid' },
            ]}
          />
        </DashboardWidget>
      </div>
    </div>
  );

  const VehicleEquipment = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Vehicle & Equipment</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-base sm:text-lg font-bold mb-4">Vehicle Information</h3>
          <div className="w-full h-48 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
            <img src="/images/kCEM_Logo.png" alt="Vehicle" className="w-16 h-16 opacity-50" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vehicle Type</p>
                <p className="font-medium">Pickup Truck</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Plate</p>
                <p className="font-medium">RAD 123 K</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="font-medium">500 kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Odometer</p>
                <p className="font-medium">45,280 km</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Fuel Level</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-cyan-600 h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">85% • ~48 km remaining</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Maintenance Schedule</h3>
          <div className="space-y-3">
            {[
              { task: 'Oil Change', due: '500 km', status: 'upcoming' },
              { task: 'Tire Rotation', due: '1,200 km', status: 'good' },
              { task: 'Brake Inspection', due: '2,500 km', status: 'good' },
              { task: 'Annual Service', due: '15 days', status: 'upcoming' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.task}</p>
                  <p className="text-sm text-gray-600">Due in {item.due}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs ${
                  item.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 'bg-cyan-100 text-cyan-800'
                }`}>{item.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 p-3 border rounded-lg hover:bg-gray-50">
            Schedule Maintenance
          </button>
        </div>
      </div>
    </div>
  );

  const OfflineMode = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Offline Mode Settings</h2>
      <div className="bg-white p-6 rounded-lg border max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold">Offline Mode</h3>
            <p className="text-sm text-gray-600">Work without internet connection</p>
          </div>
          <button 
            onClick={() => setOfflineMode(!offlineMode)}
            className={`px-6 py-3 rounded-lg ${offlineMode ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}
          >
            {offlineMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> When offline mode is enabled, your collections data will be stored locally and synced when you reconnect to the internet.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Offline Data</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Cached Routes</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending Syncs</p>
                <p className="text-2xl font-bold">{offlineMode ? '3' : '0'}</p>
              </div>
            </div>
          </div>
          
          {offlineMode && (
            <button className="w-full p-3 bg-cyan-600 text-white rounded-lg">
              Sync Now
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="schedule" element={<Overview />} />
      <Route path="routes" element={<CurrentRouteView />} />
      <Route path="collections" element={<CollectionsHistory />} />
      <Route path="earnings" element={<EarningsDashboard />} />
      <Route path="vehicle" element={<VehicleEquipment />} />
      <Route path="offline" element={<OfflineMode />} />
    </Routes>
  );
};

const Star = ({ size, className }: { size: number; className: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default DriverDashboard;