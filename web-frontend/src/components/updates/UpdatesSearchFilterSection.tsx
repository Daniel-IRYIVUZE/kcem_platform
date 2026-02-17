import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Rss } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: any;
  count: number;
}

interface UpdatesSearchFilterSectionProps {
  tabs: Tab[];
  activeTab: string;
  searchQuery: string;
  showFilters: boolean;
  onActiveTabChange: (tab: string) => void;
  onSearchChange: (query: string) => void;
  onShowFiltersChange: (show: boolean) => void;
}

const UpdatesSearchFilterSection = ({
  tabs,
  activeTab,
  searchQuery,
  showFilters,
  onActiveTabChange,
  onSearchChange,
  onShowFiltersChange
}: UpdatesSearchFilterSectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search updates by role, feature, or keyword..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
          />
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
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
                      onActiveTabChange(tab.id);
                      onShowFiltersChange(false);
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

      {/* Tabs */}
      <div className="hidden sm:flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onActiveTabChange(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-300 hover:text-cyan-600'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default UpdatesSearchFilterSection;
