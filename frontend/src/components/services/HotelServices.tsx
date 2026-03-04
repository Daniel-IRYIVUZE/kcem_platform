// components/services/HotelServices.tsx
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Award, 
  FileText, 
  Zap,
  DollarSign,
  Shield,
  Clock,
  Target,
  Users,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HotelServices = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Waste Valuation Engine',
      description: 'AI-powered real-time pricing for all recyclable materials based on market demand and quality.',
      color: 'bg-cyan-600',
      stats: '15-20% higher prices'
    },
    {
      icon: Calendar,
      title: 'Automated Pickup Scheduling',
      description: 'Set your preferred collection frequency and get automatic driver assignments.',
      color: 'bg-blue-600',
      stats: '98% on-time rate'
    },
    {
      icon: DollarSign,
      title: 'Revenue Dashboard',
      description: 'Track earnings in real-time with detailed breakdowns by waste type and collection.',
      color: 'bg-cyan-600',
      stats: 'RWF 50k avg monthly'
    },
    {
      icon: Award,
      title: 'Green Score Calculator',
      description: 'Measure and improve your environmental impact with actionable insights.',
      color: 'bg-purple-600',
      stats: '85% avg score'
    },
    {
      icon: FileText,
      title: 'Digital Recycling Certificates',
      description: 'Download verifiable certificates for sustainability reporting and compliance.',
      color: 'bg-amber-500',
      stats: '100% verifiable'
    },
    {
      icon: Zap,
      title: 'Competitive Bidding',
      description: 'Let recyclers compete for your waste, ensuring the best prices.',
      color: 'bg-red-600',
      stats: '5+ bids avg'
    },
    {
      icon: BarChart3,
      title: 'Waste Analytics',
      description: 'Comprehensive insights into your waste generation patterns and trends.',
      color: 'bg-cyan-600',
      stats: '12 metrics tracked'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Photo verification and quality checks at every collection.',
      color: 'bg-cyan-600',
      stats: '100% verified'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Live updates on driver location and estimated arrival times.',
      color: 'bg-yellow-700',
      stats: 'Live tracking'
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Zero Upfront Costs',
      description: 'No subscription fees, only pay 5% when you earn'
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: '24/7 support for all your waste management needs'
    },
    {
      icon: Globe,
      title: 'Sustainability Reporting',
      description: 'Automated ESG reports for stakeholders'
    }
  ];

  return (
    <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          For <span className="text-cyan-600">Hotels & Restaurants</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Transform your waste management from a cost center into a revenue stream
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">40%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Lower Disposal Costs</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">24h</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Collection</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">85%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Diversion Rate</div>
        </div>
        <div className="bg-orange-50 dark:bg-yellow-700/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-700 mb-2">RWF 50k</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Revenue</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative overflow-hidden"
          >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-7 h-7" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>

            {/* Stats Badge */}
            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {feature.stats}
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-cyan-600 rounded-3xl p-8 text-white mb-16">
        <h3 className="text-2xl text-white font-bold mb-8 text-center">Why Hotels Choose EcoTrade</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/20dark:bg-gray-800/20 rounded-2xl mb-4">
                <benefit.icon className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-white mb-2">{benefit.title}</h4>
              <p className="text-sm text-cyan-100">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button onClick={() => navigate('/login')} className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-cyan-700 transition-colors inline-flex items-center group">
          Start Earning from Your Waste
          <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">No credit card required • Free to list</p>
      </div>
    </div>
  );
};

export default HotelServices;