// components/services/RecyclerServices.tsx
import { 
  Package, 
  Truck,  
  Shield, 
  BarChart3, 
  Users,
  Map,
  Clock,
  Award,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecyclerServices = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Supply Pipeline Dashboard',
      description: 'Real-time view of available waste with filtering by type, volume, and location.',
      color: 'bg-blue-600',
      stats: '24/7 availability'
    },
    {
      icon: Map,
      title: 'Route Optimization',
      description: 'PostGIS-powered clustering for 40% shorter collection routes and lower fuel costs.',
      color: 'bg-cyan-600',
      stats: '40% shorter routes'
    },
    {
      icon: Shield,
      title: 'Quality Grading System',
      description: 'Verified quality assessments with photo proof before collection.',
      color: 'bg-purple-600',
      stats: '100% verified'
    },
    {
      icon: BarChart3,
      title: 'Inventory Management',
      description: 'Track incoming materials, storage levels, and processing schedules.',
      color: 'bg-yellow-700',
      stats: 'Real-time tracking'
    },
    {
      icon: Truck,
      title: 'Fleet Tracking',
      description: 'Live monitoring of driver locations and collection progress.',
      color: 'bg-cyan-600',
      stats: 'Live GPS'
    },
    {
      icon: DollarSign,
      title: 'Payment Reconciliation',
      description: 'Automated settlements with detailed transaction history.',
      color: 'bg-cyan-600',
      stats: 'Instant payments'
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Complete driver onboarding, scheduling, and performance tracking.',
      color: 'bg-amber-500',
      stats: '47 drivers'
    },
    {
      icon: Clock,
      title: 'Bid Automation',
      description: 'Set automatic bidding rules for consistent supply.',
      color: 'bg-indigo-600',
      stats: '24/7 bidding'
    },
    {
      icon: Award,
      title: 'Quality Certifications',
      description: 'Verified green credentials for your recycling operations.',
      color: 'bg-red-600',
      stats: 'REMA certified'
    }
  ];

  const benefits = [
    {
      metric: '23',
      label: 'Active Recyclers',
      description: 'Growing network of partners'
    },
    {
      metric: '156',
      label: 'Supply Sources',
      description: 'Hotels and restaurants'
    },
    {
      metric: '1247T',
      label: 'Monthly Volume',
      description: 'Available for collection'
    },
    {
      metric: '40%',
      label: 'Cost Reduction',
      description: 'Through route optimization'
    }
  ];

  return (
    <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          For <span className="text-blue-600 dark:text-blue-400">Recyclers</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Secure a steady supply of quality materials with optimized logistics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {benefits.map((benefit, index) => (
          <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{benefit.metric}</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{benefit.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{benefit.description}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative overflow-hidden"
          >
            <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>

            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {feature.stats}
            </div>
          </div>
        ))}
      </div>

      {/* Supply Chain Visualization */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white mb-16">
        <h3 className="text-2xl font-bold mb-6">How It Works for Recyclers</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
            <p className="text-sm">Browse available listings</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
            <p className="text-sm">Place competitive bids</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
            <p className="text-sm">Optimize collection routes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
            <p className="text-sm">Receive verified materials</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center group">
          Start Sourcing Materials
          <Package className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Join 2 recyclers already on the platform</p>
      </div>
    </div>
  );
};

export default RecyclerServices;