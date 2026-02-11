// pages/dashboard/DriverDashboard.tsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Navigation, DollarSign, CheckCircle, Clock, 
  Leaf, AlertCircle, Star, Truck,
  Download, Settings, Save, X, User, Mail, Phone, MapPin, WifiOff, Wifi
} from 'lucide-react';

import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';

// Real Rwanda transportation/logistics images
const AFRICAN_IMAGES = {
  logistics: [
    'https://media.istockphoto.com/id/115027730/photo/recycling-truck.jpg?s=612x612&w=0&k=20&c=0Sv_BpHWN2Ip7MGCkKHbE1OrX_dkbCDr_9l5_LxosCY=', // Waste collection truck
    'https://media.istockphoto.com/id/1201019473/photo/loading-waste-paper-into-the-truck.jpg?s=612x612&w=0&k=20&c=YiMa6sl1Qf_z53ZGBfZTxCnwlDuxSTzaqMrdMn8fBek=', // Loading waste
    'https://i0.wp.com/www.ecomena.org/wp-content/uploads/2013/05/reverse-logistics.jpg', // Waste management logistics
    'https://www.newtimes.co.rw/thenewtimes/uploads/images/2024/05/13/47821.jpg', // Waste collection
    'https://www.wealthywaste.com/wp-content/uploads/2022/08/PWM-NOTE.jpg', // Plastic waste collection
    'https://cm-today.com/uploads/docs/Tadweer_wrmea%20(1).jpg'  // Sorted waste transport
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

const SimpleRouteMap = () => (
  <div className="relative w-full h-64 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-lg border border-cyan-200 flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: 'linear-gradient(45deg, #ea580c 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}></div>
    <div className="relative z-10 text-center">
      <Navigation size={32} className="text-cyan-600 mx-auto mb-2" />
      <p className="text-gray-600 font-medium">Current Route Map</p>
      <p className="text-sm text-gray-500">6 stops • 30km total distance</p>
    </div>
  </div>
);

const DriverDashboard = () => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({
    stopsCompleted: 2,
    totalStops: 6,
    distanceTraveled: '12km',
    nextStopETA: '15 min',
    earningsToday: 35000,
    performanceRating: 4.7
  });

  const [driverProfile, setDriverProfile] = useState({
    name: 'John Mugisha',
    email: 'john.driver@EcoTrade.rw',
    phone: '+250-788-345-678',
    address: 'KN 8 Ave, Kigali',
    vehicleType: 'Pickup Truck',
    vehicleNumber: 'RAD 123B',
    licenseNumber: 'DL-KG-2024-5678',
    verified: true,
    routeNotifications: true,
    earningsAlerts: true,
    offlineSync: true,
    preferredAreas: ['Kigali City', 'Gasabo', 'Kicukiro']
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const todaysSchedule = [
    { id: 1, time: '8:00 AM', location: 'Kigali Hotel', material: 'UCO (50kg)', status: 'completed', amount: 12500 },
    { id: 2, time: '9:30 AM', location: 'City Restaurant', material: 'Glass (200kg)', status: 'completed', amount: 15000 },
    { id: 3, time: '11:00 AM', location: 'Hilltop Hotel', material: 'Paper (80kg)', status: 'in-progress', amount: 6000 },
    { id: 4, time: '1:00 PM', location: 'Riverside Cafe', material: 'UCO (35kg)', status: 'pending', amount: 8750 },
    { id: 5, time: '2:30 PM', location: 'Downtown Hotel', material: 'Plastic (150kg)', status: 'pending', amount: 11250 },
    { id: 6, time: '4:00 PM', location: 'Airport Restaurant', material: 'Glass (120kg)', status: 'pending', amount: 9000 },
  ];

  const collectionHistory = [
    { id: 1, date: '2024-02-09', location: 'Kigali Hotel', material: 'UCO', weight: '45kg', rating: 5, earnings: 11250 },
    { id: 2, date: '2024-02-09', location: 'City Restaurant', material: 'Glass', weight: '180kg', rating: 4, earnings: 13500 },
    { id: 3, date: '2024-02-08', location: 'Hilltop Hotel', material: 'Paper', weight: '75kg', rating: 5, earnings: 5625 },
    { id: 4, date: '2024-02-08', location: 'Riverside Cafe', material: 'UCO', weight: '32kg', rating: 4, earnings: 8000 },
  ];

  const handleSaveSettings = () => {
    alert('Driver settings saved successfully!');
    setShowSettingsModal(false);
  };

  const handleStartCollection = (stop: any) => {
    alert(`Started collection at ${stop.location} - ${stop.material}`);
    setCurrentRoute({...currentRoute, stopsCompleted: currentRoute.stopsCompleted + 1});
  };

  const handleExportSchedule = () => {
    const csvContent = "Stop,Location,Material,Status\n" + 
      'Sample Route,Kigali Hotel,Plastic,Pending\nSample Route,City Restaurant,Glass,Pending';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_export.csv';
    a.click();
  };

  const handleExportEarnings = () => {
    const csvContent = "Week,Total Earnings,Collections,Bonus\nWeek 1,RWF 45000,120,RWF 5000\nWeek 2,RWF 52000,135,RWF 7000";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings_export.csv';
    a.click();
  };

  const handleExportCollections = () => {
    const csvContent = "Date,Location,Material,Weight,Status\n2024-02-10,Kigali Hotel,Plastic,45kg,Completed\n2024-02-09,City Restaurant,Glass,30kg,Completed";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collections_export.csv';
    a.click();
  };

  const SettingsModal = ({ isOpen, onClose }: any) => {
    const [settings, setSettings] = useState(driverProfile);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="text-cyan-600" size={28} />
              <h3 className="text-2xl font-bold">Driver Settings</h3>
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
                  Full Name
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                <select 
                  value={settings.vehicleType}
                  onChange={(e) => setSettings({...settings, vehicleType: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option>Pickup Truck</option>
                  <option>Van</option>
                  <option>Small Truck</option>
                  <option>Large Truck</option>
                  <option>Motorcycle</option>
                </select>
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
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input 
                  type="text" 
                  value={settings.vehicleNumber}
                  onChange={(e) => setSettings({...settings, vehicleNumber: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                <input 
                  type="text" 
                  value={settings.licenseNumber}
                  onChange={(e) => setSettings({...settings, licenseNumber: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Work Areas</label>
              <div className="flex flex-wrap gap-2">
                {['Kigali City', 'Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Rubavu'].map((area) => (
                  <label key={area} className="flex items-center space-x-1">
                    <input 
                      type="checkbox" 
                      checked={settings.preferredAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({...settings, preferredAreas: [...settings.preferredAreas, area]});
                        } else {
                          setSettings({...settings, preferredAreas: settings.preferredAreas.filter(a => a !== area)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                {[
                  { key: 'routeNotifications', label: 'Notify when new routes are assigned' },
                  { key: 'earningsAlerts', label: 'Alert on daily earnings milestones' },
                  { key: 'offlineSync', label: 'Auto-sync data when back online' }
                ].map((pref) => (
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
            <button onClick={() => { setDriverProfile(settings); handleSaveSettings(); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-600 flex items-center justify-center space-x-2">
              <Save size={20} />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Overview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Connection Status Banner */}
      <div className={`p-3 sm:p-4 rounded-lg ${offlineMode ? 'bg-cyan-50 border border-cyan-200' : 'bg-cyan-50 border border-cyan-200'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {offlineMode ? <WifiOff className="text-cyan-600" size={24} /> : <Wifi className="text-cyan-600" size={24} />}
            <div>
              <p className="font-medium">{offlineMode ? 'Offline Mode' : 'Online & Connected'}</p>
              <p className="text-sm">{offlineMode ? '3 pending syncs' : 'All systems operational'}</p>
            </div>
          </div>
          <button 
            onClick={() => setOfflineMode(!offlineMode)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto ${offlineMode ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {offlineMode ? 'Go Online' : 'Go Offline'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Today's Earnings"
          value={`RWF ${currentRoute.earningsToday.toLocaleString()}`}
          icon={<DollarSign className="text-cyan-500" size={24} />}
          change="+12% from yesterday"
        />
        <StatCard 
          title="Stops Completed"
          value={`${currentRoute.stopsCompleted}/${currentRoute.totalStops}`}
          icon={<CheckCircle className="text-cyan-500" size={24} />}
          change="2 remaining"
        />
        <StatCard 
          title="Distance Traveled"
          value={currentRoute.distanceTraveled}
          icon={<Navigation className="text-purple-500" size={24} />}
          change="18km remaining"
        />
        <StatCard 
          title="Performance"
          value={currentRoute.performanceRating}
          icon={<Star className="text-cyan-500" size={24} />}
          change="+0.2 this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Today's Schedule" icon={<Clock size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.logistics[0]} 
              alt="Driver schedule" 
              className="w-full h-32 rounded-lg object-cover"
            />
            {todaysSchedule.map((stop) => (
              <div key={stop.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => alert(`${stop.status === 'completed' ? 'Completed' : 'Upcoming'}: ${stop.location}`)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  stop.status === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                  stop.status === 'in-progress' ? 'bg-cyan-100 text-cyan-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {stop.status === 'completed' ? <CheckCircle size={20} /> :
                   stop.status === 'in-progress' ? <Clock size={20} /> :
                   <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{stop.location}</p>
                    <p className="text-sm text-gray-500">{stop.time}</p>
                  </div>
                  <p className="text-sm text-gray-600">{stop.material}</p>
                  <p className="text-sm text-cyan-600 font-semibold">RWF {stop.amount.toLocaleString()}</p>
                </div>
                {stop.status === 'in-progress' && (
                  <button onClick={(e) => { e.stopPropagation(); handleStartCollection(stop); }} className="ml-4 px-3 sm:px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm whitespace-nowrap hover:bg-cyan-700">
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Route Overview" icon={<Navigation size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.logistics[2]} 
              alt="Route map" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <SimpleRouteMap />
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">{currentRoute.totalStops}</p>
                <p className="text-xs text-gray-600">Total Stops</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">30km</p>
                <p className="text-xs text-gray-600">Total Distance</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{currentRoute.nextStopETA}</p>
                <p className="text-xs text-gray-600">Next Stop ETA</p>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>

      <DashboardWidget title="Recent Collections" icon={<Truck size={20} />}>
        <div className="space-y-4">
          <ImageWithFallback 
            src={AFRICAN_IMAGES.logistics[3]} 
            alt="Recent collections" 
            className="w-full h-32 rounded-lg object-cover"
          />
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'location', label: 'Location' },
              { key: 'material', label: 'Material' },
              { key: 'weight', label: 'Weight' },
              { key: 'earnings', label: 'Earnings (RWF)', render: (value) => value.toLocaleString() },
              { key: 'rating', label: 'Rating', render: (value) => (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < value ? 'text-cyan-400 fill-cyan-400' : 'text-gray-300'} />
                  ))}
                </div>
              )}
            ]}
            data={collectionHistory}
          />
        </div>
      </DashboardWidget>
    </div>
  );

  const MyRoutes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Routes</h2>
        <button onClick={handleExportSchedule} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Routes" value="1" icon={<Navigation className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Completed Today" value={currentRoute.stopsCompleted} icon={<CheckCircle className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Pending" value={currentRoute.totalStops - currentRoute.stopsCompleted} icon={<Clock className="text-cyan-500" size={24} />} change="" />
        <StatCard title="Distance" value="30km" icon={<Navigation className="text-cyan-500" size={24} />} change="" />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">Current Route Details</h3>
        <SimpleRouteMap />
        
        <div className="mt-6 space-y-3">
          {todaysSchedule.map((stop) => (
            <div key={stop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stop.status === 'completed' ? 'bg-cyan-500 text-white' :
                  stop.status === 'in-progress' ? 'bg-cyan-500 text-white' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {stop.id}
                </div>
                <div>
                  <p className="font-semibold">{stop.location}</p>
                  <p className="text-sm text-gray-600">{stop.time} • {stop.material}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                stop.status === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                stop.status === 'in-progress' ? 'bg-cyan-100 text-cyan-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stop.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EarningsDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Earnings Dashboard</h2>
        <button onClick={handleExportEarnings} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today" value={`RWF ${currentRoute.earningsToday.toLocaleString()}`} icon={<DollarSign className="text-cyan-500" size={24} />} change="+12%" />
        <StatCard title="This Week" value="RWF 245K" icon={<DollarSign className="text-cyan-500" size={24} />} change="+8%" />
        <StatCard title="This Month" value="RWF 980K" icon={<DollarSign className="text-cyan-500" size={24} />} change="+15%" />
        <StatCard title="Total" value="RWF 2.5M" icon={<DollarSign className="text-purple-500" size={24} />} change="+20%" />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">Earnings Breakdown</h3>
        <div className="space-y-4">
          {[
            { category: 'Collections', amount: 450000, percentage: 69, color: 'bg-cyan-500' },
            { category: 'Bonuses', amount: 120000, percentage: 18, color: 'bg-cyan-500' },
            { category: 'Tips', amount: 80000, percentage: 13, color: 'bg-cyan-500' },
          ].map((item) => (
            <div key={item.category}>
              <div className="flex justify-between mb-2">
                <span className="font-medium">{item.category}</span>
                <span className="font-bold">RWF {item.amount.toLocaleString()} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'location', label: 'Location' },
          { key: 'material', label: 'Material' },
          { key: 'weight', label: 'Weight' },
          { key: 'earnings', label: 'Earnings (RWF)', render: (value) => value.toLocaleString() },
          { key: 'rating', label: 'Rating', render: (value) => (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < value ? 'text-cyan-400 fill-cyan-400' : 'text-gray-300'} />
              ))}
            </div>
          )}
        ]}
        data={collectionHistory}
      />
    </div>
  );

  const Schedule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Today's Schedule</h2>
        <button onClick={handleExportSchedule} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'time', label: 'Time' },
          { key: 'location', label: 'Location' },
          { key: 'material', label: 'Material' },
          { key: 'amount', label: 'Earnings (RWF)', render: (value) => value.toLocaleString() },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'completed' ? 'bg-cyan-100 text-cyan-800' :
              value === 'in-progress' ? 'bg-cyan-100 text-cyan-800' :
              'bg-gray-100 text-gray-800'
            }`}>{value}</span>
          )}
        ]}
        data={todaysSchedule}
      />
    </div>
  );

  const Collections = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Collections</h2>
        <button onClick={handleExportCollections} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'location', label: 'Location' },
          { key: 'material', label: 'Material' },
          { key: 'weight', label: 'Weight' },
          { key: 'earnings', label: 'Earnings (RWF)', render: (value) => value.toLocaleString() },
          { key: 'rating', label: 'Rating', render: (value) => (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < value ? 'text-cyan-400 fill-cyan-400' : 'text-gray-300'} />
              ))}
            </div>
          )}
        ]}
        data={collectionHistory}
      />
    </div>
  );

  const VehicleEquipment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vehicle & Equipment</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Vehicle Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Vehicle Type</span>
              <span className="font-semibold">{driverProfile.vehicleType}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Vehicle Number</span>
              <span className="font-semibold">{driverProfile.vehicleNumber}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">License Number</span>
              <span className="font-semibold">{driverProfile.licenseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${driverProfile.verified ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-100 text-cyan-800'}`}>
                {driverProfile.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Equipment Checklist</h3>
          <div className="space-y-3">
            {['Safety Vest', 'Gloves', 'Weighing Scale', 'Containers', 'First Aid Kit'].map((item) => (
              <label key={item} className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const OfflineMode = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Offline Mode</h2>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Offline Sync</p>
            <p className="text-sm text-gray-600">Store data locally and sync when online</p>
          </div>
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`px-4 py-2 rounded-lg text-white ${offlineMode ? 'bg-cyan-600' : 'bg-gray-500'}`}
          >
            {offlineMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {offlineMode ? <WifiOff className="text-cyan-600" size={20} /> : <Wifi className="text-cyan-600" size={20} />}
          <span className="text-sm text-gray-700">
            {offlineMode ? 'Currently offline - syncing paused' : 'Online - sync active'}
          </span>
        </div>
      </div>
    </div>
  );

  const DriverSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Driver Profile</h2>
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
          <h3 className="text-lg font-bold mb-4">Personal Information</h3>
          <ImageWithFallback 
            src={AFRICAN_IMAGES.logistics[1]} 
            alt="Driver profile" 
            className="w-full h-48 rounded-lg object-cover mb-4"
          />
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Full Name</span>
              <span className="font-semibold">{driverProfile.name}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold">{driverProfile.email}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold">{driverProfile.phone}</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold text-right">{driverProfile.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Performance Rating</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(currentRoute.performanceRating) ? 'text-cyan-400 fill-cyan-400' : 'text-gray-300'} />
                ))}
                <span className="ml-2 font-semibold">{currentRoute.performanceRating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Vehicle Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Vehicle Type</span>
                <span className="font-semibold">{driverProfile.vehicleType}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Vehicle Number</span>
                <span className="font-semibold">{driverProfile.vehicleNumber}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">License Number</span>
                <span className="font-semibold">{driverProfile.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verification Status</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${driverProfile.verified ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-100 text-cyan-800'}`}>
                  {driverProfile.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Preferred Work Areas</h3>
            <div className="flex flex-wrap gap-2">
              {driverProfile.preferredAreas.map((area, idx) => (
                <span key={idx} className="px-3 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Route Notifications</span>
                <span className={`px-2 py-1 rounded text-xs ${driverProfile.routeNotifications ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'}`}>
                  {driverProfile.routeNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Earnings Alerts</span>
                <span className={`px-2 py-1 rounded text-xs ${driverProfile.earningsAlerts ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'}`}>
                  {driverProfile.earningsAlerts ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Offline Sync</span>
                <span className={`px-2 py-1 rounded text-xs ${driverProfile.offlineSync ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'}`}>
                  {driverProfile.offlineSync ? 'Enabled' : 'Disabled'}
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
      <Route path="schedule" element={<Schedule />} />
      <Route path="routes" element={<MyRoutes />} />
      <Route path="collections" element={<Collections />} />
      <Route path="earnings" element={<EarningsDashboard />} />
      <Route path="vehicle" element={<VehicleEquipment />} />
      <Route path="offline" element={<OfflineMode />} />
      <Route path="settings" element={<DriverSettings />} />
    </Routes>
  );
};

export default DriverDashboard;