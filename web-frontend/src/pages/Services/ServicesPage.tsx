import { useState } from 'react';
import {
  BarChart,
  Shield,
  Upload,
  Target,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  Smartphone,
  Award,
  CheckCircle2,
  Building,
  Factory,
  FileText,
  Package,
  Navigation,
  Wallet,
  User,
  ChartBar,
  Map,
  Leaf,
  ArrowRight,
  Calendar,
  Bell,
  Camera,
  WifiOff,
  QrCode
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import ServiceHeroSection from '../../components/services/ServiceHeroSection';
import ServiceRolesSection from '../../components/services/ServiceRolesSection';
import ServiceMobileFeaturesSection from '../../components/services/ServiceMobileFeaturesSection';
import ServicePricingSection from '../../components/services/ServicePricingSection';
import ServiceComparisonSection from '../../components/services/ServiceComparisonSection';
import ServiceCTASection from '../../components/services/ServiceCTASection';

const ServicesPage = () => {
  const [selectedTier, setSelectedTier] = useState('business');
  const [activeComparison, setActiveComparison] = useState('cost-benefit');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const serviceFeatures = {
    horeca: [
      {
        icon: <Upload />,
        title: 'Waste Listing Management',
        description: 'Upload waste details with photos, track inventory, and manage multiple material streams',
        details: ['Photo upload with quality verification', 'Real-time inventory tracking', 'Automated pricing suggestions', 'Batch listing creation']
      },
      {
        icon: <BarChart />,
        title: 'Revenue Dashboard',
        description: 'Real-time tracking of waste sales, revenue analytics, and financial reporting',
        details: ['Daily/weekly/monthly revenue reports', 'Material-wise earning analysis', 'Projected earnings calculator', 'Exportable financial statements']
      },
      {
        icon: <Award />,
        title: 'Green Score Certification',
        description: 'Automated certification based on recycling performance and sustainability metrics',
        details: ['Real-time environmental impact tracking', 'Certification levels (Bronze to Platinum)', 'Public sustainability profile', 'Marketing-ready certificates']
      },
      {
        icon: <Shield />,
        title: 'Sustainability Reporting',
        description: 'Generate environmental impact reports for compliance and marketing',
        details: ['Carbon footprint calculations', 'Waste diversion metrics', 'Compliance documentation', 'Annual sustainability reports']
      }
    ],
    recyclers: [
      {
        icon: <Target />,
        title: 'Reliable Supply Sourcing',
        description: 'Access verified waste streams from HORECA businesses with quality assurance',
        details: ['Verified supplier network', 'Quality rating system', 'Consistent supply alerts', 'Supplier performance tracking']
      },
      {
        icon: <MapPin />,
        title: 'Route Optimization',
        description: 'AI-powecyan collection routes minimizing fuel costs and maximizing efficiency',
        details: ['AI-powecyan route planning', 'Traffic-aware scheduling', 'Multi-stop optimization', 'Fuel consumption analytics']
      },
      {
        icon: <CheckCircle2 />,
        title: 'Quality Verification',
        description: 'Digital verification of waste quality before collection and processing',
        details: ['Digital quality inspection', 'Photo verification system', 'Quality dispute resolution', 'Automated quality scoring']
      },
      {
        icon: <TrendingUp />,
        title: 'Bulk Purchasing',
        description: 'Access to aggregated waste volumes for better pricing and supply stability',
        details: ['Volume-based pricing', 'Aggregated collection scheduling', 'Supply chain forecasting', 'Bulk contract management']
      }
    ],
    drivers: [
      {
        icon: <Smartphone />,
        title: 'Offline-First Mobile App',
        description: 'Full functionality in low-connectivity areas with automatic sync',
        details: ['Offline route storage', 'Automatic sync when online', 'Low-data mode', 'GPS tracking without internet']
      },
      {
        icon: <MapPin />,
        title: 'Optimized Routing',
        description: 'Turn-by-turn navigation with intelligent clustering and traffic updates',
        details: ['Real-time traffic updates', 'Intelligent stop clustering', 'ETA calculations', 'Alternative route suggestions']
      },
      {
        icon: <Clock />,
        title: 'Collection Verification',
        description: 'QR code scanning and photo verification for each pickup',
        details: ['QR code scanning', 'Photo verification workflow', 'Digital signature capture', 'Weight verification']
      },
      {
        icon: <DollarSign />,
        title: 'Payment Processing',
        description: 'Secure digital payments and earnings tracking in real-time',
        details: ['Real-time earnings display', 'Mobile money integration', 'Payment history', 'Withdrawal management']
      }
    ],
    individual: [
      {
        icon: <User />,
        title: 'Personal Green Score',
        description: 'Track your environmental impact and earn recognition',
        details: ['Personal carbon footprint', 'Impact visualization', 'Achievement badges', 'Community ranking']
      },
      {
        icon: <Package />,
        title: 'Waste Trading',
        description: 'Buy and sell recyclable materials through the marketplace',
        details: ['Browsing listings', 'Bid/offer system', 'Transaction history', 'Saved searches']
      },
      {
        icon: <Wallet />,
        title: 'Earnings Dashboard',
        description: 'Track your earnings from waste collection and sales',
        details: ['Earnings analytics', 'Payment methods', 'Withdrawal options', 'Tax documentation']
      },
      {
        icon: <Map />,
        title: 'Collection Routes',
        description: 'Optimize your collection routes for maximum efficiency',
        details: ['Route optimization', 'Collection scheduling', 'Area mapping', 'Performance tracking']
      }
    ]
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
      title: 'Cost-Benefit Analysis',
      rows: [
        {
          feature: 'Monthly Disposal Costs',
          traditional: 'Rwf 50,000 - Rwf 200,000',
          EcoTrade: 'Rwf 0 - Revenue Generated',
          savings: '100%+ savings',
          icon: <DollarSign size={16} />
        },
        {
          feature: 'Collection Efficiency',
          traditional: '40-60%',
          EcoTrade: '85-95%',
          savings: '+40% efficiency',
          icon: <TrendingUp size={16} />
        },
        {
          feature: 'Carbon Reporting',
          traditional: 'Manual estimates',
          EcoTrade: 'Automated tracking',
          savings: '100% accuracy',
          icon: <Leaf size={16} />
        },
        {
          feature: 'Revenue Generation',
          traditional: 'None',
          EcoTrade: 'Rwf 10,000 - Rwf 100,000/mo',
          savings: 'New income stream',
          icon: <ChartBar size={16} />
        },
        {
          feature: 'Admin Time',
          traditional: '10-20 hours/month',
          EcoTrade: '1-2 hours/month',
          savings: '90% cyanuction',
          icon: <Clock size={16} />
        }
      ]
    },
    features: {
      title: 'Feature Comparison',
      rows: [
        {
          feature: 'Digital Waste Listing',
          traditional: '✗',
          EcoTrade: '✓',
          savings: 'Automated process',
          icon: <Upload size={16} />
        },
        {
          feature: 'Route Optimization',
          traditional: '✗',
          EcoTrade: '✓',
          savings: 'AI-powecyan routing',
          icon: <Navigation size={16} />
        },
        {
          feature: 'Real-time Tracking',
          traditional: '✗',
          EcoTrade: '✓',
          savings: 'Live updates',
          icon: <Map size={16} />
        },
        {
          feature: 'Automated Payments',
          traditional: '✗',
          EcoTrade: '✓',
          savings: 'Secure & instant',
          icon: <Wallet size={16} />
        },
        {
          feature: 'Environmental Reporting',
          traditional: 'Manual',
          EcoTrade: 'Automated',
          savings: 'Verified metrics',
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
    }
  ];

  const mobileFeatures = [
    {
      title: 'Offline-First Architecture',
      description: 'Full functionality without internet connection',
      icon: <WifiOff />,
      details: ['Route storage', 'Data collection', 'Photo capture', 'Auto-sync']
    },
    {
      title: 'QR Code Integration',
      description: 'Quick verification and payment processing',
      icon: <QrCode />,
      details: ['Business verification', 'Pickup confirmation', 'Payment processing', 'Inventory tracking']
    },
    {
      title: 'Real-time Notifications',
      description: 'Instant updates on offers, pickups, and payments',
      icon: <Bell />,
      details: ['Push notifications', 'SMS alerts', 'Email updates', 'In-app messages']
    },
    {
      title: 'Location Services',
      description: 'GPS tracking and geofencing for collections',
      icon: <MapPin />,
      details: ['Real-time tracking', 'Geofence alerts', 'Route optimization', 'ETA calculations']
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <ServiceHeroSection roleLoginFeatures={roleLoginFeatures} />
        <ServiceRolesSection
          serviceFeatures={serviceFeatures}
          expandedRole={expandedRole}
          onExpandRole={setExpandedRole}
        />
        <ServiceMobileFeaturesSection mobileFeatures={mobileFeatures} />
        <ServicePricingSection
          pricingTiers={pricingTiers}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
        />
        <ServiceComparisonSection
          comparisons={comparisons}
          activeComparison={activeComparison}
          onChangeComparison={setActiveComparison}
        />
        <ServiceCTASection />
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;
