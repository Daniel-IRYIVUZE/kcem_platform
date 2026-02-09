import { useState } from 'react';
import { 
  Bell, 
  Newspaper, 
  Rocket, 
  Mail, 
  Calendar, 
  ArrowRight, 
  ExternalLink,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Bookmark,
  Share2,
  Download,
  Filter,
  Search,
  Rss,
  FileText,
  Building,
  CheckCircle,
  Truck,
  Recycle,
  ShoppingBag,
  User,
  ChevronDown,
  Navigation,
  Smartphone,
  WifiOff,
  Camera,
  QrCode
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature': return 'from-cyan-500 to-cyan-500';
    case 'maintenance': return 'from-amber-500 to-orange-500';
    case 'policy': return 'from-green-500 to-cyan-500';
    case 'market': return 'from-purple-500 to-cyan-500';
    case 'partnership': return 'from-cyan-500 to-cyan-600';
    case 'security': return 'from-red-500 to-pink-500';
    case 'mobile': return 'from-blue-500 to-indigo-500';
    default: return 'from-slate-500 to-gray-500';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature': return <Rocket size={16} />;
    case 'maintenance': return <Shield size={16} />;
    case 'policy': return <FileText size={16} />;
    case 'market': return <TrendingUp size={16} />;
    case 'partnership': return <Users size={16} />;
    case 'security': return <Shield size={16} />;
    case 'mobile': return <Smartphone size={16} />;
    default: return <Bell size={16} />;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'horeca': return <ShoppingBag size={16} />;
    case 'recycler': return <Recycle size={16} />;
    case 'driver': return <Truck size={16} />;
    case 'individual': return <User size={16} />;
    case 'admin': return <Shield size={16} />;
    case 'all': return <Users size={16} />;
    default: return <Users size={16} />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'horeca': return 'bg-blue-100 text-blue-700';
    case 'recycler': return 'bg-green-100 text-green-700';
    case 'driver': return 'bg-purple-100 text-purple-700';
    case 'individual': return 'bg-cyan-100 text-cyan-700';
    case 'admin': return 'bg-red-100 text-red-700';
    case 'all': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const UpdatesPage = () => {
  const [activeTab, setActiveTab] = useState<'platform' | 'industry' | 'events' | 'role'>('platform');
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionPreferences, setSubscriptionPreferences] = useState({
    platformUpdates: true,
    industryNews: true,
    priceAlerts: false,
    eventInvites: true,
    roleUpdates: true,
    mobileUpdates: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedUpdates, setBookmarkedUpdates] = useState<number[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [expandedUpdate, setExpandedUpdate] = useState<number | null>(null);

  const tabs = [
    { id: 'platform', label: 'Platform Updates', icon: <Rocket size={18} />, count: 8 },
    { id: 'industry', label: 'Industry News', icon: <Newspaper size={18} />, count: 12 },
    { id: 'events', label: 'Events & Calendar', icon: <Calendar size={18} />, count: 5 },
    { id: 'role', label: 'Role Updates', icon: <Users size={18} />, count: 15 }
  ];

  const roles = [
    { id: 'all', label: 'All Roles', icon: <Users size={16} /> },
    { id: 'horeca', label: 'HORECA', icon: <ShoppingBag size={16} /> },
    { id: 'recycler', label: 'Recyclers', icon: <Recycle size={16} /> },
    { id: 'driver', label: 'Drivers', icon: <Truck size={16} /> },
    { id: 'individual', label: 'Individuals', icon: <User size={16} /> },
    { id: 'admin', label: 'Admins', icon: <Shield size={16} /> }
  ];

  const platformUpdates = [
    {
      id: 1,
      title: "v2.1.0: Real-time Bidding Feature Now Live",
      date: "Feb 1, 2026",
      type: "feature",
      priority: "high",
      readTime: "3 min",
      summary: "Introducing real-time bidding for waste listings with instant price updates and competitive offers.",
      details: [
        "Live bidding interface with countdown timers",
        "Automated bid matching algorithms",
        "Instant notifications for outbid alerts",
        "Secure payment gateway integration"
      ],
      version: "2.1.0",
      impact: "All users",
      status: "live",
      roles: ['horeca', 'recycler'],
      dashboardPath: {
        horeca: '/dashboard/hotel/marketplace',
        recycler: '/dashboard/recycler/marketplace'
      }
    },
    {
      id: 2,
      title: "Scheduled Maintenance: Platform Downtime",
      date: "Jan 28, 2026",
      type: "maintenance",
      priority: "medium",
      readTime: "2 min",
      summary: "System maintenance scheduled for database optimization and security updates.",
      details: [
        "Database migration to improve query performance",
        "Security patch updates",
        "Backup system enhancements",
        "API response time improvements"
      ],
      version: "2.0.1",
      impact: "Partial downtime",
      status: "completed",
      roles: ['all']
    },
    {
      id: 3,
      title: "Mobile App v1.5: Offline Mode Enhanced",
      date: "Jan 25, 2026",
      type: "mobile",
      priority: "high",
      readTime: "4 min",
      summary: "Enhanced offline capabilities for drivers working in low-connectivity areas.",
      details: [
        "Improved data sync algorithms",
        "Larger offline cache capacity",
        "Route optimization without internet",
        "Photo verification caching"
      ],
      version: "1.5.0",
      impact: "Mobile app users",
      status: "rolling out",
      roles: ['driver'],
      dashboardPath: {
        driver: '/dashboard/driver/offline'
      }
    },
    {
      id: 4,
      title: "Green Score Analytics Dashboard",
      date: "Jan 20, 2026",
      type: "feature",
      priority: "medium",
      readTime: "5 min",
      summary: "New analytics dashboard for tracking environmental impact and sustainability metrics.",
      details: [
        "Carbon footprint calculations",
        "Waste diversion metrics",
        "Comparative analytics",
        "Exportable sustainability reports"
      ],
      version: "2.0.3",
      impact: "Business accounts",
      status: "beta",
      roles: ['horeca', 'admin'],
      dashboardPath: {
        horeca: '/dashboard/hotel/green-score',
        admin: '/admin/analytics'
      }
    }
  ];

  const industryNews = [
    {
      id: 5,
      title: "New REMA Guidelines for Industrial Waste Disposal",
      date: "Feb 3, 2026",
      category: "policy",
      source: "REMA Official",
      readTime: "6 min",
      summary: "Updated environmental regulations for HORECA sector waste management and classification standards.",
      tags: ["Policy", "Regulations", "Compliance"],
      link: "https://rema.gov.rw",
      relevance: ['horeca', 'recycler', 'admin']
    },
    {
      id: 6,
      title: "Recycling Market Prices Show 15% Growth",
      date: "Feb 2, 2026",
      category: "market",
      source: "Market Analysis",
      readTime: "4 min",
      summary: "Strong demand for recycled materials drives price increases across multiple categories.",
      tags: ["Market Trends", "Pricing", "Economics"],
      link: "#",
      relevance: ['horeca', 'recycler', 'individual']
    },
    {
      id: 7,
      title: "COPED Announces Partnership with KCEM",
      date: "Jan 30, 2026",
      category: "partnership",
      source: "Press Release",
      readTime: "3 min",
      summary: "Strategic collaboration to expand waste collection infrastructure across Kigali.",
      tags: ["Partnership", "Expansion", "Infrastructure"],
      link: "#",
      relevance: ['all']
    },
    {
      id: 8,
      title: "Rwanda's Circular Economy Roadmap 2026-2030",
      date: "Jan 28, 2026",
      category: "policy",
      source: "Ministry of Environment",
      readTime: "8 min",
      summary: "National strategy document outlining circular economy goals and implementation plans.",
      tags: ["National Strategy", "Circular Economy", "Sustainability"],
      link: "#",
      relevance: ['all']
    }
  ];

  const events = [
    {
      id: 9,
      title: "Quarterly Recycler Meetup & Networking",
      date: "Feb 12, 2026",
      time: "14:00 - 17:00",
      location: "Kigali Convention Center",
      type: "networking",
      status: "upcoming",
      attendees: 85,
      description: "Connect with fellow recyclers, share best practices, and discuss market trends.",
      targetRoles: ['recycler', 'admin']
    },
    {
      id: 10,
      title: "Green Score Awards Ceremony",
      date: "Mar 5, 2026",
      time: "18:00 - 21:00",
      location: "Radisson Blu Hotel",
      type: "awards",
      status: "upcoming",
      attendees: 120,
      description: "Celebrating businesses with outstanding environmental performance and waste reduction.",
      targetRoles: ['horeca', 'recycler', 'admin']
    },
    {
      id: 11,
      title: "Digital Waste Management Workshop",
      date: "Mar 15, 2026",
      time: "09:00 - 13:00",
      location: "ALUSB Campus",
      type: "workshop",
      status: "upcoming",
      attendees: 50,
      description: "Hands-on training for optimizing waste management through digital platforms.",
      targetRoles: ['horeca', 'recycler', 'individual']
    },
    {
      id: 12,
      title: "HORECA Sustainability Conference",
      date: "Apr 8, 2026",
      time: "08:00 - 16:00",
      location: "Marriott Hotel",
      type: "conference",
      status: "upcoming",
      attendees: 200,
      description: "Annual conference focusing on sustainable practices in hospitality industry.",
      targetRoles: ['horeca', 'admin']
    }
  ];

  const roleUpdates = [
    {
      id: 13,
      role: 'horeca',
      title: "New HORECA Dashboard Features",
      date: "Feb 5, 2026",
      type: "feature",
      summary: "Enhanced waste listing management and revenue analytics",
      features: [
        "Bulk listing creation",
        "Advanced revenue forecasting",
        "Competitor price analysis",
        "Automated reporting"
      ],
      loginPath: "/dashboard/hotel",
      documentation: "/docs/horeca"
    },
    {
      id: 14,
      role: 'recycler',
      title: "Recycler Route Optimization v2.0",
      date: "Feb 4, 2026",
      type: "feature",
      summary: "AI-powered route optimization with real-time traffic data",
      features: [
        "Multi-vehicle routing",
        "Traffic-aware scheduling",
        "Fuel cost optimization",
        "Driver performance tracking"
      ],
      loginPath: "/dashboard/recycler",
      documentation: "/docs/recycler"
    },
    {
      id: 15,
      role: 'driver',
      title: "Mobile App Offline Enhancements",
      date: "Feb 3, 2026",
      type: "mobile",
      summary: "Improved offline functionality for collection verification",
      features: [
        "Offline QR scanning",
        "Photo caching",
        "Route storage",
        "Auto-sync on reconnect"
      ],
      loginPath: "/dashboard/driver",
      documentation: "/docs/driver"
    },
    {
      id: 16,
      role: 'individual',
      title: "Individual Collector Dashboard Update",
      date: "Feb 2, 2026",
      type: "feature",
      summary: "New features for personal waste collectors",
      features: [
        "Personal impact tracking",
        "Earnings calculator",
        "Collection route planner",
        "Community ranking"
      ],
      loginPath: "/dashboard/individual",
      documentation: "/docs/individual"
    }
  ];

  const filteredUpdates = () => {
    let items: any[] = [];
    switch (activeTab) {
      case 'platform':
        items = platformUpdates;
        break;
      case 'industry':
        items = industryNews;
        break;
      case 'events':
        items = events;
        break;
      case 'role':
        items = roleUpdates;
        break;
      default:
        items = [];
    }

    // Filter by search query
    items = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Filter by role if not 'all'
    if (selectedRole !== 'all') {
      items = items.filter(item => {
        if (activeTab === 'platform') return item.roles?.includes(selectedRole);
        if (activeTab === 'industry') return item.relevance?.includes(selectedRole);
        if (activeTab === 'events') return item.targetRoles?.includes(selectedRole);
        if (activeTab === 'role') return item.role === selectedRole;
        return true;
      });
    }

    return items;
  };

  const handleSubscribe = async () => {
    if (!subscriptionEmail || !subscriptionEmail.includes('@')) {
      setSubscriptionStatus('error');
      return;
    }

    setSubscriptionStatus('loading');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSubscriptionStatus('success');
    setSubscriptionEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => setSubscriptionStatus('idle'), 3000);
  };

  const handleBookmark = (id: number) => {
    setBookmarkedUpdates(prev => 
      prev.includes(id) ? prev.filter(bookmarkId => bookmarkId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-100 to-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Bell size={18} />
              Role-Specific Updates & Announcements
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Stay <span className="text-cyan-600">Informed</span> by Role
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Latest platform updates, industry news, and events tailored to your role in Rwanda's circular economy
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search updates by role, feature, or keyword..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600"
                >
                  <Filter size={20} />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-cyan-500 hover:text-cyan-600 transition-colors flex items-center gap-2">
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button className="px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-cyan-500 hover:text-cyan-600 transition-colors flex items-center gap-2">
                  <Rss size={18} />
                  <span className="hidden sm:inline">RSS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mb-6 overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setShowFilters(false);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Tabs */}
              <div className="hidden sm:flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-300 hover:text-cyan-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Role Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Filter by Role:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedRole === role.id
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {role.icon}
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Updates Grid */}
              <div className="space-y-6">
                {filteredUpdates().length > 0 ? (
                  filteredUpdates().map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {activeTab === 'platform' ? (
                        <PlatformUpdateCard 
                          update={item} 
                          isBookmarked={bookmarkedUpdates.includes(item.id)}
                          onBookmark={() => handleBookmark(item.id)}
                          expanded={expandedUpdate === item.id}
                          onExpand={() => setExpandedUpdate(expandedUpdate === item.id ? null : item.id)}
                        />
                      ) : activeTab === 'industry' ? (
                        <IndustryNewsCard 
                          news={item} 
                          isBookmarked={bookmarkedUpdates.includes(item.id)}
                          onBookmark={() => handleBookmark(item.id)}
                          selectedRole={selectedRole}
                        />
                      ) : activeTab === 'events' ? (
                        <EventCard event={item} selectedRole={selectedRole} />
                      ) : (
                        <RoleUpdateCard 
                          update={item} 
                          isBookmarked={bookmarkedUpdates.includes(item.id)}
                          onBookmark={() => handleBookmark(item.id)}
                        />
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Newspaper className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No updates found</h3>
                    <p className="text-slate-500 mb-6">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRole('all');
                        setActiveTab('platform');
                      }}
                      className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Version History */}
              {activeTab === 'platform' && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Shield size={24} />
                    Version History by Role Impact
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                          <tr>
                            <th className="text-left p-4 font-bold text-slate-900">Version</th>
                            <th className="text-left p-4 font-bold text-slate-900">Date</th>
                            <th className="text-left p-4 font-bold text-slate-900">Features</th>
                            <th className="text-left p-4 font-bold text-slate-900">Roles Impacted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { version: '2.1.0', date: 'Feb 1, 2026', features: ['Real-time bidding', 'Enhanced analytics'], roles: ['horeca', 'recycler'] },
                            { version: '2.0.3', date: 'Jan 20, 2026', features: ['Green Score dashboard', 'Bug fixes'], roles: ['horeca', 'admin'] },
                            { version: '2.0.1', date: 'Jan 15, 2026', features: ['Performance improvements', 'Security updates'], roles: ['all'] },
                            { version: '1.9.0', date: 'Dec 28, 2025', features: ['Mobile app v1.5', 'Offline mode'], roles: ['driver'] },
                          ].map((version, index) => (
                            <tr key={version.version} className={`border-t border-slate-100 ${index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                              <td className="p-4">
                                <div className="font-mono font-bold text-cyan-600">v{version.version}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-slate-600">{version.date}</div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  {version.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                      <CheckCircle size={12} className="text-cyan-500" />
                                      {feature}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {version.roles.map(role => (
                                    <span key={role} className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                                      {getRoleIcon(role)}
                                      <span className="ml-1">
                                        {role === 'horeca' ? 'HORECA' : 
                                         role === 'recycler' ? 'Recycler' : 
                                         role === 'driver' ? 'Driver' : 
                                         role === 'admin' ? 'Admin' : 'All'}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/4 space-y-8">
              {/* Subscribe Widget */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Mail size={24} className="text-cyan-300" />
                  <h3 className="text-xl font-bold">Role-Specific Updates</h3>
                </div>
                
                <p className="text-cyan-100/80 text-sm mb-6">
                  Get updates tailored to your role. Select which notifications you want to receive.
                </p>

                {subscriptionStatus === 'success' ? (
                  <div className="p-4 bg-cyan-500/20 border border-cyan-500/30 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-cyan-300" />
                      <div>
                        <p className="font-medium text-cyan-100">Subscribed successfully!</p>
                        <p className="text-sm text-cyan-200/80">Check your email for confirmation.</p>
                      </div>
                    </div>
                  </div>
                ) : subscriptionStatus === 'error' ? (
                  <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl mb-4">
                    <p className="text-rose-100 text-sm">Please enter a valid email address</p>
                  </div>
                ) : null}

                <div className="space-y-4 mb-6">
                  <input
                    type="email"
                    value={subscriptionEmail}
                    onChange={(e) => setSubscriptionEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-cyan-800/50 border border-cyan-700 text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={subscriptionStatus === 'loading'}
                  />
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subscriptionPreferences.platformUpdates}
                        onChange={(e) => setSubscriptionPreferences(prev => ({ ...prev, platformUpdates: e.target.checked }))}
                        className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      Platform Updates
                    </label>
                    <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subscriptionPreferences.industryNews}
                        onChange={(e) => setSubscriptionPreferences(prev => ({ ...prev, industryNews: e.target.checked }))}
                        className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      Industry News
                    </label>
                    <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subscriptionPreferences.roleUpdates}
                        onChange={(e) => setSubscriptionPreferences(prev => ({ ...prev, roleUpdates: e.target.checked }))}
                        className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      Role-Specific Updates
                    </label>
                    <label className="flex items-center gap-3 text-sm text-cyan-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subscriptionPreferences.mobileUpdates}
                        onChange={(e) => setSubscriptionPreferences(prev => ({ ...prev, mobileUpdates: e.target.checked }))}
                        className="w-4 h-4 rounded border-cyan-700 bg-cyan-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      Mobile App Updates
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={subscriptionStatus === 'loading'}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {subscriptionStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>

                <p className="text-xs text-cyan-300/60 text-center mt-4">
                  Receive updates specific to your dashboard role
                </p>
              </motion.div>

              {/* Role Dashboard Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Navigation size={18} />
                  Quick Dashboard Access
                </h4>
                <div className="space-y-3">
                  {[
                    { role: 'horeca', label: 'HORECA Dashboard', path: '/dashboard/hotel', icon: <ShoppingBag size={16} /> },
                    { role: 'recycler', label: 'Recycler Dashboard', path: '/dashboard/recycler', icon: <Recycle size={16} /> },
                    { role: 'driver', label: 'Driver Dashboard', path: '/dashboard/driver', icon: <Truck size={16} /> },
                    { role: 'individual', label: 'Individual Dashboard', path: '/dashboard/individual', icon: <User size={16} /> },
                    { role: 'admin', label: 'Admin Dashboard', path: '/admin', icon: <Shield size={16} /> },
                  ].map((dashboard) => (
                    <a
                      key={dashboard.role}
                      href={dashboard.path}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 hover:text-cyan-600 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:border-cyan-300 group-hover:text-cyan-600">
                        {dashboard.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 group-hover:text-cyan-700">{dashboard.label}</div>
                        <div className="text-xs text-slate-500 font-mono">{dashboard.path}</div>
                      </div>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-cyan-600" />
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Platform Statistics
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Updates</span>
                    <span className="font-bold text-cyan-600">{tabs.reduce((sum, tab) => sum + tab.count, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Active Users</span>
                    <span className="font-bold text-cyan-600">1.2k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Role Distribution</span>
                    <span className="font-bold text-cyan-600">5 roles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Mobile App Users</span>
                    <span className="font-bold text-amber-600">65%</span>
                  </div>
                </div>
              </motion.div>

              {/* Mobile App Banner */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone size={24} className="text-blue-300" />
                  <div>
                    <h4 className="font-bold text-lg">Mobile App Updates</h4>
                    <p className="text-blue-200/80 text-sm">Role-specific mobile features</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <WifiOff size={14} className="text-blue-300" />
                    <span>Offline mode for drivers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <QrCode size={14} className="text-blue-300" />
                    <span>QR verification for all roles</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Camera size={14} className="text-blue-300" />
                    <span>Photo upload for HORECA</span>
                  </div>
                </div>
                <button className="w-full bg-white text-blue-900 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                  Download App
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

const PlatformUpdateCard = ({ update, isBookmarked, onBookmark, expanded, onExpand }: any) => {
  const getDashboardLink = (update: any, role: string) => {
    if (update.dashboardPath && update.dashboardPath[role]) {
      return update.dashboardPath[role];
    }
    switch (role) {
      case 'horeca': return '/dashboard/hotel';
      case 'recycler': return '/dashboard/recycler';
      case 'driver': return '/dashboard/driver';
      case 'individual': return '/dashboard/individual';
      case 'admin': return '/admin';
      default: return '/dashboard';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className={`bg-gradient-to-r ${getTypeColor(update.type)} text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2`}>
                {getTypeIcon(update.type)}
                {update.type.toUpperCase()}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Clock size={12} />
                {update.readTime}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                update.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                update.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-cyan-100 text-cyan-700'
              }`}>
                {update.priority}
              </div>
              <div className="flex flex-wrap gap-1">
                {update.roles?.map((role: string) => (
                  <span key={role} className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                    <span className="ml-1">
                      {role === 'horeca' ? 'HORECA' : 
                       role === 'recycler' ? 'Recycler' : 
                       role === 'driver' ? 'Driver' : 
                       role === 'admin' ? 'Admin' : 'All'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{update.title}</h3>
            <p className="text-slate-600 mb-4">{update.summary}</p>
            
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {update.details.map((detail: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                        {detail}
                      </div>
                    ))}
                  </div>
                  
                  {update.roles && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm font-medium text-slate-700 mb-2">Role-Specific Impact:</div>
                      <div className="flex flex-wrap gap-2">
                        {update.roles.map((role: string) => (
                          <a
                            key={role}
                            href={update.dashboardPath?.[role] || getDashboardLink(update, role)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${getRoleColor(role)} hover:opacity-90`}
                          >
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              <span>
                                {role === 'horeca' ? 'HORECA Dashboard' : 
                                 role === 'recycler' ? 'Recycler Dashboard' : 
                                 role === 'driver' ? 'Driver Dashboard' : 
                                 role === 'admin' ? 'Admin Dashboard' : 'View Dashboard'}
                              </span>
                              <ArrowRight size={12} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex sm:flex-col items-center gap-3">
            <button
              onClick={onBookmark}
              className={`p-2.5 rounded-xl transition-colors ${
                isBookmarked 
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                  : 'bg-slate-100 text-slate-400 hover:text-cyan-600 hover:bg-slate-200'
              }`}
            >
              {isBookmarked ? <Bookmark size={18} className="fill-current" /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={onExpand}
              className={`p-2.5 rounded-xl transition-colors ${
                expanded ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400 hover:text-cyan-600 hover:bg-slate-200'
              }`}
            >
              {expanded ? <ChevronDown size={18} className="rotate-180" /> : <ChevronDown size={18} />}
            </button>
            <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:text-cyan-600 hover:bg-slate-200 transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Version: <span className="font-bold text-slate-700">{update.version}</span></span>
            <span>Impact: <span className="font-bold text-slate-700">{update.impact}</span></span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              update.status === 'live' ? 'bg-cyan-100 text-cyan-700' :
              update.status === 'rolling out' ? 'bg-cyan-100 text-cyan-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {update.status}
            </span>
          </div>
          <div className="text-sm text-slate-500">{update.date}</div>
        </div>
      </div>
    </div>
  );
};

const IndustryNewsCard = ({ news, isBookmarked, onBookmark, selectedRole }: any) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className={`bg-gradient-to-r ${getTypeColor(news.category)} text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2`}>
                {getTypeIcon(news.category)}
                {news.category.toUpperCase()}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Clock size={12} />
                {news.readTime}
              </div>
              <div className="text-xs text-slate-500">{news.source}</div>
              <div className="flex flex-wrap gap-1">
                {news.relevance?.map((role: string) => (
                  <span key={role} className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                  </span>
                ))}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{news.title}</h3>
            <p className="text-slate-600 mb-4">{news.summary}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {news.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex sm:flex-col items-center gap-3">
            <button
              onClick={onBookmark}
              className={`p-2.5 rounded-xl transition-colors ${
                isBookmarked 
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                  : 'bg-slate-100 text-slate-400 hover:text-cyan-600 hover:bg-slate-200'
              }`}
            >
              {isBookmarked ? <Bookmark size={18} className="fill-current" /> : <Bookmark size={18} />}
            </button>
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:text-cyan-600 hover:bg-slate-200 transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-cyan-600 font-medium hover:gap-3 transition-all">
              Read Full Story
              <ArrowRight size={16} />
            </button>
            {selectedRole !== 'all' && news.relevance?.includes(selectedRole) && (
              <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded">
                Relevant to your role
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500">{news.date}</div>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ event, selectedRole }: any) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-cyan-100 text-cyan-700';
      case 'awards': return 'bg-amber-100 text-amber-700';
      case 'workshop': return 'bg-green-100 text-green-700';
      case 'conference': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="lg:w-1/4">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-700">{event.date.split(' ')[1]}</div>
              <div className="text-sm font-medium text-slate-700">{event.date.split(' ')[0]}</div>
              <div className="text-xs text-slate-500 mt-2">{event.time}</div>
            </div>
          </div>
          
          <div className="lg:w-3/4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getEventTypeColor(event.type)}`}>
                {event.type.toUpperCase()}
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={14} />
                {event.attendees} attending
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Building size={14} />
                {event.location}
              </div>
              <div className="flex flex-wrap gap-1">
                {event.targetRoles?.map((role: string) => (
                  <span key={role} className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                  </span>
                ))}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
            <p className="text-slate-600 mb-4">{event.description}</p>
            
            {selectedRole !== 'all' && event.targetRoles?.includes(selectedRole) && (
              <div className="mb-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="flex items-center gap-2 text-cyan-700 text-sm">
                  <Bell size={14} />
                  <span>This event is specifically relevant to your role</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                Register Now
              </button>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <button className="flex items-center gap-2 hover:text-cyan-600 transition-colors">
                  <Calendar size={14} />
                  Add to Calendar
                </button>
                <button className="flex items-center gap-2 hover:text-cyan-600 transition-colors">
                  <Share2 size={14} />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleUpdateCard = ({ update, isBookmarked, onBookmark }: any) => {
  const roleNames: any = {
    horeca: 'HORECA Business',
    recycler: 'Recycling Company',
    driver: 'Logistics Driver',
    individual: 'Individual Collector',
    admin: 'Platform Admin'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getRoleColor(update.role)} flex items-center gap-2`}>
                {getRoleIcon(update.role)}
                {roleNames[update.role]}
              </span>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                update.type === 'feature' ? 'bg-cyan-100 text-cyan-700' :
                update.type === 'mobile' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {update.type.toUpperCase()}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{update.title}</h3>
            <p className="text-slate-600 mb-4">{update.summary}</p>
            
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {update.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-cyan-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onBookmark}
              className={`p-2.5 rounded-xl transition-colors ${
                isBookmarked 
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                  : 'bg-slate-100 text-slate-400 hover:text-cyan-600 hover:bg-slate-200'
              }`}
            >
              {isBookmarked ? <Bookmark size={18} className="fill-current" /> : <Bookmark size={18} />}
            </button>
            <a
              href={update.documentation}
              className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:text-cyan-600 hover:bg-slate-200 transition-colors"
            >
              <FileText size={18} />
            </a>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <a
              href={update.loginPath}
              className="flex items-center gap-2 text-cyan-600 font-medium hover:gap-3 transition-all"
            >
              Access {roleNames[update.role]} Dashboard
              <ArrowRight size={16} />
            </a>
            <span className="text-xs text-slate-500 font-mono">{update.loginPath}</span>
          </div>
          <div className="text-sm text-slate-500">{update.date}</div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;