import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Newspaper,
  Rocket,
  ExternalLink,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Bookmark,
  Share2,
  FileText,
  Building,
  CheckCircle,
  Truck,
  Recycle,
  ShoppingBag,
  User,
  ChevronDown,
  ArrowRight,
  Calendar,
  Smartphone
} from 'lucide-react';

interface UpdatesGridSectionProps {
  updates: any[];
  activeTab: string;
  bookmarkedUpdates: number[];
  expandedUpdate: number | null;
  selectedRole: string;
  onBookmark: (id: number) => void;
  onExpand: (id: number) => void;
  onClearFilters: () => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature': return 'from-cyan-500 to-cyan-500';
    case 'maintenance': return 'from-amber-500 to-orange-500';
    case 'policy': return 'from-green-500 to-cyan-500';
    case 'market': return 'from-purple-500 to-cyan-500';
    case 'partnership': return 'from-cyan-500 to-cyan-600';
    case 'security': return 'from-red-500 to-pink-500';
    case 'mobile': return 'from-cyan-500 to-indigo-500';
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
    case 'horeca': return 'bg-cyan-100 text-cyan-700';
    case 'recycler': return 'bg-green-100 text-green-700';
    case 'driver': return 'bg-purple-100 text-purple-700';
    case 'individual': return 'bg-cyan-100 text-cyan-700';
    case 'admin': return 'bg-red-100 text-red-700';
    case 'all': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const PlatformUpdateCard = ({ update, isBookmarked, onBookmark, expanded, onExpand }: any) => {
  const getDashboardLink = (updateItem: any, role: string) => {
    if (updateItem.dashboardPath && updateItem.dashboardPath[role]) {
      return updateItem.dashboardPath[role];
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
                update.type === 'mobile' ? 'bg-cyan-100 text-cyan-700' :
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

const UpdatesGridSection = ({
  updates,
  activeTab,
  bookmarkedUpdates,
  expandedUpdate,
  selectedRole,
  onBookmark,
  onExpand,
  onClearFilters
}: UpdatesGridSectionProps) => {
  if (updates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <Newspaper className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-700 mb-2">No updates found</h3>
        <p className="text-slate-500 mb-6">Try adjusting your search or filter criteria</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((item, index) => (
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
              onBookmark={() => onBookmark(item.id)}
              expanded={expandedUpdate === item.id}
              onExpand={() => onExpand(item.id)}
            />
          ) : activeTab === 'industry' ? (
            <IndustryNewsCard
              news={item}
              isBookmarked={bookmarkedUpdates.includes(item.id)}
              onBookmark={() => onBookmark(item.id)}
              selectedRole={selectedRole}
            />
          ) : activeTab === 'events' ? (
            <EventCard event={item} selectedRole={selectedRole} />
          ) : (
            <RoleUpdateCard
              update={item}
              isBookmarked={bookmarkedUpdates.includes(item.id)}
              onBookmark={() => onBookmark(item.id)}
            />
          )}
        </motion.div>
      ))}

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
                    { version: '1.9.0', date: 'Dec 28, 2025', features: ['Mobile app v1.5', 'Offline mode'], roles: ['driver'] }
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
  );
};

export default UpdatesGridSection;
