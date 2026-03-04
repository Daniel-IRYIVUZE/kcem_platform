// components/services/DriverServices.tsx
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Award, 
  Shield, 
  Smartphone,
  Users,
  Wrench,
  Star,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverServices = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Smart Route Assignment',
      description: 'Optimized daily routes with turn-by-turn navigation, even offline.',
      color: 'bg-yellow-700',
      stats: '40% less travel'
    },
    {
      icon: Smartphone,
      title: 'Offline Navigation',
      description: 'Full functionality without internet - routes cached for offline use.',
      color: 'bg-cyan-600',
      stats: 'Works offline'
    },
    {
      icon: Shield,
      title: 'Proof of Collection',
      description: 'Photo upload with GPS timestamp for verification.',
      color: 'bg-purple-600',
      stats: '100% verified'
    },
    {
      icon: DollarSign,
      title: 'Earnings Tracker',
      description: 'Real-time earnings with daily, weekly, and monthly summaries.',
      color: 'bg-cyan-600',
      stats: 'RWF 15k/day avg'
    },
    {
      icon: Wrench,
      title: 'Vehicle Management',
      description: 'Maintenance reminders and fuel consumption tracking.',
      color: 'bg-blue-600',
      stats: 'Save on fuel'
    },
    {
      icon: Award,
      title: 'Performance Bonuses',
      description: 'Earn extra for on-time collections and high-quality service.',
      color: 'bg-amber-500',
      stats: 'Up to 20% bonus'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Choose your working hours and preferred collection zones.',
      color: 'bg-cyan-600',
      stats: 'Flexible hours'
    },
    {
      icon: Users,
      title: 'Driver Community',
      description: 'Connect with other drivers, share tips and support.',
      color: 'bg-indigo-600',
      stats: '3 members'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Build your reputation with hotel and recycler ratings.',
      color: 'bg-pink-600',
      stats: '4.8 avg rating'
    }
  ];

  const earnings = [
    { type: 'Base Pay per Stop', amount: 'RWF 1,500 - 2,500' },
    { type: 'Distance Bonus', amount: 'RWF 50/km' },
    { type: 'Quality Bonus', amount: 'RWF 500 - 1,000' },
    { type: 'On-time Completion', amount: 'RWF 2,000/day' },
    { type: 'Weekly Top Performer', amount: 'RWF 10,000' }
  ];

  return (
    <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          For <span className="text-yellow-700">Drivers</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Earn steady income with flexible hours and optimized routes
        </p>
      </div>

      {/* Earnings Calculator Preview */}
      <div className="bg-yellow-700 rounded-3xl p-8 text-white mb-12">
        <h3 className="text-2xl font-bold mb-6">Potential Daily Earnings</h3>
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {earnings.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium mb-1 opacity-90">{item.type}</div>
              <div className="text-lg font-bold">{item.amount}</div>
            </div>
          ))}
        </div>
        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-2xl font-bold">Average Daily Total: RWF 12,000 - 20,000</p>
        </div>
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

      {/* Requirements */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 mb-16">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Driver Requirements</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Valid Driver's License</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Category appropriate for vehicle</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Insurance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valid vehicle insurance</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Smartphone</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Android or iOS device</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button onClick={() => navigate('/login')} className="bg-yellow-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-700 transition-colors inline-flex items-center group">
          Start Driving with EcoTrade
          <Truck className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Join 3+ drivers already earning on the platform</p>
      </div>
    </div>
  );
};

export default DriverServices;