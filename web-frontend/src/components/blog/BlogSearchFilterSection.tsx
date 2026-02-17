import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

interface BlogSearchFilterSectionProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onShowFilters: (show: boolean) => void;
}

const BlogSearchFilterSection = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showFilters,
  onShowFilters
}: BlogSearchFilterSectionProps) => {
  return (
    <section className="mb-8">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles, topics, or authors..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
          />
          <button
            onClick={() => onShowFilters(!showFilters)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600"
            aria-label="Filter articles"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mb-6 overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Categories</h3>
                <button onClick={() => onShowFilters(false)} aria-label="Close filters">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategoryChange(cat);
                      onShowFilters(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BlogSearchFilterSection;
