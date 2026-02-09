import { 
  ShoppingBag, 
  Recycle, 
  Truck, 
  Check, 
  HelpCircle, 
  BarChart, 
  Shield, 
  Upload, 
  Target, 
  Clock, 
  DollarSign,
  MapPin,
  TrendingUp,
  Smartphone,
  Zap,
  Award,
  CheckCircle2,
  X,
  ArrowRight,
  Users,
  Building,
  Factory,
  FileText,
  Package,
  Navigation,
  Wallet,
  Calendar,
  Bell,
  Settings,
  User,
  ChartBar,
  Map,
  ChevronDown,
  Leaf,
  WifiOff,
  Camera,
  QrCode
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ServicesPage = () => {
  const [selectedTier, setSelectedTier] = useState('business');
  const [activeComparison, setActiveComparison] = useState('cost-benefit');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const serviceFeatures = {
    horeca: [
      { 
        icon: <Upload />, 
        title: "Waste Listing Management", 
        description: "Upload waste details with photos, track inventory, and manage multiple material streams",
        details: ["Photo upload with quality verification", "Real-time inventory tracking", "Automated pricing suggestions", "Batch listing creation"]
      },
      { 
        icon: <BarChart />, 
        title: "Revenue Dashboard", 
        description: "Real-time tracking of waste sales, revenue analytics, and financial reporting",
        details: ["Daily/weekly/monthly revenue reports", "Material-wise earning analysis", "Projected earnings calculator", "Exportable financial statements"]
      },
      { 
        icon: <Award />, 
        title: "Green Score Certification", 
        description: "Automated certification based on recycling performance and sustainability metrics",
        details: ["Real-time environmental impact tracking", "Certification levels (Bronze to Platinum)", "Public sustainability profile", "Marketing-ready certificates"]
      },
      { 
        icon: <Shield />, 
        title: "Sustainability Reporting", 
        description: "Generate environmental impact reports for compliance and marketing",
        details: ["Carbon footprint calculations", "Waste diversion metrics", "Compliance documentation", "Annual sustainability reports"]
      }
    ],
    recyclers: [
      { 
        icon: <Target />, 
        title: "Reliable Supply Sourcing", 
        description: "Access verified waste streams from HORECA businesses with quality assurance",
        details: ["Verified supplier network", "Quality rating system", "Consistent supply alerts", "Supplier performance tracking"]
      },
      { 
        icon: <MapPin />, 
        title: "Route Optimization", 
        description: "AI-powecyan collection routes minimizing fuel costs and maximizing efficiency",
        details: ["AI-powecyan route planning", "Traffic-aware scheduling", "Multi-stop optimization", "Fuel consumption analytics"]
      },
      { 
        icon: <CheckCircle2 />, 
        title: "Quality Verification", 
        description: "Digital verification of waste quality before collection and processing",
        details: ["Digital quality inspection", "Photo verification system", "Quality dispute resolution", "Automated quality scoring"]
      },
      { 
        icon: <TrendingUp />, 
        title: "Bulk Purchasing", 
        description: "Access to aggregated waste volumes for better pricing and supply stability",
        details: ["Volume-based pricing", "Aggregated collection scheduling", "Supply chain forecasting", "Bulk contract management"]
      }
    ],
    drivers: [
      { 
        icon: <Smartphone />, 
        title: "Offline-First Mobile App", 
        description: "Full functionality in low-connectivity areas with automatic sync",
        details: ["Offline route storage", "Automatic sync when online", "Low-data mode", "GPS tracking without internet"]
      },
      { 
        icon: <MapPin />, 
        title: "Optimized Routing", 
        description: "Turn-by-turn navigation with intelligent clustering and traffic updates",
        details: ["Real-time traffic updates", "Intelligent stop clustering", "ETA calculations", "Alternative route suggestions"]
      },
      { 
        icon: <Clock />, 
        title: "Collection Verification", 
        description: "QR code scanning and photo verification for each pickup",
        details: ["QR code scanning", "Photo verification workflow", "Digital signature capture", "Weight verification"]
      },
      { 
        icon: <DollarSign />, 
        title: "Payment Processing", 
        description: "Secure digital payments and earnings tracking in real-time",
        details: ["Real-time earnings display", "Mobile money integration", "Payment history", "Withdrawal management"]
      }
    ],
    individual: [
      { 
        icon: <User />, 
        title: "Personal Green Score", 
        description: "Track your environmental impact and earn recognition",
        details: ["Personal carbon footprint", "Impact visualization", "Achievement badges", "Community ranking"]
      },
      { 
        icon: <Package />, 
        title: "Waste Trading", 
        description: "Buy and sell recyclable materials through the marketplace",
        details: ["Browsing listings", "Bid/offer system", "Transaction history", "Saved searches"]
      },
      { 
        icon: <Wallet />, 
        title: "Earnings Dashboard", 
        description: "Track your earnings from waste collection and sales",
        details: ["Earnings analytics", "Payment methods", "Withdrawal options", "Tax documentation"]
      },
      { 
        icon: <Map />, 
        title: "Collection Routes", 
        description: "Optimize your collection routes for maximum efficiency",
        details: ["Route optimization", "Collection scheduling", "Area mapping", "Performance tracking"]
      }
    ],
  };

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small cafes and individual waste collectors',
      icon: <User size={24} />,
      color: 'from-slate-500 to-gray-500',
      features: [
        { included: true, text: 'Basic waste listings (3 materials per month)' },
        { included: true, text: 'Mobile app access' },
        { included: true, text: 'Community support' },
        { included: true, text: 'Basic marketplace access' },
        { included: false, text: 'Advanced analytics' },
        { included: false, text: 'Green Score certification' },
        { included: false, text: 'API access' },
        { included: false, text: 'Priority support' }
      ],
      bestFor: ['Individual collectors', 'Small cafes', 'Startups']
    },
    {
      id: 'business',
      name: 'Business',
      price: 'Rwf 25,000',
      description: 'Complete solution for HORECA businesses',
      icon: <Building size={24} />,
      color: 'from-cyan-500 to-cyan-500',
      popular: true,
      features: [
        { included: true, text: 'Unlimited waste listings' },
        { included: true, text: 'Full revenue dashboard' },
        { included: true, text: 'Green Score certification' },
        { included: true, text: 'Priority support' },
        { included: true, text: 'Sustainability reports' },
        { included: true, text: 'Advanced analytics' },
        { included: false, text: 'Custom API integration' },
        { included: false, text: 'Dedicated account manager' }
      ],
      bestFor: ['Hotels', 'Restaurants', 'Medium businesses']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large hotel chains and industrial recyclers',
      icon: <Factory size={24} />,
      color: 'from-cyan-500 to-cyan-500',
      features: [
        { included: true, text: 'Everything in Business tier' },
        { included: true, text: 'Custom API access' },
        { included: true, text: 'Dedicated account manager' },
        { included: true, text: 'Custom reporting tools' },
        { included: true, text: 'White-label solutions' },
        { included: true, text: 'SLA guarantees' },
        { included: true, text: 'Advanced integration' },
        { included: true, text: 'Training & onboarding' }
      ],
      bestFor: ['Hotel chains', 'Recycling plants', 'Large corporations']
    }
  ];

  const comparisons = {
    'cost-benefit': {
      title: "Cost-Benefit Analysis",
      rows: [
        { 
          feature: "Monthly Disposal Costs", 
          traditional: "Rwf 50,000 - Rwf 200,000", 
          kcem: "Rwf 0 - Revenue Generated", 
          savings: "100%+ savings",
          icon: <DollarSign size={16} />
        },
        { 
          feature: "Collection Efficiency", 
          traditional: "40-60%", 
          kcem: "85-95%", 
          savings: "+40% efficiency",
          icon: <TrendingUp size={16} />
        },
        { 
          feature: "Carbon Reporting", 
          traditional: "Manual estimates", 
          kcem: "Automated tracking", 
          savings: "100% accuracy",
          icon: <Leaf size={16} />
        },
        { 
          feature: "Revenue Generation", 
          traditional: "None", 
          kcem: "Rwf 10,000 - Rwf 100,000/mo", 
          savings: "New income stream",
          icon: <ChartBar size={16} />
        },
        { 
          feature: "Admin Time", 
          traditional: "10-20 hours/month", 
          kcem: "1-2 hours/month", 
          savings: "90% cyanuction",
          icon: <Clock size={16} />
        }
      ]
    },
    'features': {
      title: "Feature Comparison",
      rows: [
        { 
          feature: "Digital Waste Listing", 
          traditional: "✗", 
          kcem: "✓", 
          savings: "Automated process",
          icon: <Upload size={16} />
        },
        { 
          feature: "Route Optimization", 
          traditional: "✗", 
          kcem: "✓", 
          savings: "AI-powecyan routing",
          icon: <Navigation size={16} />
        },
        { 
          feature: "Real-time Tracking", 
          traditional: "✗", 
          kcem: "✓", 
          savings: "Live updates",
          icon: <Map size={16} />
        },
        { 
          feature: "Automated Payments", 
          traditional: "✗", 
          kcem: "✓", 
          savings: "Secure & instant",
          icon: <Wallet size={16} />
        },
        { 
          feature: "Environmental Reporting", 
          traditional: "Manual", 
          kcem: "Automated", 
          savings: "Verified metrics",
          icon: <FileText size={16} />
        }
      ]
    }
  };

  const roleLoginFeatures = [
    {
      role: 'HORECA Business',
      loginPath: '/dashboard/hotel',
      features: [
        { icon: <Calendar />, text: 'Waste Listing Calendar' },
        { icon: <BarChart />, text: 'Revenue Analytics' },
        { icon: <Award />, text: 'Green Score Dashboard' },
        { icon: <Bell />, text: 'Offer Notifications' }
      ]
    },
    {
      role: 'Recycling Company',
      loginPath: '/dashboard/recycler',
      features: [
        { icon: <Target />, text: 'Supplier Network' },
        { icon: <MapPin />, text: 'Route Optimization' },
        { icon: <Package />, text: 'Inventory Management' },
        { icon: <TrendingUp />, text: 'Procurement Analytics' }
      ]
    },
    {
      role: 'Logistics Driver',
      loginPath: '/dashboard/driver',
      features: [
        { icon: <Navigation />, text: 'Route Navigation' },
        { icon: <Clock />, text: 'Schedule Management' },
        { icon: <Camera />, text: 'Collection Verification' },
        { icon: <DollarSign />, text: 'Earnings Tracker' }
      ]
    },
    {
      role: 'Individual Collector',
      loginPath: '/dashboard/individual',
      features: [
        { icon: <User />, text: 'Personal Profile' },
        { icon: <Leaf />, text: 'Impact Tracking' },
        { icon: <Wallet />, text: 'Earnings Dashboard' },
        { icon: <Map />, text: 'Collection Map' }
      ]
    },
  ];

  const mobileFeatures = [
    {
      title: "Offline-First Architecture",
      description: "Full functionality without internet connection",
      icon: <WifiOff />,
      details: ["Route storage", "Data collection", "Photo capture", "Auto-sync"]
    },
    {
      title: "QR Code Integration",
      description: "Quick verification and payment processing",
      icon: <QrCode />,
      details: ["Business verification", "Pickup confirmation", "Payment processing", "Inventory tracking"]
    },
    {
      title: "Real-time Notifications",
      description: "Instant updates on offers, pickups, and payments",
      icon: <Bell />,
      details: ["Push notifications", "SMS alerts", "Email updates", "In-app messages"]
    },
    {
      title: "Location Services",
      description: "GPS tracking and geofencing for collections",
      icon: <MapPin />,
      details: ["Real-time tracking", "Geofence alerts", "Route optimization", "ETA calculations"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-cyan-300">Waste Management Solutions</span>
              </h1>
              <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-12 opacity-90">
                Tailocyan dashboards and tools for every stakeholder in Rwanda's circular economy
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex flex-wrap items-center justify-center gap-6"
              >
                {roleLoginFeatures.map((roleFeature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-sm">{roleFeature.role}</span>
                    <ChevronDown size={14} className="text-cyan-300" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Service Roles Section */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Complete Service Packages</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Comprehensive tools designed for each stakeholder in the circular economy
              </p>
            </motion.div>

            <div className="space-y-8">
              {Object.entries(serviceFeatures).map(([role, features], roleIndex) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: roleIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-6">
                    <button
                      onClick={() => setExpandedRole(expandedRole === role ? null : role)}
                      className="flex items-center justify-between w-full p-6 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          role === 'horeca' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          role === 'recyclers' ? 'bg-gradient-to-br from-green-500 to-cyan-500' :
                          role === 'drivers' ? 'bg-gradient-to-br from-cyan-500 to-cyan-500' :
                          role === 'individual' ? 'bg-gradient-to-br from-cyan-500 to-cyan-500' :
                          'bg-gradient-to-br from-cyan-500 to-cyan-500'
                        } text-white`}>
                          {role === 'horeca' ? <ShoppingBag size={24} /> :
                           role === 'recyclers' ? <Recycle size={24} /> :
                           role === 'drivers' ? <Truck size={24} /> :
                           role === 'individual' ? <User size={24} /> :
                           <Shield size={24} />}
                        </div>
                        <div className="text-left">
                          <h3 className="text-2xl font-bold text-slate-900">
                            {role === 'horeca' ? 'HORECA Businesses' :
                             role === 'recyclers' ? 'Recycling Companies' :
                             role === 'drivers' ? 'Logistics & Drivers' :
                             role === 'individual' ? 'Individual Collectors' :
                             'Platform Admins'}
                          </h3>
                          <p className="text-slate-600">
                            {role === 'horeca' ? 'Transform waste into revenue' :
                             role === 'recyclers' ? 'Access reliable waste streams' :
                             role === 'drivers' ? 'Optimize collection operations' :
                             role === 'individual' ? 'Participate in circular economy' :
                             'Manage platform operations'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-slate-500">Login for more</div>
                        </div>
                        <ChevronDown className={`transition-transform ${expandedRole === role ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedRole === role && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid md:grid-cols-2 gap-6">
                          {features.map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  role === 'horeca' ? 'bg-blue-50 text-blue-600' :
                                  role === 'recyclers' ? 'bg-green-50 text-green-600' :
                                  role === 'drivers' ? 'bg-cyan-50 text-cyan-600' :
                                  role === 'individual' ? 'bg-cyan-50 text-cyan-600' :
                                  'bg-cyan-50 text-cyan-600'
                                }`}>
                                  {feature.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                                  <p className="text-slate-600 text-sm mb-3">{feature.description}</p>
                                  <div className="space-y-2">
                                    {feature.details?.map((detail, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                        {detail}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Features Section */}
        <section className="py-24 bg-gradient-to-b from-cyan-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Mobile App Features</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Access your dashboard on-the-go with our Flutter mobile application
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mobileFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                        <Check size={14} className="text-cyan-500" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-cyan-900 to-cyan-900 rounded-2xl p-8 text-white"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-3">Download Mobile App</h3>
                  <p className="text-cyan-100/80">Available on iOS and Android with role-specific interfaces</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-cyan-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Smartphone size={20} />
                      Android
                    </div>
                  </button>
                  <button className="px-6 py-3 bg-white text-cyan-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Smartphone size={20} />
                      iOS
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Flexible Pricing Tiers</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Choose the perfect plan for your business needs
              </p>
            </motion.div>

            <div className="flex justify-center gap-4 mb-12">
              {pricingTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    selectedTier === tier.id 
                      ? `bg-gradient-to-r ${tier.color} text-white shadow-lg` 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tier.icon}
                  {tier.name}
                  {tier.popular && selectedTier === tier.id && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">POPULAR</span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative rounded-[2rem] overflow-hidden border transition-all duration-300 ${
                    selectedTier === tier.id 
                      ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/30 border-cyan-500' 
                      : 'scale-100 shadow-lg border-slate-200'
                  } ${tier.popular ? 'bg-gradient-to-b from-white to-cyan-50' : 'bg-white'}`}
                >
                  {tier.popular && selectedTier === tier.id && (
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className={`bg-gradient-to-r ${tier.color} text-white px-6 py-1 rounded-full text-sm font-bold whitespace-nowrap`}>
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.color} text-white`}>
                        {tier.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                        <p className="text-slate-500 text-sm">{tier.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-5xl font-black text-slate-900 mb-2">{tier.price}</div>
                      {tier.price !== 'Free' && tier.price !== 'Custom' && (
                        <div className="text-slate-500 text-sm">per month, billed annually</div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm font-medium text-slate-700 mb-2">Best for:</div>
                      <div className="flex flex-wrap gap-2">
                        {tier.bestFor.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="text-cyan-500 flex-shrink-0" size={20} />
                          ) : (
                            <X className="text-slate-400 flex-shrink-0" size={20} />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedTier === tier.id
                        ? `bg-gradient-to-r ${tier.color} text-white hover:shadow-lg`
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}>
                      Get Started <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 text-cyan-700">
                <HelpCircle size={20} />
                <span className="font-medium">All plans include 14-day free trial • Volume discounts available</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Traditional vs KCEM Comparison</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                See how our platform transforms waste management economics
              </p>
            </motion.div>

            <div className="mb-8">
              <div className="flex gap-4 justify-center mb-8">
                {Object.keys(comparisons).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveComparison(key as keyof typeof comparisons)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      activeComparison === key
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {comparisons[key as keyof typeof comparisons].title}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={activeComparison}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-200"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                    <tr>
                      <th className="text-left p-6 font-bold text-slate-900">Feature / Metric</th>
                      <th className="text-left p-6 font-bold text-slate-900">Traditional Method</th>
                      <th className="text-left p-6 font-bold text-slate-900">KCEM Platform</th>
                      <th className="text-left p-6 font-bold text-slate-900">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons[activeComparison as keyof typeof comparisons].rows.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-t border-slate-100 ${
                          index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                              {row.icon}
                            </div>
                            <span className="font-medium text-slate-900">{row.feature}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 ${
                            row.traditional.includes('✗') ? 'text-slate-500' : 'text-slate-700'
                          }`}>
                            {row.traditional}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 ${
                            row.kcem.includes('✓') ? 'text-cyan-500' : 'text-slate-700'
                          }`}>
                            {row.kcem}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-100 text-cyan-800 px-4 py-2 rounded-lg font-medium">
                            <TrendingUp size={16} />
                            {row.savings}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Benefits Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 grid md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Cost cyanuction</h4>
                <p className="text-slate-600">Average 65% cyanuction in waste management costs for HORECA businesses</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Revenue Generation</h4>
                <p className="text-slate-600">New income streams from waste previously treated as disposal expense</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Operational Efficiency</h4>
                <p className="text-slate-600">40% improvement in collection logistics and route optimization</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-6"
            >
              Ready to Access Your Role-Specific Dashboard?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-cyan-100 mb-10 max-w-2xl mx-auto"
            >
              Join 85+ businesses already benefiting from tailocyan waste management solutions
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="bg-white text-cyan-900 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all hover:scale-105">
                Start Free Trial <ArrowRight size={20} />
              </button>?
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;