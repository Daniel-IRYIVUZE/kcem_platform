// pages/dashboard/UserDashboard.tsx
import { Routes, Route } from 'react-router-dom';
import { DollarSign, Leaf, ShoppingCart, TrendingUp, 
  Award, Recycle, Clock, Star, Heart, CheckCircle
} from 'lucide-react';
import DashboardWidget from '../../components/dashboard/Widget';
import StatCard from '../../components/dashboard/StatCard';

const UserDashboard = () => {
  const stats = {
    greenScore: 72,
    totalImpact: 85,
    recentPurchases: 3,
    availableCredits: 5000,
    co2Savings: 280
  };

  const recentPurchases = [
    { id: 1, item: 'Recycled Glass Bottles', seller: 'Green Recyclers', price: 1500, date: '2024-02-10', status: 'delivered' },
    { id: 2, item: 'Upcycled Paper Notebook', seller: 'Eco Crafts', price: 2500, date: '2024-02-08', status: 'in-transit' },
    { id: 3, item: 'Bamboo Cutlery Set', seller: 'Sustainable Living', price: 3500, date: '2024-02-05', status: 'delivered' },
    { id: 4, item: 'Reclaimed Wood Shelf', seller: 'Urban Recycle', price: 12000, date: '2024-02-01', status: 'delivered' },
  ];

  const recommendedListings = [
    { id: 1, title: 'Artisanal Recycled Glass', price: 2000, seller: 'Green Crafts', rating: 4.8, category: 'Home Decor' },
    { id: 2, title: 'Upcycled Denim Bag', price: 4500, seller: 'Fashion Forward', rating: 4.5, category: 'Fashion' },
    { id: 3, title: 'Recycled Plastic Furniture', price: 25000, seller: 'Eco Home', rating: 4.9, category: 'Furniture' },
    { id: 4, title: 'Repurposed Metal Art', price: 8000, seller: 'Metal Works', rating: 4.7, category: 'Art' },
  ];

  const Overview = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Green Score"
          value={stats.greenScore}
          icon={<Leaf className="text-cyan-500" size={24} />}
          change="+5 this month"
        />
        <StatCard 
          title="Total Impact"
          value={`${stats.totalImpact} kg`}
          icon={<Recycle className="text-blue-500" size={24} />}
          change="+12 kg this month"
        />
        <StatCard 
          title="Available Credits"
          value={`RWF ${stats.availableCredits.toLocaleString()}`}
          icon={<DollarSign className="text-purple-500" size={24} />}
          change="+1000 RWF this month"
        />
        <StatCard 
          title="CO₂ Savings"
          value={`${stats.co2Savings} kg`}
          icon={<Award className="text-orange-500" size={24} />}
          change="+45 kg this month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DashboardWidget title="Recent Purchases" icon={<ShoppingCart size={20} />}>
          <div className="space-y-4">
            {recentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/kCEM_Logo.png" alt={purchase.item} className="w-8 h-8 opacity-50" loading="lazy" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{purchase.item}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Sold by {purchase.seller}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        purchase.status === 'delivered' ? 'bg-cyan-100 text-cyan-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status}
                      </span>
                      <span className="text-xs text-gray-500">{purchase.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <p className="text-lg sm:text-xl font-bold">RWF {purchase.price.toLocaleString()}</p>
                  <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 mt-2">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Recommended for You" icon={<TrendingUp size={20} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {recommendedListings.map((listing) => (
              <div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                  <img src="/images/kCEM_Logo.png" alt={listing.title} className="w-12 h-12 opacity-50" loading="lazy" />
                </div>
                <div className="p-2 sm:p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-xs sm:text-sm line-clamp-1">{listing.title}</h4>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={12} />
                      <span className="text-xs ml-1">{listing.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{listing.category}</p>
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-bold text-sm sm:text-base">RWF {listing.price.toLocaleString()}</p>
                    <div className="flex gap-1 sm:gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Heart size={14} className="text-gray-400" />
                      </button>
                      <button className="px-2 sm:px-3 py-1 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-700">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardWidget title="Impact Breakdown" icon={<Recycle size={20} />}>
          <div className="space-y-4">
            {[
              { material: 'Plastic', amount: '32kg', percent: 38 },
              { material: 'Glass', amount: '25kg', percent: 29 },
              { material: 'Paper', amount: '18kg', percent: 21 },
              { material: 'Metal', amount: '10kg', percent: 12 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.material}</span>
                  <span className="text-sm text-gray-600">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Did you know?</strong> Your 85kg waste diversion prevented approximately {stats.co2Savings}kg of CO₂ emissions!
            </p>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Achievements" icon={<Award size={20} />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { name: 'First Purchase', icon: '🎉', unlocked: true },
              { name: '5 Items', icon: '🛍️', unlocked: true },
              { name: 'Eco Warrior', icon: '🌿', unlocked: false },
              { name: 'Monthly Saver', icon: '💰', unlocked: true },
              { name: 'Community Star', icon: '⭐', unlocked: false },
              { name: 'Zero Waste', icon: '♻️', unlocked: false },
            ].map((achievement, idx) => (
              <div 
                key={idx} 
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 ${
                  achievement.unlocked ? 'bg-cyan-50 border border-cyan-200' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-2xl mb-2">{achievement.icon}</span>
                <span className="text-xs text-center font-medium">{achievement.name}</span>
                {!achievement.unlocked && (
                  <span className="text-xs text-gray-500 mt-1">Locked</span>
                )}
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Quick Actions" icon={<Clock size={20} />}>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full p-3 sm:p-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <ShoppingCart size={18} />
              <span>Browse Marketplace</span>
            </button>
            <button className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <Leaf size={18} />
              <span>View Green Score</span>
            </button>
            <button className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <DollarSign size={18} />
              <span>Add Payment Method</span>
            </button>
            <button className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <Award size={20} />
              <span>Share Achievements</span>
            </button>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );

  const MarketplaceView = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Sustainable Marketplace</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search sustainable products..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 text-sm sm:text-base"
          />
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
            <option>All Categories</option>
            <option>Home Decor</option>
            <option>Fashion</option>
            <option>Furniture</option>
            <option>Art</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 relative">
              <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <img src="/images/kCEM_Logo.png" alt="Product" className="w-16 h-16 opacity-50" loading="lazy" />
              </div>
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow">
                <Heart size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Upcycled Product</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Eco Brand</p>
                </div>
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="ml-1 text-xs sm:text-sm">4.5</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                Beautifully crafted from recycled materials, sustainable and eco-friendly.
              </p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-lg sm:text-2xl font-bold">RWF 15,000</p>
                  <p className="text-xs sm:text-sm text-gray-600">+500 Green Points</p>
                </div>
                <button className="px-3 sm:px-4 py-1 sm:py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-xs sm:text-sm w-full sm:w-auto">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ImpactDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">My Environmental Impact</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Green Score" value={stats.greenScore} icon={<Leaf className="text-cyan-500" size={24} />} change="+5" />
        <StatCard title="Total Impact" value={`${stats.totalImpact} kg`} icon={<Recycle className="text-blue-500" size={24} />} change="+12 kg" />
        <StatCard title="CO₂ Saved" value={`${stats.co2Savings} kg`} icon={<Award className="text-purple-500" size={24} />} change="+45 kg" />
        <StatCard title="Trees Equivalent" value={Math.round(stats.co2Savings/21)} icon={<Leaf className="text-cyan-500" size={24} />} change="+3" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Material Breakdown" icon={<Recycle size={20} />}>
          <div className="space-y-4">
            {[
              { material: 'Plastic', amount: '32kg', percent: 38, color: 'bg-cyan-600' },
              { material: 'Glass', amount: '25kg', percent: 29, color: 'bg-blue-600' },
              { material: 'Paper', amount: '18kg', percent: 21, color: 'bg-purple-600' },
              { material: 'Metal', amount: '10kg', percent: 12, color: 'bg-orange-600' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.material}</span>
                  <span className="text-sm text-gray-600">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Monthly Progress" icon={<TrendingUp size={20} />}>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-cyan-600">85kg</div>
              <p className="text-gray-600 mt-2">Waste diverted this month</p>
              <p className="text-sm text-gray-500">15% more than last month</p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Great job!</strong> You've saved approximately {stats.co2Savings}kg of CO₂ emissions this month. Keep it up!
              </p>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );

  const OrdersManagement = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">My Orders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Orders" value="12" icon={<ShoppingCart className="text-cyan-500" size={24} />} change="+3 this month" />
        <StatCard title="In Transit" value="2" icon={<Clock className="text-yellow-500" size={24} />} change="" />
        <StatCard title="Delivered" value="10" icon={<CheckCircle className="text-cyan-500" size={24} />} change="+2" />
        <StatCard title="Total Spent" value="RWF 45K" icon={<DollarSign className="text-purple-500" size={24} />} change="+8K" />
      </div>
      
      <DashboardWidget title="Order History" icon={<ShoppingCart size={20} />}>
        <div className="space-y-4">
          {recentPurchases.map((purchase) => (
            <div key={purchase.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow gap-3">
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src="/images/kCEM_Logo.png" alt={purchase.item} className="w-10 h-10 opacity-50" loading="lazy" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{purchase.item}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Sold by {purchase.seller}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      purchase.status === 'delivered' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {purchase.status}
                    </span>
                    <span className="text-xs text-gray-500">{purchase.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <p className="text-lg sm:text-xl font-bold">RWF {purchase.price.toLocaleString()}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-2">
                  <button className="px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm">Track</button>
                  <button className="px-2 sm:px-3 py-1 bg-cyan-600 text-white rounded text-xs sm:text-sm">Reorder</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardWidget>
    </div>
  );

  const FinancialDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Financial Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Available Credits" value={`RWF ${stats.availableCredits.toLocaleString()}`} icon={<DollarSign className="text-cyan-500" size={24} />} change="+1000" />
        <StatCard title="Green Points" value="2,450" icon={<Award className="text-purple-500" size={24} />} change="+250" />
        <StatCard title="This Month" value="RWF 12K" icon={<TrendingUp className="text-blue-500" size={24} />} change="+15%" />
        <StatCard title="Saved" value="RWF 3.5K" icon={<DollarSign className="text-cyan-500" size={24} />} change="+500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="Transaction History" icon={<DollarSign size={20} />}>
          <div className="space-y-3">
            {[
              { date: '2024-02-10', description: 'Purchase - Recycled Glass', amount: -1500, type: 'debit' },
              { date: '2024-02-08', description: 'Green Points Reward', amount: 250, type: 'credit' },
              { date: '2024-02-05', description: 'Purchase - Bamboo Cutlery', amount: -3500, type: 'debit' },
              { date: '2024-02-03', description: 'Referral Bonus', amount: 500, type: 'credit' },
            ].map((txn, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{txn.description}</p>
                  <p className="text-sm text-gray-600">{txn.date}</p>
                </div>
                <span className={`font-bold ${txn.type === 'credit' ? 'text-cyan-600' : 'text-gray-900'}`}>
                  {txn.type === 'credit' ? '+' : ''}{txn.amount.toLocaleString()} {txn.type === 'credit' ? 'pts' : 'RWF'}
                </span>
              </div>
            ))}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Payment Methods" icon={<DollarSign size={20} />}>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Mobile Money</p>
                  <p className="text-sm text-gray-600">**** **** 5678</p>
                </div>
                <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded">Primary</span>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="px-3 py-1 border rounded text-sm">Edit</button>
                <button className="px-3 py-1 text-red-600 border border-red-600 rounded text-sm">Remove</button>
              </div>
            </div>
            <button className="w-full p-3 border-2 border-dashed rounded-lg text-cyan-600 hover:bg-cyan-50">
              + Add Payment Method
            </button>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );

  const Settings = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Account Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Profile Information</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input type="text" defaultValue="Jane Doe" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" defaultValue="jane@example.com" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input type="tel" defaultValue="+250 788 123 456" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input type="text" defaultValue="Kigali, Rwanda" className="w-full p-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full p-3 bg-cyan-600 text-white rounded-lg">Save Changes</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select className="w-full p-2 border rounded-lg">
                <option>English</option>
                <option>Kinyarwanda</option>
                <option>French</option>
              </select>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Notifications</h4>
              <div className="space-y-2">
                {['Email notifications', 'SMS alerts', 'Push notifications', 'Marketing emails'].map((item, idx) => (
                  <label key={idx} className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked={idx < 3} className="w-4 h-4" />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Privacy</h4>
              <div className="space-y-2">
                {['Share impact publicly', 'Show in leaderboard', 'Allow seller contact'].map((item, idx) => (
                  <label key={idx} className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked={idx !== 2} className="w-4 h-4" />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button className="w-full p-3 bg-cyan-600 text-white rounded-lg">Update Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="overview" element={<Overview />} />
      <Route path="marketplace" element={<MarketplaceView />} />
      <Route path="impact" element={<ImpactDashboard />} />
      <Route path="orders" element={<OrdersManagement />} />
      <Route path="financial" element={<FinancialDashboard />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
};

export default UserDashboard;