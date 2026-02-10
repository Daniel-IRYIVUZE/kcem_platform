// pages/dashboard/AdminDashboard.tsx
import { useState } from 'react';
import { Routes, Route} from 'react-router-dom';
import { 
  Users, Package, DollarSign, Activity, TrendingUp, 
  AlertTriangle, CheckCircle, XCircle, Clock,
  Download, Filter, Eye, Leaf
} from 'lucide-react';

// Dashboard Components
import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import ChartComponent from '../../components/dashboard/ChartComponent';

// African waste/recycling image URLs - Admin focus
const AFRICAN_IMAGES = {
  dashboard: [
    'https://images.unsplash.com/photo-1532996122724-8f3c58d4d0df?w=500&h=300&fit=crop', // Recycling center
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop', // Dashboard analytics
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop', // Environmental protection
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop', // African community
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop', // Data visualization
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop'  // Green sustainability
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

const SimpleLineChart = () => (
  <svg viewBox="0 0 400 200" className="w-full h-48 mt-4">
    <defs>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
        <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
      </linearGradient>
    </defs>
    <polyline points="10,160 80,120 150,90 220,110 290,60 360,40" fill="none" stroke="#10b981" strokeWidth="2" />
    <polyline points="10,160 80,120 150,90 220,110 290,60 360,40" fill="url(#lineGradient)" />
    <circle cx="10" cy="160" r="3" fill="#10b981" />
    <circle cx="80" cy="120" r="3" fill="#10b981" />
    <circle cx="150" cy="90" r="3" fill="#10b981" />
    <circle cx="220" cy="110" r="3" fill="#10b981" />
    <circle cx="290" cy="60" r="3" fill="#10b981" />
    <circle cx="360" cy="40" r="3" fill="#10b981" />
  </svg>
);

const AdminDashboard = () => {
  const [stats] = useState({
    totalRevenue: 1250000,
    activeUsers: 342,
    listingsToday: 28,
    pendingDisputes: 5,
    systemHealth: 98.7
  });

  // Move these states to the parent so they can be shared
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userFilterVisible, setUserFilterVisible] = useState(false);

  const handleExportUsers = () => {
    const csvContent = "ID,Name,Email,Role,Status,Join Date\n" + 
      mockUsers.map(u => `${u.id},${u.name},${u.email},${u.role},${u.status},${u.joinDate}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
  };

  const handleFilterUsers = () => {
    setUserFilterVisible(!userFilterVisible);
  };

  const handleApproveUser = (userName: string) => {
    alert(`User ${userName} has been approved!`);
  };

  const handleSuspendUser = (userName: string) => {
    alert(`User ${userName} has been suspended!`);
  };

  const handleApproveContent = (type: string, user: string) => {
    alert(`${type} from ${user} has been approved!`);
  };

  const handleRejectContent = (type: string, user: string) => {
    alert(`${type} from ${user} has been rejected!`);
  };

  const handleAction = (message: string) => {
    alert(message);
  };
  const mockUsers = [
    { id: 1, name: 'Kigali Hotel', email: 'hotel@kigali.com', role: 'business', status: 'active', joinDate: '2024-02-01' },
    { id: 2, name: 'Green Recyclers', email: 'info@greenrecyclers.com', role: 'recycler', status: 'pending', joinDate: '2024-02-02' },
    { id: 3, name: 'John Driver', email: 'john@driver.com', role: 'driver', status: 'active', joinDate: '2024-02-03' },
    { id: 4, name: 'City Restaurant', email: 'city@restaurant.com', role: 'business', status: 'suspended', joinDate: '2024-01-28' },
    { id: 5, name: 'Plastic Solutions', email: 'contact@plastics.com', role: 'recycler', status: 'active', joinDate: '2024-01-30' },
  ];

  const mockTransactions = [
    { id: 1, user: 'Kigali Hotel', type: 'payout', amount: 25000, status: 'completed', date: '2024-02-10' },
    { id: 2, user: 'Green Recyclers', type: 'purchase', amount: 18000, status: 'pending', date: '2024-02-10' },
    { id: 3, user: 'City Restaurant', type: 'payout', amount: 32000, status: 'completed', date: '2024-02-09' },
    { id: 4, user: 'Plastic Solutions', type: 'deposit', amount: 50000, status: 'failed', date: '2024-02-09' },
    { id: 5, user: 'John Driver', type: 'payout', amount: 15000, status: 'completed', date: '2024-02-08' },
  ];

  // Accept props for modal state and user selection
  const Overview = ({
    showEditModal,
    setShowEditModal,
    selectedUser,
    setSelectedUser,
  }: {
    showEditModal: boolean;
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedUser: any;
    setSelectedUser: React.Dispatch<React.SetStateAction<any>>;
  }) => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Revenue"
          value={`RWF ${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="text-cyan-500" size={24} />}
          change="+12.5%"
        />
        <StatCard 
          title="Active Users"
          value={stats.activeUsers}
          icon={<Users className="text-cyan-500" size={24} />}
          change="+8.2%"
        />
        <StatCard 
          title="Listings Today"
          value={stats.listingsToday}
          icon={<Package className="text-purple-500" size={24} />}
          change="+15.3%"
        />
        <StatCard 
          title="Pending Disputes"
          value={stats.pendingDisputes}
          icon={<AlertTriangle className="text-yellow-500" size={24} />}
          change="-2"
        />
        <StatCard 
          title="System Health"
          value={`${stats.systemHealth}%`}
          icon={<Activity className="text-red-500" size={24} />}
          change="+0.3%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="User Growth" icon={<TrendingUp size={20} />}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <SimpleLineChart />
            </div>
            <div className="lg:w-1/2">
              <ImageWithFallback 
                src={AFRICAN_IMAGES.dashboard[0]} 
                alt="User growth visualization" 
                className="w-full h-48 rounded-lg object-cover"
              />
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Recent Transactions" icon={<DollarSign size={20} />}>
          <div className="space-y-4">
            <ImageWithFallback 
              src={AFRICAN_IMAGES.dashboard[1]} 
              alt="Transaction analytics" 
              className="w-full h-32 rounded-lg object-cover"
            />
            <DataTable
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'user', label: 'User' },
                { key: 'type', label: 'Type' },
                { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
                { key: 'status', label: 'Status', render: (value) => (
                  <span className={`px-2 py-1 rounded text-xs ${
                    value === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                    value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {value}
                  </span>
                )},
                { key: 'date', label: 'Date' },
              ]}
              data={mockTransactions}
            />
          </div>
        </DashboardWidget>
      </div>

      <DashboardWidget title="User Management" icon={<Users size={20} />}>
        <div className="space-y-4">
          <ImageWithFallback 
            src={AFRICAN_IMAGES.dashboard[3]} 
            alt="Community management" 
            className="w-full h-32 rounded-lg object-cover"
          />
          <div className="overflow-x-auto">
            <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              { key: 'status', label: 'Status', render: (value) => (
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'active' ? 'bg-cyan-100 text-cyan-800' :
                  value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {value}
                </span>
              )},
              { key: 'joinDate', label: 'Join Date' },
              { key: 'actions', label: 'Actions', render: (_: any, row: any) => (
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedUser(row); setShowEditModal(true); }} className="text-cyan-600 hover:text-cyan-800">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => alert(`Approved ${row.name}`)} className="text-cyan-600 hover:text-cyan-800" title="Approve">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => alert(`Suspended ${row.name}`)} className="text-red-600 hover:text-red-800" title="Suspend">
                    <XCircle size={16} />
                  </button>
                </div>
              )},
            ]}
            data={mockUsers}
          />
          </div>
        </div>
      </DashboardWidget>
      {/* Optionally, you can show the modal here if you want it to appear on Overview as well */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">{selectedUser.id}</p>
                <p className="text-xs text-gray-600">User ID</p>
              </div>
              <div className="text-center border-x border-cyan-200">
                <p className="text-2xl font-bold text-cyan-600">{selectedUser.joinDate}</p>
                <p className="text-xs text-gray-600">Join Date</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 capitalize">{selectedUser.role}</p>
                <p className="text-xs text-gray-600">Role</p>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['active', 'pending', 'suspended'].map((status) => (
                    <label key={status} className="relative">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        defaultChecked={selectedUser.status === status}
                        className="peer sr-only"
                      />
                      <div className="cursor-pointer p-3 border-2 rounded-lg text-center transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-50 peer-checked:shadow-md hover:border-gray-400">
                        <span className={`font-medium capitalize ${
                          status === 'active' ? 'text-cyan-600' :
                          status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>{status}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Role
                </label>
                <select 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  defaultValue={selectedUser.role}
                >
                  <option value="business">🏢 Business / HORECA</option>
                  <option value="recycler">♻️ Recycler</option>
                  <option value="driver">🚚 Driver</option>
                  <option value="individual">👤 Individual</option>
                  <option value="admin">⚙️ Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  rows={3}
                  placeholder="Add any notes about this user..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-yellow-600" size={20} />
                  <span className="text-sm font-medium text-yellow-800">Verification Status</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const UserManagement = () => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleFilterUsers} className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button onClick={handleExportUsers} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status', render: (value) => (
              <span className={`px-2 py-1 rounded text-xs ${
                value === 'active' ? 'bg-cyan-100 text-cyan-800' :
                value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {value}
              </span>
            )},
            { key: 'joinDate', label: 'Join Date' },
            { key: 'actions', label: 'Actions', render: (_, row) => (
              <div className="flex space-x-2">
                <button onClick={() => { setSelectedUser(row); setShowEditModal(true); }} className="text-cyan-600 hover:text-cyan-800">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleApproveUser(row.name)} className="text-cyan-600 hover:text-cyan-800">
                  <CheckCircle size={16} />
                </button>
                <button onClick={() => handleSuspendUser(row.name)} className="text-red-600 hover:text-red-800">
                  <XCircle size={16} />
                </button>
              </div>
            )},
          ]}
          data={mockUsers}
        />
        </div>
        
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-600">{selectedUser.id}</p>
                  <p className="text-xs text-gray-600">User ID</p>
                </div>
                <div className="text-center border-x border-cyan-200">
                  <p className="text-2xl font-bold text-cyan-600">{selectedUser.joinDate}</p>
                  <p className="text-xs text-gray-600">Join Date</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 capitalize">{selectedUser.role}</p>
                  <p className="text-xs text-gray-600">Role</p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['active', 'pending', 'suspended'].map((status) => (
                      <label key={status} className="relative">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          defaultChecked={selectedUser.status === status}
                          className="peer sr-only"
                        />
                        <div className="cursor-pointer p-3 border-2 rounded-lg text-center transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-50 peer-checked:shadow-md hover:border-gray-400">
                          <span className={`font-medium capitalize ${
                            status === 'active' ? 'text-cyan-600' :
                            status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>{status}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User Role
                  </label>
                  <select 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    defaultValue={selectedUser.role}
                  >
                    <option value="business">🏢 Business / HORECA</option>
                    <option value="recycler">♻️ Recycler</option>
                    <option value="driver">🚚 Driver</option>
                    <option value="individual">👤 Individual</option>
                    <option value="admin">⚙️ Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Add any notes about this user..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <span className="text-sm font-medium text-yellow-800">Verification Status</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ContentModeration = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Content Moderation</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Pending Review" value="12" icon={<AlertTriangle className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Approved Today" value="45" icon={<CheckCircle className="text-cyan-500" size={24} />} change="+8%" />
        <StatCard title="Flagged Content" value="3" icon={<XCircle className="text-red-500" size={24} />} change="-2" />
        <StatCard title="Auto-Approved" value="120" icon={<Activity className="text-cyan-500" size={24} />} change="+15%" />
      </div>
      <div className="overflow-x-auto">
        <DataTable
          columns={[
          { key: 'id', label: 'ID' },
          { key: 'type', label: 'Type' },
          { key: 'user', label: 'Posted By' },
          { key: 'material', label: 'Material' },
          { key: 'status', label: 'Status', render: (value) => (
            <span className={`px-2 py-1 rounded text-xs ${
              value === 'approved' ? 'bg-cyan-100 text-cyan-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>{value}</span>
          )},
          { key: 'date', label: 'Date' },
          { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="flex space-x-2">
              <button onClick={() => handleApproveContent(row.type, row.user)} className="px-3 py-1 bg-cyan-600 text-white rounded text-sm">Approve</button>
              <button onClick={() => handleRejectContent(row.type, row.user)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
            </div>
          )}
        ]}
        data={[
          { id: 1, type: 'Listing', user: 'Kigali Hotel', material: 'UCO', status: 'pending', date: '2024-02-10' },
          { id: 2, type: 'Listing', user: 'City Restaurant', material: 'Glass', status: 'pending', date: '2024-02-10' },
          { id: 3, type: 'Review', user: 'Green Recyclers', material: 'N/A', status: 'flagged', date: '2024-02-09' },
        ]}
      />
      </div>
    </div>
  );

  const FinancialOversight = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Financial Oversight</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Revenue" value="RWF 1.2M" icon={<DollarSign className="text-cyan-500" size={24} />} change="+12%" />
        <StatCard title="Pending Payouts" value="RWF 350K" icon={<Clock className="text-yellow-500" size={24} />} change="5 pending" />
        <StatCard title="Platform Fees" value="RWF 180K" icon={<TrendingUp className="text-cyan-500" size={24} />} change="+8%" />
        <StatCard title="Disputes" value="2" icon={<AlertTriangle className="text-red-500" size={24} />} change="-1" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DashboardWidget title="Recent Transactions" icon={<DollarSign size={20} />}>
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                { key: 'user', label: 'User' },
                { key: 'type', label: 'Type' },
                { key: 'amount', label: 'Amount (RWF)', render: (value) => value.toLocaleString() },
                { key: 'status', label: 'Status', render: (value) => (
                  <span className={`px-2 py-1 rounded text-xs ${
                    value === 'completed' ? 'bg-cyan-100 text-cyan-800' :
                    value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{value}</span>
                )}
              ]}
              data={mockTransactions}
            />
          </div>
        </DashboardWidget>
        <DashboardWidget title="Revenue Breakdown" icon={<TrendingUp size={20} />}>
          <ChartComponent type="bar" data={{
            labels: ['Listing Fees', 'Transaction Fees', 'Premium Features', 'Other'],
            datasets: [{
              data: [450000, 380000, 280000, 140000],
              backgroundColor: '#06b6d4',
            }]
          }} />
        </DashboardWidget>
      </div>
    </div>
  );

  const Analytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Analytics & Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Users" value="342" icon={<Users className="text-cyan-500" size={24} />} change="+8.2%" />
        <StatCard title="Active Listings" value="156" icon={<Package className="text-cyan-500" size={24} />} change="+12%" />
        <StatCard title="Transactions" value="892" icon={<DollarSign className="text-purple-500" size={24} />} change="+15%" />
        <StatCard title="Platform Health" value="98.7%" icon={<Activity className="text-cyan-500" size={24} />} change="+0.3%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="User Growth" icon={<TrendingUp size={20} />}>
          <ChartComponent type="line" data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [150, 200, 250, 280, 320, 342],
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
            }]
          }} />
        </DashboardWidget>
        <DashboardWidget title="Material Distribution" icon={<Package size={20} />}>
          <ChartComponent type="bar" data={{
            labels: ['UCO', 'Glass', 'Paper', 'Plastic', 'Metal'],
            datasets: [{
              data: [450, 380, 320, 280, 150],
              backgroundColor: '#06b6d4',
            }]
          }} />
        </DashboardWidget>
      </div>
    </div>
  );

  const SystemSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">System Configuration</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Commission (%)</label>
              <input type="number" defaultValue="10" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Listing Amount (RWF)</label>
              <input type="number" defaultValue="5000" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto-Approval Threshold (RWF)</label>
              <input type="number" defaultValue="50000" className="w-full p-2 border rounded-lg" />
            </div>
            <button onClick={() => handleAction('Platform settings saved successfully!')} className="w-full p-3 bg-cyan-600 text-white rounded-lg">Save Settings</button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Email Notifications</h3>
          <div className="space-y-3">
            {['New User Registration', 'Listing Approval Required', 'Payment Processed', 'Dispute Filed', 'System Alerts'].map((item, idx) => (
              <label key={idx} className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>{item}</span>
              </label>
            ))}
            <button onClick={() => handleAction('Notification preferences updated.')} className="w-full p-3 bg-cyan-600 text-white rounded-lg mt-4">Update Notifications</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route
        index
        element={
          <Overview
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        }
      />
      <Route
        path="overview"
        element={
          <Overview
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        }
      />
      <Route path="users" element={<UserManagement />} />
      <Route path="listings" element={<ContentModeration />} />
      <Route path="financial" element={<FinancialOversight />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<SystemSettings />} />
    </Routes>
  );
};

export default AdminDashboard;