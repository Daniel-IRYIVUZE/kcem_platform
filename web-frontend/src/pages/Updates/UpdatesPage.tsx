import { useState } from 'react';
import {
  Rocket,
  Newspaper,
  Calendar,
  Users,
  ShoppingBag,
  Recycle,
  Truck,
  User,
  Shield
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import UpdatesHeroSection from '../../components/updates/UpdatesHeroSection';
import UpdatesSearchFilterSection from '../../components/updates/UpdatesSearchFilterSection';
import UpdatesRoleFilterSection from '../../components/updates/UpdatesRoleFilterSection';
import UpdatesGridSection from '../../components/updates/UpdatesGridSection';
import UpdatesSubscriptionSection from '../../components/updates/UpdatesSubscriptionSection';

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
      title: 'v2.1.0: Real-time Bidding Feature Now Live',
      date: 'Feb 1, 2026',
      type: 'feature',
      priority: 'high',
      readTime: '3 min',
      summary: 'Introducing real-time bidding for waste listings with instant price updates and competitive offers.',
      details: [
        'Live bidding interface with countdown timers',
        'Automated bid matching algorithms',
        'Instant notifications for outbid alerts',
        'Secure payment gateway integration'
      ],
      version: '2.1.0',
      impact: 'All users',
      status: 'live',
      roles: ['horeca', 'recycler'],
      dashboardPath: {
        horeca: '/dashboard/hotel/marketplace',
        recycler: '/dashboard/recycler/marketplace'
      }
    },
    {
      id: 2,
      title: 'Scheduled Maintenance: Platform Downtime',
      date: 'Jan 28, 2026',
      type: 'maintenance',
      priority: 'medium',
      readTime: '2 min',
      summary: 'System maintenance scheduled for database optimization and security updates.',
      details: [
        'Database migration to improve query performance',
        'Security patch updates',
        'Backup system enhancements',
        'API response time improvements'
      ],
      version: '2.0.1',
      impact: 'Partial downtime',
      status: 'completed',
      roles: ['all']
    },
    {
      id: 3,
      title: 'Mobile App v1.5: Offline Mode Enhanced',
      date: 'Jan 25, 2026',
      type: 'mobile',
      priority: 'high',
      readTime: '4 min',
      summary: 'Enhanced offline capabilities for drivers working in low-connectivity areas.',
      details: [
        'Improved data sync algorithms',
        'Larger offline cache capacity',
        'Route optimization without internet',
        'Photo verification caching'
      ],
      version: '1.5.0',
      impact: 'Mobile app users',
      status: 'rolling out',
      roles: ['driver'],
      dashboardPath: {
        driver: '/dashboard/driver/offline'
      }
    },
    {
      id: 4,
      title: 'Green Score Analytics Dashboard',
      date: 'Jan 20, 2026',
      type: 'feature',
      priority: 'medium',
      readTime: '5 min',
      summary: 'New analytics dashboard for tracking environmental impact and sustainability metrics.',
      details: [
        'Carbon footprint calculations',
        'Waste diversion metrics',
        'Comparative analytics',
        'Exportable sustainability reports'
      ],
      version: '2.0.3',
      impact: 'Business accounts',
      status: 'beta',
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
      title: 'New REMA Guidelines for Industrial Waste Disposal',
      date: 'Feb 3, 2026',
      category: 'policy',
      source: 'REMA Official',
      readTime: '6 min',
      summary: 'Updated environmental regulations for HORECA sector waste management and classification standards.',
      tags: ['Policy', 'Regulations', 'Compliance'],
      link: 'https://rema.gov.rw',
      relevance: ['horeca', 'recycler', 'admin']
    },
    {
      id: 6,
      title: 'Recycling Market Prices Show 15% Growth',
      date: 'Feb 2, 2026',
      category: 'market',
      source: 'Market Analysis',
      readTime: '4 min',
      summary: 'Strong demand for recycled materials drives price increases across multiple categories.',
      tags: ['Market Trends', 'Pricing', 'Economics'],
      link: '#',
      relevance: ['horeca', 'recycler', 'individual']
    },
    {
      id: 7,
      title: 'COPED Announces Partnership with EcoTrade',
      date: 'Jan 30, 2026',
      category: 'partnership',
      source: 'Press Release',
      readTime: '3 min',
      summary: 'Strategic collaboration to expand waste collection infrastructure across Kigali.',
      tags: ['Partnership', 'Expansion', 'Infrastructure'],
      link: '#',
      relevance: ['all']
    },
    {
      id: 8,
      title: "Rwanda's Circular Economy Roadmap 2026-2030",
      date: 'Jan 28, 2026',
      category: 'policy',
      source: 'Ministry of Environment',
      readTime: '8 min',
      summary: 'National strategy document outlining circular economy goals and implementation plans.',
      tags: ['National Strategy', 'Circular Economy', 'Sustainability'],
      link: '#',
      relevance: ['all']
    }
  ];

  const events = [
    {
      id: 9,
      title: 'Quarterly Recycler Meetup & Networking',
      date: 'Feb 12, 2026',
      time: '14:00 - 17:00',
      location: 'Kigali Convention Center',
      type: 'networking',
      status: 'upcoming',
      attendees: 85,
      description: 'Connect with fellow recyclers, share best practices, and discuss market trends.',
      targetRoles: ['recycler', 'admin']
    },
    {
      id: 10,
      title: 'Green Score Awards Ceremony',
      date: 'Mar 5, 2026',
      time: '18:00 - 21:00',
      location: 'Radisson Blu Hotel',
      type: 'awards',
      status: 'upcoming',
      attendees: 120,
      description: 'Celebrating businesses with outstanding environmental performance and waste reduction.',
      targetRoles: ['horeca', 'recycler', 'admin']
    },
    {
      id: 11,
      title: 'Digital Waste Management Workshop',
      date: 'Mar 15, 2026',
      time: '09:00 - 13:00',
      location: 'ALUSB Campus',
      type: 'workshop',
      status: 'upcoming',
      attendees: 50,
      description: 'Hands-on training for optimizing waste management through digital platforms.',
      targetRoles: ['horeca', 'recycler', 'individual']
    },
    {
      id: 12,
      title: 'HORECA Sustainability Conference',
      date: 'Apr 8, 2026',
      time: '08:00 - 16:00',
      location: 'Marriott Hotel',
      type: 'conference',
      status: 'upcoming',
      attendees: 200,
      description: 'Annual conference focusing on sustainable practices in hospitality industry.',
      targetRoles: ['horeca', 'admin']
    }
  ];

  const roleUpdates = [
    {
      id: 13,
      role: 'horeca',
      title: 'New HORECA Dashboard Features',
      date: 'Feb 5, 2026',
      type: 'feature',
      summary: 'Enhanced waste listing management and revenue analytics',
      features: [
        'Bulk listing creation',
        'Advanced revenue forecasting',
        'Competitor price analysis',
        'Automated reporting'
      ],
      loginPath: '/dashboard/hotel',
      documentation: '/docs/horeca'
    },
    {
      id: 14,
      role: 'recycler',
      title: 'Recycler Route Optimization v2.0',
      date: 'Feb 4, 2026',
      type: 'feature',
      summary: 'Smart route optimization with real-time traffic data',
      features: [
        'Multi-vehicle routing',
        'Traffic-aware scheduling',
        'Fuel cost optimization',
        'Driver performance tracking'
      ],
      loginPath: '/dashboard/recycler',
      documentation: '/docs/recycler'
    },
    {
      id: 15,
      role: 'driver',
      title: 'Mobile App Offline Enhancements',
      date: 'Feb 3, 2026',
      type: 'mobile',
      summary: 'Improved offline functionality for collection verification',
      features: [
        'Offline QR scanning',
        'Photo caching',
        'Route storage',
        'Auto-sync on reconnect'
      ],
      loginPath: '/dashboard/driver',
      documentation: '/docs/driver'
    },
    {
      id: 16,
      role: 'individual',
      title: 'Individual Collector Dashboard Update',
      date: 'Feb 2, 2026',
      type: 'feature',
      summary: 'New features for personal waste collectors',
      features: [
        'Personal impact tracking',
        'Earnings calculator',
        'Collection route planner',
        'Community ranking'
      ],
      loginPath: '/dashboard/individual',
      documentation: '/docs/individual'
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

    items = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

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

    await new Promise(resolve => setTimeout(resolve, 800));

    setSubscriptionStatus('success');
    setSubscriptionEmail('');

    setTimeout(() => setSubscriptionStatus('idle'), 3000);
  };

  const handleBookmark = (id: number) => {
    setBookmarkedUpdates(prev =>
      prev.includes(id) ? prev.filter(bookmarkId => bookmarkId !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setActiveTab('platform');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UpdatesHeroSection />

          <UpdatesSearchFilterSection
            tabs={tabs}
            activeTab={activeTab}
            searchQuery={searchQuery}
            showFilters={showFilters}
            onActiveTabChange={(tab) => setActiveTab(tab as any)}
            onSearchChange={setSearchQuery}
            onShowFiltersChange={setShowFilters}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <UpdatesRoleFilterSection
                roles={roles}
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
              />

              <UpdatesGridSection
                updates={filteredUpdates()}
                activeTab={activeTab}
                bookmarkedUpdates={bookmarkedUpdates}
                expandedUpdate={expandedUpdate}
                selectedRole={selectedRole}
                onBookmark={handleBookmark}
                onExpand={(id) => setExpandedUpdate(expandedUpdate === id ? null : id)}
                onClearFilters={handleClearFilters}
              />
            </div>

            <div className="lg:w-1/4">
              <UpdatesSubscriptionSection
                email={subscriptionEmail}
                status={subscriptionStatus}
                subscriptionPreferences={subscriptionPreferences}
                tabs={tabs}
                onEmailChange={setSubscriptionEmail}
                onPreferenceChange={(key) =>
                  setSubscriptionPreferences(prev => ({ ...prev, [key]: !prev[key] }))
                }
                onSubscribe={handleSubscribe}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UpdatesPage;
